"""Replaceable parallel execution interface for trial callables."""

import asyncio
import inspect
from abc import ABC, abstractmethod
from collections.abc import Awaitable, Callable, Sequence
from typing import TypeVar


T = TypeVar("T")
Trial = Callable[[], T | Awaitable[T]]


class ParallelExecutor(ABC):
    @abstractmethod
    async def execute(self, trials: Sequence[Trial[T]]) -> list[T]:
        """Execute zero or more trials and preserve input order."""
        raise NotImplementedError


class LocalExecutor(ParallelExecutor):
    """Execute local trials concurrently with asyncio.gather."""

    async def execute(self, trials: Sequence[Trial[T]]) -> list[T]:
        return list(await asyncio.gather(*(self._invoke(trial) for trial in trials)))

    @staticmethod
    async def _invoke(trial: Trial[T]) -> T:
        if inspect.iscoroutinefunction(trial):
            return await trial()
        result = await asyncio.to_thread(trial)
        if inspect.isawaitable(result):
            return await result
        return result

