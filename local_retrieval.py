"""Local, no-API embedding retriever — additive, mirrors retrieval.py's interface."""

from typing import Sequence
from sentence_transformers import SentenceTransformer

from documents import DOCUMENTS, Document
from retrieval import RetrievalResult, cosine_similarity  # reuse, don't duplicate


class LocalInMemoryRetriever:
    """Same interface as InMemoryRetriever, but embeds locally via sentence-transformers."""

    def __init__(
        self,
        documents: Sequence[Document] = DOCUMENTS,
        *,
        model_name: str = "all-MiniLM-L6-v2",
    ) -> None:
        self.model = SentenceTransformer(model_name)
        self.documents = list(documents)
        self._embeddings = self._embed_texts(
            [f"{doc.title}\n\n{doc.content}" for doc in self.documents]
        )

    def _embed_texts(self, texts: Sequence[str]) -> list[list[float]]:
        embeddings = self.model.encode(list(texts))
        if hasattr(embeddings, "tolist"):
            return embeddings.tolist()
        return [list(map(float, emb)) for emb in embeddings]

    def retrieve(self, query: str, k: int = 3) -> list[RetrievalResult]:
        """Retrieve top k documents matching the query."""
        if not query.strip():
            raise ValueError("Query must not be empty")
        if k < 1:
            raise ValueError("k must be at least 1")
        query_embedding = self._embed_texts([query])[0]
        results = [
            RetrievalResult(
                document=document,
                score=cosine_similarity(query_embedding, embedding),
            )
            for document, embedding in zip(self.documents, self._embeddings)
        ]
        return sorted(results, key=lambda result: result.score, reverse=True)[:k]
