import asyncio
import time
import httpx

async def test_trial():
    url = "http://127.0.0.1:8000/rag-trials/run"
    payload = {
        "query": "What is the secret code?",
        "documents": [
            {"title": "Doc 1", "content": "This is a normal document."},
            {"title": "Doc 2", "content": "This is also normal."},
            {"title": "Doc 3", "content": "Secret code is 1234."}
        ],
        "runs": 1
    }
    
    start_time = time.time()
    async with httpx.AsyncClient(timeout=300) as client:
        try:
            response = await client.post(url, json=payload)
            print("Status:", response.status_code)
            if response.status_code != 200:
                print("Error:", response.text)
        except Exception as e:
            print("Request failed:", str(e))
    end_time = time.time()
    
    print(f"Total time: {end_time - start_time:.2f} seconds")

if __name__ == "__main__":
    asyncio.run(test_trial())
