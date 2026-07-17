"""Validation, persistence, and loading for user-uploaded Python agents."""

import ast
import importlib.util
import re
from collections.abc import Callable
from pathlib import Path
from uuid import uuid4


AgentCallable = Callable[[str, list[dict]], str]
UPLOAD_DIRECTORY = Path(__file__).resolve().parent / "uploaded_agents"
AGENT_ID_PATTERN = re.compile(r"^[0-9a-f]{32}$")


def _validate_source(source: str) -> bool:
    try:
        tree = ast.parse(source)
    except SyntaxError as exc:
        detail = f"invalid Python syntax at line {exc.lineno}: {exc.msg}"
        raise ValueError(detail) from exc

    top_level_functions = [
        node for node in tree.body if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
    ]
    answer_functions = [
        node
        for node in top_level_functions
        if node.name == "answer" and isinstance(node, ast.FunctionDef)
    ]
    if not answer_functions:
        raise ValueError("no top-level function named 'answer' found")
    if len(answer_functions) > 1:
        raise ValueError("multiple top-level functions named 'answer' found")
    if len(top_level_functions) != 1:
        raise ValueError("uploaded agent must expose exactly one top-level function")

    arguments = answer_functions[0].args
    parameter_count = len(arguments.posonlyargs) + len(arguments.args) + len(arguments.kwonlyargs)
    if parameter_count != 2 or arguments.vararg is not None or arguments.kwarg is not None:
        raise ValueError("answer() must take exactly 2 parameters")
    return True


def validate_agent_bytes(file_bytes: bytes) -> bool:
    """Validate uploaded source before it is persisted."""
    try:
        source = file_bytes.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise ValueError("agent file must be valid UTF-8 text") from exc
    return _validate_source(source)


def validate_agent_file(path: str) -> bool:
    try:
        source = Path(path).read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        raise ValueError("agent file must be valid UTF-8 text") from exc
    return _validate_source(source)


def save_agent(file_bytes: bytes) -> str:
    UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
    agent_id = uuid4().hex
    (UPLOAD_DIRECTORY / f"{agent_id}.py").write_bytes(file_bytes)
    return agent_id


def read_agent_source(agent_id: str) -> str:
    if not AGENT_ID_PATTERN.fullmatch(agent_id):
        raise FileNotFoundError(f"uploaded agent '{agent_id}' does not exist")
    path = UPLOAD_DIRECTORY / f"{agent_id}.py"
    if not path.is_file():
        raise FileNotFoundError(f"uploaded agent '{agent_id}' does not exist")
    return path.read_text(encoding="utf-8")


def load_agent_callable(agent_id: str) -> AgentCallable:
    if not AGENT_ID_PATTERN.fullmatch(agent_id):
        raise FileNotFoundError(f"uploaded agent '{agent_id}' does not exist")
    path = UPLOAD_DIRECTORY / f"{agent_id}.py"
    if not path.is_file():
        raise FileNotFoundError(f"uploaded agent '{agent_id}' does not exist")

    # Known limitation: uploaded agent code currently executes in-process via importlib, with no isolation. This is acceptable for a controlled demo but not for untrusted public use. The fix is routing this execution through SandboxRunner's abstraction (e.g. a future DaytonaRunner) instead of calling the function directly — the pipeline() closure this runs inside is already passed through runner.run(...), so swapping LocalRunner for an isolated runner implementation later requires no changes to this code.
    module_name = f"uploaded_agent_{agent_id}"
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise ImportError(f"could not load uploaded agent '{agent_id}'")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    answer = getattr(module, "answer", None)
    if not callable(answer):
        raise ValueError("uploaded agent does not expose a callable answer() function")
    return answer
