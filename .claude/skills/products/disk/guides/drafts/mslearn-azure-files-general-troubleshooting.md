---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/files/connectivity/files-troubleshoot
importDate: "2026-04-23"
type: guide-draft
---

# Azure Files General Troubleshooting Guide

## Protocol/Port Requirements

| Protocol | Unrestricted Public | Restricted Public | Private Endpoint | Required Port |
|----------|:--:|:--:|:--:|---|
| SMB | Yes | Yes | Yes | TCP 445 |
| NFS | No | Yes | Yes | TCP 2049 |
| FileREST | Yes | Yes | Yes | TCP 443 (HTTPS), TCP 80 (HTTP) |

## DNS Resolution Diagnostics

### Check DNS resolution
**PowerShell:**
```powershell
Clear-DnsClientCache
Resolve-DnsName -Name "mystorageaccount.file.core.windows.net" | Format-List
```

**Bash:**
```bash
nslookup mystorageaccount.file.core.windows.net
```

### Expected results
- **No private endpoint**: CNAME to `file.phxNNprdstfNNa.store.core.windows.net` with public IP
- **With private endpoint (from internet)**: extra CNAME via `*.privatelink.file.core.windows.net`, resolves to public IP
- **With private endpoint (from VNet)**: resolves to private IP (e.g. 10.0.0.5) via `*.privatelink.file.core.windows.net`

## TCP Connectivity Diagnostics

**PowerShell:**
```powershell
Test-NetConnection -ComputerName "mystorageaccount.file.core.windows.net" -Port 445
```

**Bash:**
```bash
nc -zvw3 mystorageaccount.file.core.windows.net 445
```

## Client Diagnostics Tool
- Windows: [AzFileDiagnostics](https://github.com/Azure-Samples/azure-files-samples/tree/master/AzFileDiagnostics/Windows)
- Linux: [AzFileDiagnostics](https://github.com/Azure-Samples/azure-files-samples/tree/master/AzFileDiagnostics/Linux)

## Troubleshooting Sub-areas
- SMB connectivity: files-troubleshoot-smb-connectivity.md
- SMB authentication: files-troubleshoot-smb-authentication.md
- Performance (SMB/NFS): files-troubleshoot-performance.md
- Linux SMB: files-troubleshoot-linux-smb.md
- Linux NFS: files-troubleshoot-linux-nfs.md
- Azure File Sync: file-sync-troubleshoot.md
