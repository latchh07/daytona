"""Quick smoke test for KimiProvider — run this directly to verify the model responds.

Usage:
    python test_aiand_model.py

It will print which model is being used, stream the response, and show a clear error
if the model times out, refuses the connection, or returns an API error.
"""

import os
from dotenv import load_dotenv
load_dotenv()

from kimi_client import KimiProvider

model = os.getenv("AIAND_MODEL", "moonshotai/kimi-k2.7-code")
print(f"Testing model: {model}")
print(f"Endpoint: {os.getenv('AIAND_BASE_URL', 'https://api.aiand.com/v1')}")
print("-" * 60)

provider = KimiProvider()
try:
    reply = provider.complete(
        system_prompt="You are a helpful assistant.",
        user_prompt="Say hello in exactly one sentence.",
    )
    print(f"Model reply: {reply}")
    print("-" * 60)
    print("SUCCESS — model responded.")
except Exception as exc:
    print(f"FAILED: {type(exc).__name__}: {exc}")
