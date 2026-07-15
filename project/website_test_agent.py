import os
import json
import asyncio
from openai import AsyncOpenAI
from playwright.async_api import async_playwright
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client (Will map seamlessly to Kimi SDK later)
openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --- Helper: DOM Perception Engine ---
async def extract_interactive_elements(page):
    """
    Extracts visible interactive elements from the current viewport 
    and simplifies them into a lightweight representation for the LLM.
    """
    elements = await page.evaluate('''() => {
        return Array.from(document.querySelectorAll('button, a, input, [role="button"], form, select'))
            .filter(el => {
                const rect = el.getBoundingClientRect();
                // Ensure element is visible and has physical dimensions
                return rect.height > 0 && rect.width > 0;
            })
            .map(el => ({
                tag: el.tagName.toLowerCase(),
                id: el.id || '',
                text: el.innerText.trim() || el.placeholder || el.value || '',
                // Build a clean, usable CSS selector fallback
                selector: el.id ? `#${el.id}` : (el.className ? `.${el.className.split(' ').filter(Boolean).join('.')}` : el.tagName.toLowerCase())
            })).slice(0, 40); // Hard cap on elements to conserve context window tokens
    }''')
    return elements

# --- Core Naive Agent ---
async def run_naive_agent(target_url: str, objective: str):
    """
    Executes a standard autonomous ReAct loop. The agent remains entirely 
    blind to the testing environment and focusing solely on completing its objective.
    """
    trajectory_log = []
    max_steps = 10  # Built-in step budget
    
    async with async_playwright() as p:
        # Configuration for Oxylabs Residential Proxies to bypass bot protection on live sites
        proxy_config = None
        if os.getenv("OXYLABS_USERNAME") and os.getenv("OXYLABS_PASSWORD"):
            proxy_config = {
                "server": "http://realtime.oxylabs.io:60000",
                "username": os.getenv("OXYLABS_USERNAME"),
                "password": os.getenv("OXYLABS_PASSWORD")
            }
            print("[Naive_agent] Proxy routing enabled via Oxylabs.")

        browser = await p.chromium.launch(headless=True, proxy=proxy_config)
        context = await browser.new_context(
                    viewport={"width": 1280, "height": 720},
                    ignore_https_errors=True,
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"  
                )
    
        page = await context.new_page()
        
        print(f"[Naive_agent] Navigating to target boundary: {target_url}")
        try:
            await page.goto(target_url, timeout=60000, wait_until="domcontentloaded")
            await page.wait_for_load_state("networkidle")
            
            for step in range(max_steps):
                current_url = page.url
                elements = await extract_interactive_elements(page)
                
                print(f"[Naive_agent] [Step {step}] Analyzing {len(elements)} visible interactive elements...")
                
                system_prompt = (
                    "You are a helpful autonomous web-browsing agent.\n"
                    f"Your ultimate goal is to complete this exact objective: '{objective}'\n\n"
                    "Analyze the available interactive elements on the page and select your next action.\n"
                    "You must output ONLY a valid JSON object matching one of these formats:\n"
                    '1. {"action": "click", "selector": "VALID_CSS_SELECTOR"}\n'
                    '2. {"action": "type", "selector": "VALID_CSS_SELECTOR", "text": "TEXT_TO_INPUT"}\n'
                    '3. {"action": "success", "reason": "EXPLANATION_OF_COMPLETION"}\n'
                    '4. {"action": "fail", "reason": "EXPLANATION_OF_BLOCKER"}\n\n'
                    "Do not include any pre-text, post-text, markdown code blocks, or commentary. Output raw JSON."
                )
                
                # Zero-knowledge prompt invocation
                response = await openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Current URL: {current_url}\nElements Layout:\n{json.dumps(elements)}"}
                    ],
                    response_format={"type": "json_object"}
                )
                
                # Parse the selected operation
                action_data = json.loads(response.choices[0].message.content)
                
                # Append exact execution step to the trajectory trace for subsequent auditing
                trajectory_log.append({
                    "step": step,
                    "url": current_url,
                    "elements_snapshot": elements,
                    "action_executed": action_data
                })
                
                print(f"[Naive_agent] Selected Action: {json.dumps(action_data)}")
                
                # Handle termination signals from the agent
                if action_data["action"] in ["success", "fail"]:
                    print(f"[Naive_agent] Execution terminated with status: {action_data['action']}")
                    break
                
                # Execute interaction inside the browser sandboxed context
                try:
                    if action_data["action"] == "click":
                        await page.click(action_data["selector"], timeout=5000)
                    elif action_data["action"] == "type":
                        await page.fill(action_data["selector"], action_data["text"], timeout=5000)
                    
                    # Yield thread execution briefly to let animations / network fetches reconcile
                    await page.wait_for_timeout(1500)
                    
                except Exception as action_err:
                    print(f"[Naive_agent] Operational error executing action: {str(action_err)}")
                    trajectory_log.append({"step": step, "execution_exception": str(action_err)})
                    break
                    
        except Exception as global_err:
            print(f"[Naive_agent] Critical failure during navigation: {str(global_err)}")
            trajectory_log.append({"critical_error": str(global_err)})
        finally:
            await browser.close()
            
    return trajectory_log

# --- Test Execution Block ---
if __name__ == "__main__":
    # Test Scenario: Directing the agent to process a cancellation journey on a mock URL
    # Replace this with your deployed Vercel target or live URL (e.g., Figma onboarding steps)
    target_test_url = "https://www.adobe.com/sg/creativecloud/plans.html" 
    test_objective = "Locate the account pricing settings and navigate to the cancellation confirmation phase."
    
    print("=== STARTING NAIVE AGENT ISOLATION TEST ===")
    resulting_trajectory = asyncio.run(run_naive_agent(target_test_url, test_objective))
    
    print("\n=== COMPLETE TRAJECTORY LOG GENERATED ===")
    print(json.dumps(resulting_trajectory, indent=2))