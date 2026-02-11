# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install dependencies
RUN python -m pip install --upgrade pip setuptools wheel \
 && python -m pip install --no-cache-dir --only-binary=:all: "numpy==1.26.4" "pandas==2.2.2" \
 && python -m pip install --no-cache-dir -r requirements.txt \
 && python -c "import numpy, pandas; print('numpy', numpy.__version__); print('pandas', pandas.__version__)"

# Copy application code
COPY app.py .
COPY templates/ templates/
COPY static/ static/

# Expose port (Render will set PORT env variable)
EXPOSE 5000

# Run the application with gunicorn
# Pickle files will be downloaded on first startup from Google Drive
CMD gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 app:app
