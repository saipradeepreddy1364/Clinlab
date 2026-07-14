# load_test_runner.py
import time
import requests
import threading
from concurrent.futures import ThreadPoolExecutor
from generate_load_report import generate_load_report

# Configuration
TARGET_URL = "https://clinlab-ai-assist.vercel.app"
API_URL = "https://pdd-backend-ztqc.onrender.com"
DURATION = 60       # seconds
VIRTUAL_USERS = 100 # concurrent threads

# Shared execution control
stop_event = threading.Event()
request_logs = []
logs_lock = threading.Lock()

def make_request(user_id, request_num):
    # Alternately request frontend and backend to simulate full system load
    url = TARGET_URL if request_num % 2 == 0 else API_URL
    start_time = time.time()
    
    try:
        response = requests.get(url, timeout=10)
        status_code = response.status_code
    except Exception as e:
        status_code = 0 # connection failure
        
    end_time = time.time()
    duration_ms = int((end_time - start_time) * 1000)
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime(start_time))
    
    # Save log
    with logs_lock:
        request_logs.append({
            "user_id": user_id,
            "request_num": request_num,
            "endpoint": "GET /" if url == TARGET_URL else "GET /api",
            "status": status_code,
            "duration": duration_ms,
            "timestamp": timestamp
        })

def worker(user_id):
    request_num = 1
    while not stop_event.is_set():
        make_request(user_id, request_num)
        request_num += 1
        time.sleep(0.01) # brief pause to prevent absolute CPU exhaustion

def run_load_test():
    print(f"[INFO] Initializing Baseline Load Test...")
    print(f"[INFO] Target Frontend: {TARGET_URL}")
    print(f"[INFO] Target Backend: {API_URL}")
    print(f"[INFO] Configuration: {VIRTUAL_USERS} Virtual Users for {DURATION} seconds.")
    
    start_test_time = time.time()
    
    # Start thread pool
    with ThreadPoolExecutor(max_workers=VIRTUAL_USERS) as executor:
        for i in range(1, VIRTUAL_USERS + 1):
            executor.submit(worker, i)
            
        print("[INFO] All 100 virtual user threads spawned. Executing load test...")
        
        # Sleep for duration of test
        time.sleep(DURATION)
        
        # Signal stop
        print("[INFO] Test duration reached. Signaling workers to stop...")
        stop_event.set()
        
    end_test_time = time.time()
    total_run_time = end_test_time - start_test_time
    
    print(f"[INFO] Load test finished in {total_run_time:.2f} seconds.")
    print(f"[INFO] Total requests logged: {len(request_logs)}")
    
    # Compile metrics
    if request_logs:
        durations = [log["duration"] for log in request_logs if log["status"] != 0]
        min_time = min(durations) if durations else 0
        max_time = max(durations) if durations else 0
        avg_time = int(sum(durations) / len(durations)) if durations else 0
        total_requests = len(request_logs)
        rps = round(total_requests / total_run_time, 2)
        success_count = sum(1 for log in request_logs if 200 <= log["status"] < 400)
        failed_count = total_requests - success_count
        pass_rate = round((success_count / total_requests) * 100, 1) if total_requests else 0.0
        
        metrics = {
            "target_url": TARGET_URL,
            "backend_url": API_URL,
            "virtual_users": VIRTUAL_USERS,
            "duration": int(total_run_time),
            "total_requests": total_requests,
            "success_count": success_count,
            "failed_count": failed_count,
            "pass_rate": f"{pass_rate}%",
            "rps": rps,
            "min_time": min_time,
            "max_time": max_time,
            "avg_time": avg_time
        }
        
        # Generate Excel report
        generate_load_report(metrics, request_logs)
    else:
        print("[ERROR] No request logs compiled. Excel report generation skipped.")

if __name__ == "__main__":
    run_load_test()
