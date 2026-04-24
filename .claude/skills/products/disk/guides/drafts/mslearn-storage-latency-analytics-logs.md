---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/blobs/alerts/troubleshoot-latency-storage-analytics-logs
importDate: "2026-04-23"
type: guide-draft
---

# Troubleshoot Latency Using Storage Analytics Logs

## Overview
Use Azure Storage Analytics logs to investigate latency issues by comparing E2ELatency and ServerLatency fields in log entries.

## Key Metrics Comparison
- **High E2ELatency, Low ServerLatency**: Client-side or network issue
  - Check client available connections/threads
  - Check Nagle algorithm (disable for small requests)
  - Use Wireshark for network analysis
- **High ServerLatency**: Server-side processing bottleneck
  - Check for repeated requests to same blob (use CDN/caching)
  - Check block size for uploads (use >= 64KB)
  - Check partition key design for tables
- **Low E2ELatency, Low ServerLatency, High Client Latency**: Request queuing at client
  - Limited connections or threads
  - Client retries (check OperationContext.RequestResults)
  - Network packet loss

## Storage Analytics Log Fields
- `request-start-time`, `end-to-end-latency-in-ms`, `server-latency-in-ms`
- `operation-type`, `request-status`, `http-status-code`
- Use these to correlate specific slow operations with root causes
