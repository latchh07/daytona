"""In-memory semantic retrieval using OpenAI embeddings."""

from dataclasses import dataclass
from math import sqrt
from typing import Sequence

from dotenv import load_dotenv
from openai import OpenAI

from documents import DOCUMENTS, Document


@dataclass(frozen=True)
class RetrievalResult:
    document: Document
    score: float


def cosine_similarity(left: Sequence[float], right: Sequence[float]) -> float:
    if len(left) != len(right):
        raise ValueError("Embedding vectors must have equal dimensions")
    dot_product = sum(a * b for a, b in zip(left, right))
    left_norm = sqrt(sum(value * value for value in left))
    right_norm = sqrt(sum(value * value for value in right))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return dot_product / (left_norm * right_norm)


class InMemoryRetriever:
    """Embed a document corpus once and rank it locally for each query."""

    def __init__(
        self,
        documents: Sequence[Document] = DOCUMENTS,
        *,
        client: OpenAI | None = None,
        embedding_model: str = "text-embedding-3-small",
    ) -> None:
        load_dotenv()
        self.client = client or OpenAI()
        self.embedding_model = embedding_model
        self.documents = list(documents)
        self._embeddings = self._embed_texts(
            [f"{doc.title}\n\n{doc.content}" for doc in self.documents]
        )

    def _embed_texts(self, texts: Sequence[str]) -> list[list[float]]:
        response = self.client.embeddings.create(
            model=self.embedding_model,
            input=list(texts),
        )
        ordered = sorted(response.data, key=lambda item: item.index)
        return [item.embedding for item in ordered]

    def retrieve(self, query: str, k: int = 3) -> list[RetrievalResult]:
        if not query.strip():
            raise ValueError("Query must not be empty")
        if k < 1:
            raise ValueError("k must be at least 1")

        query_embedding = self._embed_texts([query])[0]
        results = [
            RetrievalResult(document=document, score=cosine_similarity(query_embedding, embedding))
            for document, embedding in zip(self.documents, self._embeddings)
        ]
        return sorted(results, key=lambda result: result.score, reverse=True)[:k]


def retrieve(query: str, k: int = 3) -> list[RetrievalResult]:
    """Convenience entry point for a one-off retrieval run."""
    return InMemoryRetriever().retrieve(query, k=k)

