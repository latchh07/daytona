import asyncio
import argparse
import sys
import os
import json

# Add parent directory to path to import project modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.models import RunConfig
from engine.adapter import NaiveAgentAdapter
from signup_friction_agent import SignupFrictionAgent
from fake_urgency_agent import FakeUrgencyAgent
from confirmshaming_agent import ConfirmshamingAgent
from cancellation_roach_agent import CancellationRoachAgent

from playwright.async_api import async_playwright

AGENT_MAP = {
    'signup_friction': SignupFrictionAgent,
    'fake_urgency': FakeUrgencyAgent,
    'confirmshaming': ConfirmshamingAgent,
    'cancellation_roach': CancellationRoachAgent
}

class MockQueue:
    async def put(self, event):
        # Simply print events to stdout for the orchestrator to capture
        print(f"[NOSANA EVENT] {json.dumps(event)}")

async def run_single_trial(agent_name: str, target_url: str):
    print(f"[Nosana Node] Starting single trial for {agent_name}...")
    
    AgentClass = AGENT_MAP.get(agent_name)
    if not AgentClass:
        print(f"Unknown agent: {agent_name}")
        return

    # Override repeat_count to 1 so the original code only does 1 trial
    config = RunConfig(target_url=target_url, repeat_count=1)
    agent = AgentClass()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()
        adapter = NaiveAgentAdapter(page)
        
        try:
            # We use a MockQueue because the original agents expect a queue
            queue = MockQueue()
            results = await agent.run(page, adapter, config, queue)
            
            # Print the single trial result to stdout so the orchestrator can parse it
            print("\n=== NOSANA_TRIAL_RESULT ===")
            print(json.dumps([r.dict() for r in results], default=str))
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"[Nosana Node Error] {e}")
            sys.exit(1)
        finally:
            await browser.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--agent", required=True, help="Agent to run")
    parser.add_argument("--url", required=True, help="Target URL")
    args = parser.parse_args()
    
    asyncio.run(run_single_trial(args.agent, args.url))
