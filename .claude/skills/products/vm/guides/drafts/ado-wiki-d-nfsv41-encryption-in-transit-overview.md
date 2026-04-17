---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/TSGs/Encryption in Transit for Azure Files NFSv4.1 Overview_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FTSGs%2FEncryption%20in%20Transit%20for%20Azure%20Files%20NFSv4.1%20Overview_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
tags: [azure-files, nfs, nfsv41, encryption-in-transit, stunnel, aznfs, architecture, preview]
---

# Azure Files NFSv4.1 Encryption in Transit — Architecture Overview (Preview)

## Overview

Encryption in Transit for NFS v4.1 (Preview) shares provides a secure-by-default experience, enabling seamless mounting of NFS shares with data encryption during transit.

Azure Files NFSv4.1 volumes enhance network security by enabling secure TLS connections using **Stunnel** (open-source TLS wrapper), safeguarding data in transit from interception including man-in-the-middle (MITM) attacks.

- **Encryption:** AES-GCM encryption of TCP stream between NFS client and Azure Files
- **No Kerberos required** — TLS provides confidentiality without complex AD setups
- **AZNFS utility** automates Stunnel installation and configuration on client

## Key Components

| Component | Role |
|-----------|------|
| **AZNFS Mount Helper** | Client utility that simplifies creating secure tunnels for NFSv4.1 traffic |
| **Stunnel Process** | Per-storage-account process; listens for NFS client traffic on local port, forwards encrypted over TLS to Azure Files NFS server |
| **AZNFS Watchdog** | Background job ensuring stunnel processes are operational; restarts terminated tunnels; cleans up unused processes after all shares from a storage account are unmounted |

## Architecture: How Traffic Flows

1. NFS client sends traffic to local loopback IP:port (e.g., 127.0.0.1:20049)
2. Stunnel intercepts traffic and forwards it encrypted over TLS to Azure Files NFS server
3. After mounting with TLS: `nfsstat -m` shows mount on local address (not actual server address)

**Stunnel per-storage-account model:** For each unique storage account IP, one stunnel process is started. Port starts at 20049 and increments for additional shares.

## AZNFS Watchdog Design

The watchdog is designed to:
1. Ensure stunnel processes are running for each storage account
2. Perform cleanup after all shares from the storage account are unmounted
3. Check server certificate exists and is not expired

> NOTE: If watchdog terminates unexpectedly, systemd restarts it after RestartSec (1 second). On VM restart, systemd starts the watchdog at boot.

## Important Constraint: TLS and Non-TLS Cannot Mix per Endpoint

**For a given endpoint, all mounts must either use TLS or clear-text (notls). They share the same connection.**

Mixing TLS and non-TLS on the same endpoint will be blocked.

## Installation (Client-side)

Install AZNFS package from [Microsoft Linux Software Repository](https://learn.microsoft.com/en-us/linux/packages).

After installation, two watchdog services start:
- `aznfswatchdog` — for NFSv3
- `aznfswatchdogv4` — for NFSv4

## Mount Command

Standard TLS mount:
```bash
sudo mount -t aznfs -o vers=4.1 <account>.file.core.windows.net:/<account>/<container> /mountpoint
```

Non-TLS mount (explicit):
```bash
sudo mount -t aznfs -o vers=4.1,notls <account>.file.core.windows.net:/<account>/<container> /mountpoint
```

Clean mount (clears stale entries):
```bash
sudo mount -t aznfs -o vers=4.1,notls,clean <account>.file.core.windows.net:/<account>/<container> /mountpoint
```

## Log Locations

| Log | Path |
|-----|------|
| AZNFS mount helper + watchdog | `/opt/microsoft/aznfs/data/aznfs.log` |
| Stunnel log | `/etc/stunnel/microsoft/aznfs/nfsv4_fileShare/logs/stunnel_<STORAGE_ACCOUNT_IP>.log` |

Log entries are tagged `[V3]` or `[V4]` to distinguish NFSv3 vs NFSv4 activity.

## Server-Side Architecture

- **Initialization:** Server initializes Schannel SSPI via AcquireCredentialsHandle (ACH)
- **Certificate Validation:** During initialization, server does not validate client certificate; client validates server certificate
- **TLS version:** TLSv1.2 with AES-GCM encryption

## GitHub References

- [AZNFS-mount repository](https://github.com/Azure/AZNFS-mount)
- [Mount helper](https://github.com/Azure/AZNFS-mount/blob/main/src/nfsv4mountscript.sh)
- [NFSv4 watchdog](https://github.com/Azure/AZNFS-mount/blob/main/src/aznfswatchdogv4)
