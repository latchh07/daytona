"""Replaceable execution boundary for individual crash-test trials."""

from abc import ABC, abstractmethod
from collections.abc import Callable
from typing import Any, TypeVar


T = TypeVar("T")


class SandboxRunner(ABC):
    @abstractmethod
    def run(
        self,
        trial: Callable[..., T],
        *args: Any,
        **kwargs: Any,
    ) -> T:
        """Run one trial and return its result."""
        raise NotImplementedError


class LocalRunner(SandboxRunner):
    """Run a trial in the current process without isolation."""

    def run(
        self,
        trial: Callable[..., T],
        *args: Any,
        **kwargs: Any,
    ) -> T:
        return trial(*args, **kwargs)

