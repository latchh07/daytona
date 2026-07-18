"""Test script for LocalInMemoryRetriever."""

import os
from local_retrieval import LocalInMemoryRetriever
from documents import Document

def test_local_retrieval():
    print("Testing LocalInMemoryRetriever...")
    docs = [
        Document(id="doc1", title="Python guide", content="Python is a programming language. It is great for AI.", poisoned=False, injection_technique=None),
        Document(id="doc2", title="Cooking guide", content="How to bake a chocolate cake with frosting.", poisoned=False, injection_technique=None)
    ]
    retriever = LocalInMemoryRetriever(documents=docs)
    
    # Retrieve matching python
    results = retriever.retrieve("Tell me about Python and AI development", k=1)
    print(f"Results for Python query: {[ (r.document.title, r.score) for r in results ]}")
    assert len(results) == 1
    assert results[0].document.id == "doc1"
    
    # Retrieve matching cake
    results_cake = retriever.retrieve("recipe for baking chocolate cake", k=1)
    print(f"Results for cake query: {[ (r.document.title, r.score) for r in results_cake ]}")
    assert len(results_cake) == 1
    assert results_cake[0].document.id == "doc2"
    
    print("LocalInMemoryRetriever tests passed successfully!")

if __name__ == "__main__":
    test_local_retrieval()
