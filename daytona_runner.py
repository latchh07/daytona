"""Daytona sandbox runner for remote detections — additive, does not touch sandbox_runner.py."""

import json
import os
from collections.abc import Callable
from typing import Any, TypeVar

from daytona import Daytona, CreateSandboxFromImageParams
from daytona.common.image import Image
from sandbox_runner import SandboxRunner

T = TypeVar("T")


class DaytonaRunner(SandboxRunner):
    """Sandbox runner that supports local execution of generic trials and remote sandboxed detection."""

    def __init__(self, daytona_client: Daytona | None = None) -> None:
        self._daytona_client = daytona_client

    @property
    def daytona_client(self) -> Daytona:
        if self._daytona_client is None:
            self._daytona_client = Daytona()
        return self._daytona_client

    def run(
        self,
        trial: Callable[..., T],
        *args: Any,
        **kwargs: Any,
    ) -> T:
        """Satisfies the abstract interface by executing locally without isolation.

        Used for trial closure serialization compatibility.
        """
        return trial(*args, **kwargs)

    def run_detection_remote(self, system_prompt: str, user_prompt: str) -> str:
        """Run the LLM injection detector remotely in an isolated Daytona sandbox."""
        
        script = f"""import os
import sys
import json
import urllib.request
from urllib.error import HTTPError

def main():
    url = "http://host.docker.internal:8000/internal/llm-complete"
    
    system_prompt = {json.dumps(system_prompt)}
    user_prompt = {json.dumps(user_prompt)}
    
    payload = {{
        "system_prompt": system_prompt,
        "user_prompt": user_prompt,
        "temperature": 0.0
    }}
    
    data = json.dumps(payload).encode("utf-8")
    
    req = urllib.request.Request(
        url,
        data=data,
        headers={{
            "Content-Type": "application/json"
        }},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            content = res_json["content"]
            print(content)
    except HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"HTTP Error {{e.code}}: {{err_msg}}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error making request: {{e}}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
"""

        # Create sandbox and run
        params = CreateSandboxFromImageParams(
            image=Image.debian_slim(),
            env_vars={},
        )
        sandbox = self.daytona_client.create(params)
        try:
            # Map host.docker.internal to the default gateway if it doesn't resolve automatically
            sandbox.process.code_run(
                "ping -c 1 host.docker.internal || ip route | awk '/default/ {print $3 \" host.docker.internal\"}' >> /etc/hosts"
            )
            response = sandbox.process.code_run(script)
            if response.exit_code != 0:
                raise RuntimeError(
                    f"Daytona sandbox detection script failed with exit code {response.exit_code}. "
                    f"Output: {response.result}"
                )
            return response.result.strip()
        finally:
            self.daytona_client.delete(sandbox)
