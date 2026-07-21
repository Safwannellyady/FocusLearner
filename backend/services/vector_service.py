"""
FocusLearner Pro - Vector Service
Service for managing vector embeddings and similarity search using Pinecone
"""

import os
import re
from typing import List, Dict, Any, Optional, Tuple
from sentence_transformers import SentenceTransformer
import pinecone
from config import Config


class VectorService:
    """Service for transcript embedding and vector similarity search"""
    
    def __init__(self):
        self.api_key = Config.PINECONE_API_KEY
        self.environment = Config.PINECONE_ENVIRONMENT
        self.index_name = Config.PINECONE_INDEX_NAME
        self.dimension = Config.PINECONE_DIMENSION
        self.metric = Config.PINECONE_METRIC
        self.chunk_size = Config.CHUNK_SIZE
        self.chunk_overlap = Config.CHUNK_OVERLAP
        
        self.embedding_model = None
        self.index = None
        self._initialized = False
        
        if self.api_key:
            self._initialize()
        else:
            print("Warning: PINECONE_API_KEY not found. Vector features will be disabled.")
    
    def _initialize(self):
        """Initialize Pinecone client and embedding model"""
        try:
            # Initialize Pinecone
            pinecone.init(
                api_key=self.api_key,
                environment=self.environment
            )
            
            # Create index if it doesn't exist
            if self.index_name not in pinecone.list_indexes():
                pinecone.create_index(
                    name=self.index_name,
                    dimension=self.dimension,
                    metric=self.metric
                )
                print(f"Created Pinecone index: {self.index_name}")
            
            # Connect to index
            self.index = pinecone.Index(self.index_name)
            
            # Load embedding model
            self.embedding_model = SentenceTransformer(Config.EMBEDDING_MODEL)
            
            self._initialized = True
            print("Vector service initialized successfully")
            
        except Exception as e:
            print(f"Error initializing vector service: {e}")
            self._initialized = False
    
    def chunk_transcript(self, transcript: str, video_id: str, timestamps: Optional[List[Dict]] = None) -> List[Dict[str, Any]]:
        """
        Split transcript into overlapping chunks with metadata.
        
        Args:
            transcript: Full transcript text
            video_id: Video identifier
            timestamps: Optional list of timestamp mappings
            
        Returns:
            List of chunks with metadata
        """
        if not transcript:
            return []
        
        chunks = []
        text = transcript.replace('\n', ' ').strip()
        
        # Split into chunks with overlap
        start = 0
        chunk_id = 0
        
        while start < len(text):
            end = start + self.chunk_size
            chunk_text = text[start:end]
            
            # Try to break at word boundary
            if end < len(text) and not text[end].isspace():
                last_space = chunk_text.rfind(' ')
                if last_space > 0:
                    chunk_text = chunk_text[:last_space]
                    end = start + last_space
            
            # Determine timestamp if available
            timestamp = None
            if timestamps and chunk_id < len(timestamps):
                timestamp = timestamps[chunk_id].get('timestamp', 0)
            
            chunk = {
                'chunk_id': chunk_id,
                'text': chunk_text.strip(),
                'video_id': video_id,
                'timestamp': timestamp,
                'start_char': start,
                'end_char': end
            }
            
            chunks.append(chunk)
            start = end - self.chunk_overlap
            chunk_id += 1
        
        return chunks
    
    def embed_chunks(self, chunks: List[Dict[str, Any]]) -> List[List[float]]:
        """
        Generate embeddings for transcript chunks.
        
        Args:
            chunks: List of chunk dictionaries
            
        Returns:
            List of embedding vectors
        """
        if not self._initialized or not self.embedding_model:
            print("Vector service not initialized, returning empty embeddings")
            return []
        
        try:
            texts = [chunk['text'] for chunk in chunks]
            embeddings = self.embedding_model.encode(
                texts,
                batch_size=Config.EMBEDDING_BATCH_SIZE,
                show_progress_bar=False
            )
            return embeddings.tolist()
        except Exception as e:
            print(f"Error generating embeddings: {e}")
            return []
    
    def index_transcript(self, video_id: str, transcript: str, metadata: Optional[Dict] = None, timestamps: Optional[List[Dict]] = None) -> bool:
        """
        Index a video transcript in the vector database.
        
        Args:
            video_id: Video identifier
            transcript: Full transcript text
            metadata: Additional metadata (title, subject, etc.)
            timestamps: Optional timestamp mappings
            
        Returns:
            True if successful, False otherwise
        """
        if not self._initialized or not self.index:
            print("Vector service not initialized")
            return False
        
        try:
            # Remove existing vectors for this video
            self.delete_video_transcript(video_id)
            
            # Chunk the transcript
            chunks = self.chunk_transcript(transcript, video_id, timestamps)
            
            if not chunks:
                print("No chunks generated from transcript")
                return False
            
            # Generate embeddings
            embeddings = self.embed_chunks(chunks)
            
            if not embeddings:
                print("Failed to generate embeddings")
                return False
            
            # Prepare vectors for upsert
            vectors = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                vector_id = f"{video_id}_chunk_{i}"
                
                vector_metadata = {
                    'video_id': video_id,
                    'chunk_id': i,
                    'text': chunk['text'],
                    'timestamp': chunk.get('timestamp', 0),
                    'start_char': chunk['start_char'],
                    'end_char': chunk['end_char']
                }
                
                # Add custom metadata
                if metadata:
                    vector_metadata.update(metadata)
                
                vectors.append({
                    'id': vector_id,
                    'values': embedding,
                    'metadata': vector_metadata
                })
            
            # Upsert in batches
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i + batch_size]
                self.index.upsert(vectors=batch)
            
            print(f"Indexed {len(chunks)} chunks for video {video_id}")
            return True
            
        except Exception as e:
            print(f"Error indexing transcript: {e}")
            return False
    
    def query_context(self, video_id: str, query: str, top_k: int = 5, timestamp_filter: Optional[float] = None) -> List[Dict[str, Any]]:
        """
        Query the vector database for relevant context.
        
        Args:
            video_id: Video identifier
            query: User query text
            top_k: Number of results to return
            timestamp_filter: Optional timestamp to bias results around
            
        Returns:
            List of relevant chunks with metadata
        """
        if not self._initialized or not self.index:
            print("Vector service not initialized")
            return []
        
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode([query])[0].tolist()
            
            # Build filter
            filter_dict = {'video_id': {'$eq': video_id}}
            
            # Query Pinecone
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                filter=filter_dict,
                include_metadata=True
            )
            
            # Extract and format results
            chunks = []
            for match in results.get('matches', []):
                metadata = match.get('metadata', {})
                chunks.append({
                    'text': metadata.get('text', ''),
                    'timestamp': metadata.get('timestamp', 0),
                    'score': match.get('score', 0),
                    'chunk_id': metadata.get('chunk_id', 0),
                    'video_id': metadata.get('video_id', '')
                })
            
            # If timestamp filter is provided, re-rank results by temporal proximity
            if timestamp_filter is not None and chunks:
                chunks = self._rerank_by_timestamp(chunks, timestamp_filter)
            
            return chunks
            
        except Exception as e:
            print(f"Error querying context: {e}")
            return []
    
    def _rerank_by_timestamp(self, chunks: List[Dict], target_timestamp: float) -> List[Dict]:
        """
        Re-rank chunks by temporal proximity to target timestamp.
        
        Args:
            chunks: List of chunks with timestamps
            target_timestamp: Target timestamp in seconds
            
        Returns:
            Re-ranked list of chunks
        """
        for chunk in chunks:
            ts = chunk.get('timestamp', 0)
            temporal_score = 1.0 / (1.0 + abs(ts - target_timestamp) / 60.0)  # Decay over 60 seconds
            # Combine semantic score with temporal score
            chunk['score'] = 0.7 * chunk['score'] + 0.3 * temporal_score
        
        # Sort by combined score
        chunks.sort(key=lambda x: x['score'], reverse=True)
        return chunks
    
    def delete_video_transcript(self, video_id: str) -> bool:
        """
        Delete all vectors for a specific video.
        
        Args:
            video_id: Video identifier
            
        Returns:
            True if successful, False otherwise
        """
        if not self._initialized or not self.index:
            return False
        
        try:
            # Query to get all vector IDs for this video
            # Note: Pinecone doesn't support delete by filter directly in all versions
            # This is a simplified approach
            self.index.delete(filter={'video_id': {'$eq': video_id}})
            print(f"Deleted transcript for video {video_id}")
            return True
        except Exception as e:
            print(f"Error deleting transcript: {e}")
            return False
    
    def is_video_processed(self, video_id: str) -> bool:
        """
        Check if a video transcript has been indexed.
        
        Args:
            video_id: Video identifier
            
        Returns:
            True if indexed, False otherwise
        """
        if not self._initialized or not self.index:
            return False
        
        try:
            # Query with a dummy embedding to check if any vectors exist
            dummy_embedding = [0.0] * self.dimension
            results = self.index.query(
                vector=dummy_embedding,
                top_k=1,
                filter={'video_id': {'$eq': video_id}},
                include_metadata=True
            )
            return len(results.get('matches', [])) > 0
        except Exception as e:
            print(f"Error checking video processed status: {e}")
            return False
    
    def get_video_chunks(self, video_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve all chunks for a video.
        
        Args:
            video_id: Video identifier
            
        Returns:
            List of all chunks for the video
        """
        if not self._initialized or not self.index:
            return []
        
        try:
            # Query with dummy embedding to get all chunks
            dummy_embedding = [0.0] * self.dimension
            results = self.index.query(
                vector=dummy_embedding,
                top_k=1000,  # Large number to get all chunks
                filter={'video_id': {'$eq': video_id}},
                include_metadata=True
            )
            
            chunks = []
            for match in results.get('matches', []):
                metadata = match.get('metadata', {})
                chunks.append({
                    'text': metadata.get('text', ''),
                    'timestamp': metadata.get('timestamp', 0),
                    'chunk_id': metadata.get('chunk_id', 0)
                })
            
            # Sort by chunk_id
            chunks.sort(key=lambda x: x['chunk_id'])
            return chunks
            
        except Exception as e:
            print(f"Error getting video chunks: {e}")
            return []


# Global instance
vector_service = VectorService()
