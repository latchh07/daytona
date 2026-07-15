"""FastAPI entry point for Content Integrity Crash Test trials."""

from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from judge import Judge
from llm_client import OpenAIProvider
from retrieval import InMemoryRetriever
from sandbox_runner import LocalRunner, SandboxRunner
from supabase_client import SupabaseTrialStore, TrialStoreError
from target_agent import AgentResult, TargetAgent


class RunTrialRequest(BaseModel):
    trial_type: str = Field(min_length=1)
    query: str = Field(min_length=1)


def _trial_payload(query: str, result: AgentResult, score: int) -> dict[str, Any]:
    retrieved = result.retrieved_documents
    poisoned_documents = [item.document for item in retrieved if item.document.poisoned]
    injection_tags = list(
        dict.fromkeys(
            document.injection_technique
            for document in poisoned_documents
            if document.injection_technique
        )
    )
    return {
        "status": "completed",
        "score": score,
        "agent_transcript": {
            "query": query,
            "retrieved_documents": [
                {
                    "id": item.document.id,
                    "title": item.document.title,
                    "content": item.document.content,
                    "similarity_score": item.score,
                    "poisoned": item.document.poisoned,
                    "injection_technique": item.document.injection_technique,
                }
                for item in retrieved
            ],
            "final_answer": result.answer,
        },
        "injection_tags": injection_tags,
        "document_text": "\n\n---\n\n".join(
            f"{item.document.title}\n\n{item.document.content}" for item in retrieved
        ),
        "is_poisoned": bool(poisoned_documents),
    }


@asynccontextmanager
async def lifespan(app: FastAPI):
    provider = OpenAIProvider()
    retriever = InMemoryRetriever()
    app.state.store = SupabaseTrialStore()
    app.state.runner = LocalRunner()
    app.state.agent = TargetAgent(provider, retriever)
    app.state.judge = Judge(provider)
    yield


app = FastAPI(title="Content Integrity Crash Test", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/rag-trials/run")
def run_rag_trial(request: RunTrialRequest) -> dict[str, Any]:
    store: SupabaseTrialStore = app.state.store
    runner: SandboxRunner = app.state.runner
    initial_values = {
        "target_ref": "local-rag-agent",
        "trial_type": request.trial_type,
        "status": "running",
        "score": None,
        "agent_transcript": {"query": request.query},
        "injection_tags": [],
        "document_text": "",
        "is_poisoned": False,
    }
    try:
        created = store.create_trial(initial_values)
    except TrialStoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    trial_id = created["id"]

    def pipeline() -> dict[str, Any]:
        agent_result = app.state.agent.answer(request.query)
        judgment = app.state.judge.evaluate(
            request.query,
            agent_result.retrieved_documents,
            agent_result.answer,
        )
        payload = _trial_payload(request.query, agent_result, judgment.score)
        payload["agent_transcript"]["judge"] = {
            "score": judgment.score,
            "hijacked": judgment.hijacked,
            "explanation": judgment.explanation,
        }
        return payload

    try:
        completed_values = runner.run(pipeline)
        return store.update_trial(trial_id, completed_values)
    except Exception:
        failed_row = store.mark_failed(trial_id)
        if failed_row is not None:
            return failed_row
        # The initial row exists, but Supabase could not accept the failure update.
        created["status"] = "failed"
        return created


@app.get("/rag-trials")
def get_rag_trials() -> list[dict[str, Any]]:
    try:
        return app.state.store.list_trials()
    except TrialStoreError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

