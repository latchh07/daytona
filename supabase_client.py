"""Small persistence wrapper for the ``rag_trials`` Supabase table."""

import logging
import os
from typing import Any

from dotenv import load_dotenv
from supabase import Client, create_client


logger = logging.getLogger(__name__)


class TrialStoreError(RuntimeError):
    """Raised when a trial cannot be persisted or read."""


class SupabaseTrialStore:
    def __init__(self, client: Client | None = None) -> None:
        load_dotenv()
        if client is None:
            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_KEY")
            if not url or not key:
                raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set")
            client = create_client(url, key)
        self.client = client
        try:
            client.table("rag_trials").select("*").limit(1).execute()
        except Exception as exc:
            raise RuntimeError(
                "Supabase table 'rag_trials' is unreachable or missing — check SUPABASE_URL, SUPABASE_KEY, and that the table exists."
            ) from exc

    def create_trial(self, values: dict[str, Any]) -> dict[str, Any]:
        try:
            response = self.client.table("rag_trials").insert(values).execute()
            if not response.data:
                raise TrialStoreError("Supabase insert returned no row")
            return response.data[0]
        except Exception as exc:
            if isinstance(exc, TrialStoreError):
                logger.exception("Could not create trial in Supabase: %r", exc)
                raise
            logger.exception("Could not create trial in Supabase: %r", exc)
            raise TrialStoreError("Could not create trial in Supabase") from exc

    def update_trial(self, trial_id: str, values: dict[str, Any]) -> dict[str, Any]:
        try:
            response = (
                self.client.table("rag_trials")
                .update(values)
                .eq("id", trial_id)
                .execute()
            )
            if not response.data:
                raise TrialStoreError(f"Supabase update returned no row for {trial_id}")
            return response.data[0]
        except Exception as exc:
            if isinstance(exc, TrialStoreError):
                raise
            raise TrialStoreError(f"Could not update trial {trial_id}") from exc

    def mark_failed(self, trial_id: str) -> dict[str, Any] | None:
        """Best-effort failure update; persistence errors are intentionally contained."""
        try:
            return self.update_trial(trial_id, {"status": "failed"})
        except TrialStoreError:
            return None

    def list_trials(self) -> list[dict[str, Any]]:
        try:
            response = (
                self.client.table("rag_trials")
                .select("*")
                .order("created_at", desc=True)
                .execute()
            )
            return list(response.data or [])
        except Exception as exc:
            raise TrialStoreError("Could not read trials from Supabase") from exc

    def get_trial(self, trial_id: str) -> dict[str, Any] | None:
        try:
            response = (
                self.client.table("rag_trials")
                .select("*")
                .eq("id", trial_id)
                .limit(1)
                .execute()
            )
            if not response.data:
                return None
            return response.data[0]
        except Exception as exc:
            raise TrialStoreError(f"Could not read trial {trial_id}") from exc
