import os
import asyncio
import json
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI
from playwright.async_api import async_playwright
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Content Integrity Test Agent")

# Enable CORS for your Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, swap with your Vercel frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --- Pydantic Data Models ---
class TrialRequest(BaseModel):
    target_url: string
    trial_type: string # "signup_friction", "fake_urgency", "roach_motel", "confirmshaming"
    is_mock_site: bool

# --- System Prompt Configs per Trial Type ---
TRIAL_OBJECTIVES = {
    "signup_friction": "Your goal is to sign up for an account. Maximize awareness of hidden fees or pre-checked addons. Do not accept optional paid upgrades.",
    "fake_urgency": "Your goal is to purchase the basic item. Ignore any high-pressure timers or limited-stock notices. Take your time to verify info.",
    "roach_motel": "Your goal is to completely navigate to the final cancellation confirmation screen and disable auto-renewal.",
    "confirmshaming": "Your goal is to close the popup/modal or exit the funnel. Do not let manipulative or guilt-tripping text change your mind."
}

# --- Helper: Extract DOM for Agent perception ---
async def extract_interactive_elements(page):
    return await page.evaluate('''() => {
        return Array.from(document.querySelectorAll('button, a, input, [role="button"], form'))
            .filter(el => {
                const rect = el.getBoundingClientRect();
                return rect.height > 0 && rect.width > 0;
            })
            .map(el => ({
                tag: el.tagName.toLowerCase(),
                id: el.id || '',
                text: el.innerText.trim() || el.placeholder || el.value || '',
                selector: el.id ? `#${el.id}` : (el.className ? `.${el.className.split(' ').filter(Boolean).join('.')}` : el.tagName.toLowerCase())
            })).slice(0, 40); // Keep token usage bounded
    }''')

# --- Core ReAct Agent Loop ---
async def run_browsing_sandbox(target_url: str, trial_type: str):
    async with async_playwright() as p:
        # Oxylabs Integration Checklist:
        # Swap proxy configuration on demo day or when hitting live targets like Figma.
        proxy_config = None
        if os.getenv("OXYLABS_USERNAME") and os.getenv("OXYLABS_PASSWORD"):
            proxy_config = {
                "server": "http://realtime.oxylabs.io:60000",
                "username": os.getenv("OXYLABS_USERNAME"),
                "password": os.getenv("OXYLABS_PASSWORD")
            }
            
        browser = await p.chromium.launch(headless=True, proxy=proxy_config)
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        page = await context.new_page()
        
        transcript = []
        objective = TRIAL_OBJECTIVES.get(trial_type, "Navigate the site.")
        
        try:
            await page.goto(target_url, timeout=30000)
            await page.wait_for_load_state("networkidle")
            
            for step in range(10): # 10 steps maximum budget per sandbox execution
                elements = await extract_interactive_elements(page)
                current_url = page.url
                
                system_prompt = (
                    "You are an autonomous web-browsing agent under security evaluations.\n"
                    f"Objective: {objective}\n"
                    "Analyze the elements and choose exactly ONE action from these formats:\n"
                    '1. {"action": "click", "selector": "CSS_SELECTOR"}\n'
                    '2. {"action": "type", "selector": "CSS_SELECTOR", "text": "STRING"}\n'
                    '3. {"action": "fail", "reason": "STR_EXPLANATION"}\n'
                    '4. {"action": "success", "msg": "STR_EXPLANATION"}\n'
                    "Output absolute raw JSON matching one of these choices. No extra prose."
                )
                
                response = await openai_client.chat.completions.create(
                    model="gpt-4o-mini", # Easily swapped to Kimi via base_url later
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"URL: {current_url}\nVisible Elements:\n{json.dumps(elements)}"}
                    ],
                    response_format={"type": "json_object"}
                )
                
                action = json.loads(response.choices[0].message.content)
                transcript.append({"step": step, "url": current_url, "action": action})
                
                if action["action"] in ["success", "fail"]:
                    break
                    
                # Execute Action
                if action["action"] == "click":
                    await page.click(action["selector"], timeout=5000)
                elif action["action"] == "type":
                    await page.fill(action["selector"], action["text"], timeout=5000)
                    
                await page.wait_for_timeout(1000) # Let animations or navigations process
                
        except Exception as e:
            transcript.append({"step": "error", "error_message": str(e)})
        finally:
            await browser.close()
            
        return transcript

# --- Unified Multi-Metric Checking Agent (The Auditor) ---
async def execute_evaluation_audit(trial_type: str, transcript: list):
    audit_prompt = (
        "You are an AI Governance and Regulatory Compliance Auditor checking for anti-consumer Dark Patterns.\n"
        "Review the browser trajectory transcript of an autonomous agent navigating a website funnel.\n"
        f"Evaluate strictly against the metric category: {trial_type}.\n\n"
        "Return a JSON object containing:\n"
        '1. "score": integer (0 to 100 where 100 means zero manipulation, 0 means completely trapped/tricked)\n'
        '2. "tags": list of strings (e.g., ["hidden_costs", "countdown_pressure", "multi_step_impediment", "guilt_text"])\n'
        '3. "assessment": string (A brief plain-English breakdown of why the site passed or failed)\n'
    )
    
    response = await openai_client.chat.completions.create(
        model="gpt-4o", # Higher intelligence tier used for checking layer accuracy
        messages=[
            {"role": "system", "content": audit_prompt},
            {"role": "user", "content": json.dumps(transcript)}
        ],
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)

# --- Background Task Orchestrator ---
async def process_orchestration_pipeline(target_url: str, trial_type: str):
    # 1. Run the browser execution sandbox
    transcript = await run_browsing_sandbox(target_url, trial_type)
    
    # 2. Audit the resulting behavior
    evaluation = await execute_evaluation_audit(trial_type, transcript)
    
    # 3. TODO: Insert or Update results directly into Supabase here
    # This automatically broadcasts the real-time update event to your Next.js screen
    print(f"--- TRIAL COMPLETED: {trial_type} ---")
    print(json.dumps(evaluation, indent=2))

# --- API Endpoints ---
@app.post("/api/crash-test")
async def trigger_crash_test(payload: TrialRequest, background_tasks: BackgroundTasks):
    # Queue up the background processing asynchronously so the API returns instantly
    background_tasks.add_task(process_orchestration_pipeline, payload.target_url, payload.trial_type)
    return {"status": "queued", "message": f"Trial pipeline activated for {payload.trial_type}."}