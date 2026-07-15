"""Manual Phase 1 retrieval smoke test (requires OPENAI_API_KEY)."""

from retrieval import InMemoryRetriever


def main() -> None:
    query = "How do I troubleshoot API authentication and permission errors?"
    print(f"Query: {query}\n")

    retriever = InMemoryRetriever()
    results = retriever.retrieve(query, k=3)

    for rank, result in enumerate(results, start=1):
        document = result.document
        print(f"#{rank}  score={result.score:.4f}  id={document.id}")
        print(f"Title: {document.title}")
        print(f"Poisoned: {document.poisoned}")
        if document.injection_technique:
            print(f"Technique: {document.injection_technique}")
        print(document.content)
        print("-" * 80)


if __name__ == "__main__":
    main()

