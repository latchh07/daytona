"""Kimi (Moonshot) provider via the ai& gateway — additive, does not touch llm_client.py."""

import os
import sys
from dotenv import load_dotenv
from openai import OpenAI, APIError, APITimeoutError, APIConnectionError
from llm_client import LLMProvider

_DEFAULT_MODEL = "moonshotai/kimi-k2.7-code"
_TIMEOUT_SECONDS = 120  # ai& models can be slow; give them 2 minutes before giving up


class KimiProvider(LLMProvider):
    """LLM provider routing through the ai& gateway.

    The model is resolved in priority order:
      1. The ``model`` argument passed to ``__init__``
      2. The ``AIAND_MODEL`` environment variable
      3. The hard-coded default (``moonshotai/kimi-k2.7-code``)

    To switch to the GPT-OSS model set ``AIAND_MODEL=openai/gpt-oss-120b`` in ``.env``.
    """

    def __init__(
        self,
        model: str | None = None,
        *,
        client: OpenAI | None = None,
        base_url: str | None = None,
    ) -> None:
        load_dotenv()
        resolved_base_url = base_url or os.getenv("AIAND_BASE_URL", "https://api.aiand.com/v1")
        self.client = client or OpenAI(
            base_url=resolved_base_url,
            api_key=os.getenv("AIAND_API_KEY"),
            timeout=_TIMEOUT_SECONDS,
        )
        # Prefer explicit arg → env var → hard-coded default
        self.model = model or os.getenv("AIAND_MODEL", _DEFAULT_MODEL)

    def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        *,
        temperature: float | None = None,
    ) -> str:
        """Return a text completion for the supplied prompts using streaming chat completions."""
        request: dict = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": 8192,
            "reasoning_effort": "low",
            "stream": True,
        }
        if temperature is not None:
            request["temperature"] = temperature

        try:
            stream = self.client.chat.completions.create(**request)
            content_chunks: list[str] = []
            reasoning_chunks: list[str] = []

            for chunk in stream:
                delta = chunk.choices[0].delta if chunk.choices else None
                if delta is None:
                    continue

                # Collect actual content
                if delta.content:
                    content_chunks.append(delta.content)
                    print(f"[KimiProvider] content chunk: {delta.content!r}", file=sys.stderr)

                # Reasoning-capable models (e.g. gpt-oss-120b) stream reasoning into a
                # separate field that does not exist on vanilla delta objects.
                reasoning = getattr(delta, "reasoning_content", None)
                if reasoning:
                    reasoning_chunks.append(reasoning)
                    print(f"[KimiProvider] reasoning_content chunk: {reasoning!r}", file=sys.stderr)

            content = "".join(content_chunks)
            print(
                f"[KimiProvider] model={self.model} | "
                f"content_len={len(content)} | "
                f"reasoning_len={sum(len(r) for r in reasoning_chunks)}",
                file=sys.stderr,
            )
            return content

        except APITimeoutError as exc:
            print(
                f"[KimiProvider] Request to {self.model} timed out after {_TIMEOUT_SECONDS}s: {exc}",
                file=sys.stderr,
            )
            raise
        except APIConnectionError as exc:
            print(
                f"[KimiProvider] Connection error reaching ai& gateway for model {self.model}: {exc}",
                file=sys.stderr,
            )
            raise
        except APIError as exc:
            print(
                f"[KimiProvider] API error from {self.model} (status {getattr(exc, 'status_code', '?')}): {exc}",
                file=sys.stderr,
            )
            raise

