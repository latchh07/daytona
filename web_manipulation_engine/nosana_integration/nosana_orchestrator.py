import asyncio
import os
import json
import sys

AGENTS = ['signup_friction', 'fake_urgency', 'confirmshaming', 'cancellation_roach']
REPEAT_COUNT = 3
TARGET_URL = "https://mockuidaytona.vercel.app"

async def run_nosana_job_locally(agent: str, run_id: int):
    """
    Simulates submitting a job to the Nosana GPU grid.
    In reality, this runs the `nosana_job.py` wrapper locally as a subprocess.
    """
    print(f"[Orchestrator] Dispatching {agent} (Run {run_id}) to Nosana grid...")
    
    script_path = os.path.join(os.path.dirname(__file__), 'nosana_job.py')
    
    # In a real Nosana environment, you would use `@nosana/cli` to submit the job:
    # process = await asyncio.create_subprocess_exec(
    #     'nosana', 'job', 'post', '--file', '.nosana-ci.yml', '--args', f'{agent} {TARGET_URL}'
    # )
    
    # For local simulation, we just run the Python script
    process = await asyncio.create_subprocess_exec(
        sys.executable, script_path, '--agent', agent, '--url', TARGET_URL,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    
    stdout, stderr = await process.communicate()
    
    if process.returncode != 0:
        print(f"[Orchestrator] Error in {agent} (Run {run_id}):\n{stderr.decode()}")
        return None
        
    output = stdout.decode()
    
    # Parse the result from the simulated Nosana node output
    for line in output.split('\n'):
        if line == "=== NOSANA_TRIAL_RESULT ===":
            continue
        if "{" in line and "}" in line and not line.startswith("["):
            try:
                # If there's multiple lines, we just try to find the JSON array
                pass
            except:
                pass
                
    # Extract the JSON array
    try:
        parts = output.split("=== NOSANA_TRIAL_RESULT ===")
        if len(parts) > 1:
            json_str = parts[1].strip().split('\n')[0]
            result = json.loads(json_str)
            print(f"[Orchestrator] Successfully received result for {agent} (Run {run_id})")
            return result
    except Exception as e:
        print(f"[Orchestrator] Failed to parse result for {agent} (Run {run_id}): {e}")
        
    return None

async def main():
    print("=== NOSANA PARALLEL ORCHESTRATOR ===")
    print(f"Parallelizing {len(AGENTS)} agents * {REPEAT_COUNT} repeats = {len(AGENTS) * REPEAT_COUNT} total jobs")
    
    tasks = []
    for agent in AGENTS:
        for i in range(1, REPEAT_COUNT + 1):
            tasks.append(run_nosana_job_locally(agent, i))
            
    # Run ALL trials completely in parallel!
    results = await asyncio.gather(*tasks)
    
    print("\n=== FINAL PARALLEL RESULTS ===")
    successful = [r for r in results if r is not None]
    print(f"Completed {len(successful)} out of {len(tasks)} jobs successfully on Nosana grid.")
    
if __name__ == "__main__":
    asyncio.run(main())
