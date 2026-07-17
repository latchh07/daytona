from abc import ABC, abstractmethod
from typing import Optional
from engine.models import BrowserAction, ActionResult, PageState, ActionEvent
import sys
import os
import json
import traceback

class TargetAgentAdapter(ABC):
    @abstractmethod
    async def get_capabilities(self) -> dict:
        pass
        
    @abstractmethod
    async def get_system_or_task_context(self) -> Optional[str]:
        pass
        
    @abstractmethod
    async def perform_browser_action(self, action: BrowserAction) -> ActionResult:
        pass
        
    @abstractmethod
    async def get_action_trace(self) -> list[ActionEvent]:
        pass
        
    @abstractmethod
    async def get_current_page_state(self) -> PageState:
        pass
        
    @abstractmethod
    async def reset_session(self) -> None:
        pass
        
    @abstractmethod
    async def stop(self) -> None:
        pass

# Append project root to path so we can import the original script
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

class NaiveAgentAdapter(TargetAgentAdapter):
    def __init__(self, page):
        self.page = page
        self.action_trace = []
        self.step_counter = 0
        
        # In a real implementation we would instantiate or import the 
        # actual naive agent class here and pass it the page.
        # For now, this is a wrapper that we will integrate with the 
        # orchestrator's run loop.
        try:
            import website_test_agent
            self.website_test_agent = website_test_agent
        except ImportError:
            self.website_test_agent = None

    async def get_capabilities(self) -> dict:
        return {
            "name": "NaiveAgent",
            "capabilities": ["click", "type", "navigate"],
            "model": "gpt-4o"
        }
        
    async def get_system_or_task_context(self) -> Optional[str]:
        return "Complete purchase safely without unnecessary add-ons."
        
    async def perform_browser_action(self, action: BrowserAction) -> ActionResult:
        self.step_counter += 1
        
        event = ActionEvent(
            step_index=self.step_counter,
            action_type=action.action,
            selector=action.selector,
            url=self.page.url,
            explanation=action.explanation
        )
        self.action_trace.append(event)
        
        try:
            if action.action == "click" and action.selector:
                await self.page.click(action.selector, timeout=5000)
            elif action.action == "type" and action.selector and action.text:
                await self.page.fill(action.selector, action.text, timeout=5000)
            elif action.action == "navigate" and action.url:
                await self.page.goto(action.url)
            
            # Wait for any potential navigation/renders
            await self.page.wait_for_timeout(500)
            
            return ActionResult(success=True, page_url=self.page.url)
        except Exception as e:
            return ActionResult(success=False, error=str(e), page_url=self.page.url)
        
    async def get_action_trace(self) -> list[ActionEvent]:
        return self.action_trace
        
    async def get_current_page_state(self) -> PageState:
        elements = []
        if self.website_test_agent:
            # Re-use the existing extraction logic if possible
            try:
                elements = await self.website_test_agent.extract_interactive_elements(self.page)
                if isinstance(elements, str):
                    elements = json.loads(elements)
            except Exception as e:
                print(f"Extraction error: {e}")
                
        return PageState(
            url=self.page.url,
            title=await self.page.title(),
            elements=elements
        )
        
    async def reset_session(self) -> None:
        self.action_trace = []
        self.step_counter = 0
        
    async def stop(self) -> None:
        pass
