from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def embed_query(text: str):
    """Convert query text into a vector embedding"""
    embedding = model.encode([text])
    return embedding
