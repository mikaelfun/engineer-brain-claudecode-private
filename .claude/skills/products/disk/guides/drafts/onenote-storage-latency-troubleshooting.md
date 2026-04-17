# Storage Account Latency Troubleshooting Methodology

> Source: OneNote - Mooncake POD Support Notebook > STORAGE > Case Study > Storage account latency troubleshooting
> Product: disk | Quality: guide-draft

## Step 1: Understand Application Behavior
- Determine the timeout mechanism set by the application (e.g., 5s).
- Identify how the application reads/writes data: SDK or REST API.
- Collect the SDK version and language.

## Step 2: Distinguish E2E Latency vs Server Latency
- **E2E latency**: total time from client request to response, includes network hops.
- **Server latency**: time spent on the Azure Storage backend only.
- Reference: https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blobs-latency
- High E2E but low server latency → network issue (client side or intermediate hops).
- High server latency → backend investigation needed.

## Step 3: Check Storage Account Metrics (xPortal/Jarvis)
- **Shoebox API Investigation Dashboard**: overview of storage account performance.
- **Account SLA Shoebox Metrics**: P99/P95/AVG latency over time.
- Look for: throttling errors, bandwidth limits, abnormal latency patterns.

## Step 4: Investigate Individual High-Latency Requests
Requires a **server request ID**. Sources:
1. Storage Diagnostics logs (customer enables on storage account).
2. Fiddler trace (from server response header).
3. Storage SDK Client-side logging.
4. Application logging.

## Step 5: Analyze Backend Logs
- Use xPortal auto-analysis with the request ID.
- Key metrics in perf logs: TotalPartitionWaitTimeInMs, TotalTableServerTimeInMs, TotalXStreamTimeInMs.
- Common root causes:
  - **Partition merge**: transient latency spike (usually ~1 min), identified by high TotalPartitionWaitTimeInMs.
  - **Stamp-level throttling**: ServerAccountBandwidthThrottlingError.
  - **Disk IO contention on stamp**: rare, needs PG investigation.

## Step 6: Recommendations
- Application-side retry with exponential backoff.
- Enable storage diagnostic settings for ongoing monitoring.
- If transient and rare: observe 2-3 days before escalating.
- If persistent: engage PG with collected evidence.

## Tools
| Tool | Purpose |
|------|---------|
| xPortal auto-analysis | Backend log analysis with request ID |
| Jarvis Shoebox Dashboard | Storage account level metrics |
| ARM HttpIncomingRequests | Control plane operation logs |
| Storage Diagnostic Logs | Customer-side detailed logging |
