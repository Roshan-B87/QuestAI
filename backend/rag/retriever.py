import faiss
import numpy as np
import pickle
import os

INDEX_PATH = "data/faiss_index.bin"
CHUNKS_PATH = "data/chunks.pkl"

def retrieve_context(query_vec, top_k: int = 3) -> str:
    """Search FAISS index and return top_k relevant text chunks"""
    if not os.path.exists(INDEX_PATH) or not os.path.exists(CHUNKS_PATH):
        return "No knowledge base found. Please run ingest.py first."

    index = faiss.read_index(INDEX_PATH)
    with open(CHUNKS_PATH, "rb") as f:
        chunks = pickle.load(f)

    query_vec = np.array(query_vec).astype("float32")
    distances, indices = index.search(query_vec, top_k)

    results = []
    for i in indices[0]:
        if i < len(chunks):
            results.append(chunks[i])

    return "\n\n".join(results) if results else "No relevant context found."
