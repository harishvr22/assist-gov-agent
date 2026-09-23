"""
document_processor.py
---------------------
Document ingestion pipeline for extracting text from PDF policy guidelines,
chunking policy text into semantic passages, and indexing them into ChromaDB.
"""

import os
import re
import logging
from typing import List, Dict, Any

import chromadb

logger = logging.getLogger(__name__)

_CHROMA_PATH = os.path.join(os.path.dirname(__file__), "chroma_db")

class DocumentProcessor:
    def __init__(self, chroma_path: str = _CHROMA_PATH):
        self.chroma_path = chroma_path
        self.client = chromadb.PersistentClient(path=self.chroma_path)
        self.collection = self.client.get_or_create_collection(name="gov_schemes")

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract raw text from PDF file using pypdf/pdfplumber if available."""
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found at path: {pdf_path}")

        extracted_text = ""
        
        # Try pypdf
        try:
            import pypdf
            reader = pypdf.PdfReader(pdf_path)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
            if extracted_text.strip():
                return self.clean_text(extracted_text)
        except Exception as e:
            logger.warning("pypdf extraction failed or not installed (%s). Trying pdfplumber...", e)

        # Try pdfplumber
        try:
            import pdfplumber
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
            if extracted_text.strip():
                return self.clean_text(extracted_text)
        except Exception as e:
            logger.warning("pdfplumber extraction failed or not installed: %s", e)

        # Fallback: Plain text file reading if .txt given
        if pdf_path.endswith(".txt"):
            with open(pdf_path, "r", encoding="utf-8", errors="ignore") as f:
                return self.clean_text(f.read())

        raise RuntimeError("No supported PDF parser installed or text could not be extracted.")

    def clean_text(self, text: str) -> str:
        """Clean extracted document text."""
        # Replace multiple spaces / newlines
        text = re.sub(r"\r\n|\r", "\n", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"[ \t]+", " ", text)
        return text.strip()

    def chunk_text(self, text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[str]:
        """Split text recursively into overlapping passages."""
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            if len(current_chunk) + len(para) <= chunk_size:
                current_chunk += ("\n\n" if current_chunk else "") + para
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                # handle overlap
                overlap_text = current_chunk[-chunk_overlap:] if len(current_chunk) > chunk_overlap else ""
                current_chunk = overlap_text + ("\n\n" if overlap_text else "") + para

        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    def process_and_index_document(self, file_path: str, scheme_name: str, category: str, state: str = "All India") -> Dict[str, Any]:
        """Ingests, chunks, and indexes a policy document into ChromaDB."""
        logger.info("Processing policy document: %s for scheme '%s'", file_path, scheme_name)
        text = self.extract_text_from_pdf(file_path)
        chunks = self.chunk_text(text)

        if not chunks:
            logger.warning("No text passages could be extracted from '%s'. Skipping indexing.", file_path)
            return {
                "status": "warning",
                "scheme_name": scheme_name,
                "category": category,
                "passages_indexed": 0,
                "sample_chunk": "",
                "message": "No text content extracted"
            }

        ids = [f"DOC_{scheme_name.replace(' ', '_')}_{i}" for i in range(len(chunks))]
        documents = [
            f"Scheme Name: {scheme_name}\nCategory: {category}\nState: {state}\nPassage: {chunk}"
            for chunk in chunks
        ]

        # Add chunks to ChromaDB
        self.collection.add(documents=documents, ids=ids)
        logger.info("Successfully indexed %d passages for scheme '%s' into ChromaDB.", len(chunks), scheme_name)

        return {
            "status": "success",
            "scheme_name": scheme_name,
            "category": category,
            "passages_indexed": len(chunks),
            "sample_chunk": chunks[0] if chunks else ""
        }

# Global singleton
processor = DocumentProcessor()
