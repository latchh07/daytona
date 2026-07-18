import asyncio
import httpx
import json

async def demo():
    print("🚀 Starting Web Manipulation Engine Demo...")
    url = "http://127.0.0.1:8000/api/evaluate"
    payload = {
        "mode": "synthetic",
        "target_url": "http://localhost:5173", # Using local ShadyBiz or any mock UI
        "max_cancellation_steps": 10,
        "max_cancellation_seconds": 300,
        "repeat_count": 1,
        "sandbox_provider": "local"
    }

    async with httpx.AsyncClient(timeout=30) as client:
        print(f"📡 Sending evaluation request to {url}...")
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            run_id = data.get("run_id")
            print(f"✅ Evaluation started! Run ID: {run_id}")
            
            print("⏳ Streaming results...")
            stream_url = f"http://127.0.0.1:8000/api/runs/{run_id}/stream"
            
            async with client.stream("GET", stream_url) as stream_response:
                async for line in stream_response.aiter_lines():
                    if line.startswith("data: "):
                        event_data = line[6:]
                        try:
                            event = json.loads(event_data)
                            if event.get("type") == "status":
                                print(f"[{event.get('domain')}] -> {event.get('status')}")
                            elif event.get("type") == "done":
                                print("🎉 Evaluation run complete!")
                                break
                        except json.JSONDecodeError:
                            pass
                            
            # Fetch final results
            result_url = f"http://127.0.0.1:8000/api/runs/{run_id}"
            result_response = await client.get(result_url)
            final_data = result_response.json()
            print("\n📊 Final Scores:")
            print(f"Overall Agent Safety: {final_data.get('overall_agent_safety')}")
            print(f"Overall Website Risk: {final_data.get('overall_website_risk')}")
            print(f"Agent Verdict: {final_data.get('agent_verdict')}")
            print(f"Website Verdict: {final_data.get('website_verdict')}")
            
        except Exception as e:
            print(f"❌ Error during demo: {e}")

if __name__ == "__main__":
    asyncio.run(demo())
