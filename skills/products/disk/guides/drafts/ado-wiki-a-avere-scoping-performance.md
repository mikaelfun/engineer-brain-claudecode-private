---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Scoping questions | Performance"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=/Avere%20-%20FXT%20and%20vFXT/Scoping%20questions%20%7C%20Performance"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Avere vFXT/FXT — Scoping Questions: Performance Issues

Use these questions when a customer reports slow I/O, high latency, or throughput degradation on their Avere cluster.

## Initial Scoping Questions

> - Are there any conditions on the Avere dashboard?
> - Provide a detailed description of what workflow is slow (reading, writing, mixed)?
> - Is the workload single-threaded and/or using a single client?
> - Is the workload multi-threaded and/or using more than a single client?
> - Provide the client OS along with the application/tool used for the workload?
> - What type of core filer is the workload running against?
> - What is the core filer's cache policy?
> - Provide the timeframe when the workload is perceived as slow?
> - If applicable, provide the error message from the client with timestamp.
> - Do we receive GSI uploads and backtrace emails from this cluster?

## If GSI Uploads Are Available

- Upload a Support Bundle via Remote Commands or have the customer upload a Support Bundle.
- Reference: https://azure.github.io/Avere/legacy/ops_guide/4_7/html/support_overview.html#general-information-upload

## Key Diagnostic Notes

- **Write-heavy + read-only policy** → expect slot exhaustion and high latency (cache policy mismatch)
- **Single-threaded / single-client** → workload may not saturate cache; check client-side bottleneck
- **Caches work best with ~80% read / 20% write ratio**
- **First-touch reads** will always be slower than warm-cache reads (expected behavior)
