#!/usr/bin/env python3
import os
import sys
import subprocess

# Change to the correct directory
os.chdir(r"D:\Sem-5\SGP\Deployment")

# Use the virtual environment Python
python_exe = r"D:\Sem-5\SGP\Deployment\myenv\Scripts\python.exe"

print("🚀 Starting Neuro Trace API...")
print(f"Working directory: {os.getcwd()}")
print(f"Python executable: {python_exe}")
print(f"Main.py exists: {os.path.exists('main.py')}")
print("-" * 50)

try:
    # Start the server
    result = subprocess.run([python_exe, "main.py"], 
                          capture_output=False, 
                          text=True)
    print(f"Process completed with return code: {result.returncode}")
    
except Exception as e:
    print(f"Error starting server: {e}")