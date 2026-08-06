FROM python:3.10-slim

# Install system dependencies required for compiling heavy Python extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip to the latest version to ensure optimal wheel handling
RUN pip install --no-cache-dir --upgrade pip

# Step 1: Force-install heavy ML dependencies separately to prevent memory spikes
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir scikit-learn sentence-transformers

# Step 2: Copy requirements file and install remaining lightweight packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Step 3: Pre-download NLTK data so it is baked into the image
RUN python -m nltk.downloader punkt stopwords punkt_tab

# Step 4: Copy the rest of your backend source code
COPY . .

EXPOSE 5000

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000", "--timeout", "120"]
