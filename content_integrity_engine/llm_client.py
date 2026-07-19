"""Provider-neutral text completion interface."""

import os
from abc import ABC, abstractmethod

from dotenv import load_dotenv
from openai import OpenAI


class LLMProvider(ABC):
    @abstractmethod
    def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        *,
        temperature: float | None = None,
    ) -> str:
        """Return a text completion for the supplied prompts."""
        raise NotImplementedError


class OpenAIProvider(LLMProvider):
    def __init__(
        self,
        model: str = "gpt-4.1-mini",
        *,
        client: OpenAI | None = None,
        base_url: str | None = None,
    ) -> None:
        load_dotenv()
        resolved_base_url = base_url or os.getenv("OPENAI_BASE_URL")
        self.client = client or (
            OpenAI(base_url=resolved_base_url) if resolved_base_url else OpenAI()
        )
        self.model = model

    def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        *,
        temperature: float | None = None,
    ) -> str:
        request = {
            "model": self.model,
            "instructions": system_prompt,
            "input": user_prompt,
        }
        if temperature is not None:
            request["temperature"] = temperature
        response = self.client.responses.create(
            **request,
        )
        return response.output_text
