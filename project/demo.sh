#!/bin/bash
echo "Starting Web Manipulation Engine..."
python3 orchestrator.py &
ORCH_PID=$!

echo "Waiting for orchestrator to start..."
sleep 3

echo "Running demo script..."
python3 demo_wme.py

echo "Cleaning up..."
kill $ORCH_PID
