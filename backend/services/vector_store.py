class VectorStore:
    """
    Zero-dependency in-memory transcript store.
    Instead of complex and fragile native C++ vector libraries (which fail on Windows), 
    we leverage Gemini Flash's massive 1-Million token context window natively.
    """
    def __init__(self):
        self.transcripts = {}

    def is_video_processed(self, video_id: str) -> bool:
        return video_id in self.transcripts

    def add_transcript(self, video_id: str, chunks: list):
        if not chunks:
            self.transcripts[video_id] = ""
        else:
            self.transcripts[video_id] = " ".join(chunks)

    def query_context(self, video_id: str, query: str, n_results: int = 3) -> list:
        # Instead of vector similarity, we just pass the full text up to 50k chars.
        # Gemini acts as its own high-quality retrieval system.
        if video_id in self.transcripts:
            full_text = self.transcripts[video_id]
            return [full_text[:50000]]
        return []


vector_store = VectorStore()

