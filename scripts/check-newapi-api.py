#!/usr/bin/env python3
"""
Check NewAPI admin console for embedding channel issues
Uses requests + BeautifulSoup to avoid Playwright browser lock issues
"""

import requests
import json
from datetime import datetime
import sys
import ssl

# Fix Unicode encoding for Windows console
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Disable SSL warnings for self-signed certs
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Fix SSL verification issue
ssl._create_default_https_context = ssl._create_unverified_context

BASE_URL = "https://kunnewapi.net/console"
USERNAME = "adminkun"
PASSWORD = "MikaelFun3x789"

def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    # Replace unicode chars with ASCII
    msg = msg.replace('✓', '[OK]').replace('✗', '[FAIL]').replace('\u2717', '[X]').replace('\u2713', '[OK]')
    print(f"[{timestamp}] {msg}")

def get_session():
    """Create authenticated session"""
    session = requests.Session()
    session.verify = False

    # Login
    log("Attempting login...")
    login_data = {
        "username": USERNAME,
        "password": PASSWORD
    }

    try:
        r = session.post(f"{BASE_URL}/api/auth/login", json=login_data)
        if r.status_code in [200, 201]:
            log(f"✓ Login successful (status: {r.status_code})")
            return session
        else:
            log(f"✗ Login failed (status: {r.status_code})")
            log(f"  Response: {r.text[:200]}")
            return None
    except Exception as e:
        log(f"✗ Login error: {e}")
        return None

def check_channels(session):
    """Get all channels"""
    log("Fetching channels list...")
    try:
        r = session.get(f"{BASE_URL}/api/channel", timeout=10)
        if r.status_code == 200:
            channels = r.json()
            log(f"✓ Found {len(channels)} channels")
            return channels
        else:
            log(f"✗ Failed to fetch channels (status: {r.status_code})")
            return []
    except Exception as e:
        log(f"✗ Error fetching channels: {e}")
        return []

def find_embedding_channels(channels):
    """Filter for embedding-related channels"""
    embedding_keywords = ['embedding', 'text-embedding-3-small', 'text-embedding-ada-002', 'embed']
    matches = []

    for ch in channels:
        ch_str = str(ch).lower()
        if any(kw in ch_str for kw in embedding_keywords):
            matches.append(ch)

    log(f"Found {len(matches)} embedding-related channels")
    return matches

def test_channel(session, channel_id):
    """Test a channel"""
    log(f"Testing channel {channel_id}...")
    try:
        r = session.post(f"{BASE_URL}/api/channel/{channel_id}/test", timeout=10)
        return {
            "status": r.status_code,
            "response": r.text[:500] if r.text else "No response",
            "success": r.status_code in [200, 201]
        }
    except Exception as e:
        return {
            "status": "error",
            "response": str(e),
            "success": False
        }

def get_logs(session, filter_keyword="embedding"):
    """Get recent logs filtered by keyword"""
    log(f"Fetching logs with filter: {filter_keyword}...")
    try:
        r = session.get(f"{BASE_URL}/api/log", params={"query": filter_keyword, "limit": 50}, timeout=10)
        if r.status_code == 200:
            logs = r.json()
            log(f"✓ Found {len(logs) if isinstance(logs, list) else 'unknown number of'} log entries")
            return logs
        else:
            log(f"✗ Failed to fetch logs (status: {r.status_code})")
            return []
    except Exception as e:
        log(f"✗ Error fetching logs: {e}")
        return []

def get_channel_details(session, channel_id):
    """Get details for a specific channel"""
    try:
        r = session.get(f"{BASE_URL}/api/channel/{channel_id}", timeout=10)
        if r.status_code == 200:
            return r.json()
        else:
            return {"error": f"Status {r.status_code}"}
    except Exception as e:
        return {"error": str(e)}

def main():
    log("=== NewAPI Admin Console Check ===")

    session = get_session()
    if not session:
        log("Failed to create authenticated session")
        return False

    # Get channels
    channels = check_channels(session)
    if not channels:
        log("No channels found")
        return False

    # Find embedding channels
    embedding_channels = find_embedding_channels(channels)

    # Results
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_channels": len(channels),
        "embedding_channels_count": len(embedding_channels),
        "embedding_channels": [],
        "tests": [],
        "logs": []
    }

    # Check details and test embedding channels
    if embedding_channels:
        log("\n=== Embedding Channels ===")
        for ch_info in embedding_channels[:5]:  # Limit to first 5
            ch_id = ch_info.get('id') if isinstance(ch_info, dict) else str(ch_info)
            log(f"\nChannel: {ch_id}")

            # Get details
            details = get_channel_details(session, ch_id)
            log(f"  Details: {json.dumps(details, indent=2)[:300]}")

            # Test
            test_result = test_channel(session, ch_id)
            log(f"  Test result: {test_result['success']}")

            results["embedding_channels"].append({
                "id": ch_id,
                "info": ch_info,
                "details": details,
                "test": test_result
            })

    # Get logs
    log("\n=== Recent Embedding Logs ===")
    logs = get_logs(session, "embedding")
    results["logs"] = logs

    # Summary
    log("\n=== Summary ===")
    log(f"Total channels: {results['total_channels']}")
    log(f"Embedding channels: {results['embedding_channels_count']}")
    log(f"Tests performed: {len(results['tests'])}")
    log(f"Log entries: {len(results['logs']) if isinstance(results['logs'], list) else 'N/A'}")

    # Save results
    output_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".playwright-output", "newapi-check-results.json")
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    log(f"\n✓ Results saved to {output_file}")

    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        log("\nInterrupted by user")
        sys.exit(1)
    except Exception as e:
        log(f"Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
