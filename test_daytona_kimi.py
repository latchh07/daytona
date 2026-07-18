"""Test script for DaytonaRunner and KimiProvider."""

import os
from dotenv import load_dotenv
from kimi_client import KimiProvider
from daytona_runner import DaytonaRunner

def test_kimi():
    print("Testing KimiProvider...")
    load_dotenv()
    if not os.getenv("AIAND_API_KEY"):
        print("Skipping KimiProvider live test (AIAND_API_KEY not set).")
        return
    provider = KimiProvider()
    response = provider.complete("You are a helpful assistant.", "Say 'hello world'", temperature=0)
    print(f"KimiProvider response: {response}")
    assert "hello" in response.lower()

def test_daytona_local():
    print("Testing DaytonaRunner local run...")
    runner = DaytonaRunner()
    res = runner.run(lambda x: x + 1, 5)
    print(f"DaytonaRunner local run result: {res}")
    assert res == 6

def test_daytona_remote():
    print("Testing DaytonaRunner remote run...")
    load_dotenv()
    if not os.getenv("DAYTONA_API_KEY") or not os.getenv("AIAND_API_KEY"):
        print("Skipping DaytonaRunner remote test (DAYTONA_API_KEY or AIAND_API_KEY not set).")
        return
    
    runner = DaytonaRunner()
    raw_response = runner.run_detection_remote(
        "You are a scanner. Reply only with valid JSON: {\"poisoned\": false}",
        "Classify this document."
    )
    print(f"DaytonaRunner remote detection output: {raw_response}")
    assert "poisoned" in raw_response

def main():
    test_kimi()
    test_daytona_local()
    test_daytona_remote()
    print("All tests completed successfully!")

if __name__ == "__main__":
    main()
