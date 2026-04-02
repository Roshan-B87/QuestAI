import faiss
import numpy as np
import pickle
import os
from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer

DOCS_FOLDER = "data/docs"
INDEX_PATH = "data/faiss_index.bin"
CHUNKS_PATH = "data/chunks.pkl"

model = SentenceTransformer("all-MiniLM-L6-v2")

def load_pdfs(folder: str) -> list[str]:
    chunks = []
    for filename in os.listdir(folder):
        if filename.endswith(".pdf"):
            path = os.path.join(folder, filename)
            reader = PdfReader(path)
            for page in reader.pages:
                text = page.extract_text()
                if text and text.strip():
                    # Split into chunks of ~300 chars
                    for i in range(0, len(text), 300):
                        chunk = text[i:i+300].strip()
                        if len(chunk) > 50:
                            chunks.append(chunk)
            print(f"Loaded: {filename}")
    return chunks

def load_faqs(faq_file="data/faqs.txt") -> list[str]:
    chunks = []
    if os.path.exists(faq_file):
        with open(faq_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    chunks.append(line)
        print(f"Loaded FAQs: {len(chunks)} entries")
    return chunks

def build_index():
    print("Loading documents...")
    chunks = load_pdfs(DOCS_FOLDER) + load_faqs()

    if not chunks:
        print("No documents found! Add PDFs to data/docs/ or FAQs to data/faqs.txt")
        return

    print(f"Embedding {len(chunks)} chunks...")
    embeddings = model.encode(chunks, show_progress_bar=True)
    embeddings = np.array(embeddings).astype("float32")

    print("Building FAISS index...")
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    faiss.write_index(index, INDEX_PATH)
    with open(CHUNKS_PATH, "wb") as f:
        pickle.dump(chunks, f)

    print(f"Done! Index saved with {len(chunks)} chunks.")

if __name__ == "__main__":
    build_index()
