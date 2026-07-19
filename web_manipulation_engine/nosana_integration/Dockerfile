FROM mcr.microsoft.com/playwright/python:v1.40.0-jammy

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the project
COPY . .

# Set entrypoint to our nosana job runner
ENTRYPOINT ["python3", "project/nosana_integration/nosana_job.py"]
