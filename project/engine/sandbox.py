from abc import ABC, abstractmethod

class SandboxProvider(ABC):
    @abstractmethod
    async def create_sandbox(self, config: dict) -> str:
        """Returns sandbox_id"""
        pass
        
    @abstractmethod
    async def destroy_sandbox(self, sandbox_id: str) -> None:
        pass
        
    @abstractmethod
    async def get_browser(self, sandbox_id: str):
        """Returns playwright browser instance"""
        pass

class DockerSandboxProvider(SandboxProvider):
    async def create_sandbox(self, config: dict) -> str:
        # Stub implementation
        return "docker_sandbox_123"
        
    async def destroy_sandbox(self, sandbox_id: str) -> None:
        pass
        
    async def get_browser(self, sandbox_id: str):
        raise NotImplementedError("Docker sandbox not fully implemented yet")

class DaytonaSandboxProvider(SandboxProvider):
    async def create_sandbox(self, config: dict) -> str:
        # In a real implementation this would call the Daytona API
        # Daytona_API_URL and Daytona_API_KEY would be loaded from env
        return "daytona_sandbox_123"
        
    async def destroy_sandbox(self, sandbox_id: str) -> None:
        pass
        
    async def get_browser(self, sandbox_id: str):
        raise NotImplementedError("Daytona sandbox integration pending API connection")

class LocalSandboxProvider(SandboxProvider):
    def __init__(self):
        self.playwright = None
        self.browsers = {}
        
    async def create_sandbox(self, config: dict) -> str:
        import uuid
        from playwright.async_api import async_playwright
        
        sandbox_id = str(uuid.uuid4())
        
        if not self.playwright:
            self.playwright = await async_playwright().start()
            
        browser = await self.playwright.chromium.launch(headless=config.get('headless', False))
        self.browsers[sandbox_id] = browser
        
        return sandbox_id
        
    async def destroy_sandbox(self, sandbox_id: str) -> None:
        if sandbox_id in self.browsers:
            await self.browsers[sandbox_id].close()
            del self.browsers[sandbox_id]
            
    async def get_browser(self, sandbox_id: str):
        return self.browsers.get(sandbox_id)
