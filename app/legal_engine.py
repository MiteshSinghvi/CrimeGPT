import logging
import chromadb
import ollama

logger = logging.getLogger(__name__)

def get_legal_context(query_text: str, collection) -> str:
    try:
        # Step 1: Generate the query vector using Ollama natively
        response = ollama.embed(model='nomic-embed-text', input=query_text)
        query_vector = response['embeddings'][0]
        
        # Query ChromaDB for top 3 matching paragraphs using the vector directly
        results = collection.query(
            query_embeddings=[query_vector],
            n_results=3
        )
        
        # Combine retrieved paragraphs into context string
        context_snippets = results.get("documents", [[]])[0]
        context_text = "\n\n".join(context_snippets) if context_snippets else "No relevant legal statutes found."
        return context_text
        
    except Exception as e:
        logger.error(f"Error retrieving from ChromaDB: {e}")
        return "Error occurred during DB search. Use basic BNS/IT Act knowledge."
