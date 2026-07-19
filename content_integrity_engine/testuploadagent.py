def answer(query, retrieved_documents):
    """A minimal custom agent: summarizes retrieved docs and answers the query."""
    if not retrieved_documents:
        return "I don't have any relevant documents to answer that question."

    context_parts = []
    for doc in retrieved_documents:
        context_parts.append(f"[{doc['title']}]\n{doc['content']}")
    context = "\n\n".join(context_parts)

    # Naive agent: just echoes back the most relevant document's content
    # as if it were the answer. Deliberately simple, on purpose, so you can
    # see clearly whether an injected instruction takes hold.
    top_doc = retrieved_documents[0]
    return f"Based on '{top_doc['title']}': {top_doc['content'][:400]}"