---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/TSGs/Encryption in Transit Azure Files NFSv4.1 Troubleshooting_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FTSGs%2FEncryption%20in%20Transit%20Azure%20Files%20NFSv4.1%20Troubleshooting_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
tags: [azure-files, nfs, nfsv41, encryption-in-transit, stunnel, aznfs, tls, linux]
---

# TSG: Azure Files NFSv4.1 Encryption in Transit (EIT) Troubleshooting

## Overview

This guide covers basic troubleshooting for Encryption in Transit on NFS v4.1 shares in Azure Files using the AZNFS package and Stunnel.

## Required Logs

> IMPORTANT: Request customer to share the following log sources to begin diagnosing.

| Log/Tool | Location/Command |
|----------|-----------------|
| AZNFS log file (mount helper and watchdog) | `/opt/microsoft/aznfs/data/aznfs.log` |
| Stunnel log file | `/etc/stunnel/microsoft/aznfs/nfsv4_fileShare/logs/stunnel_<STORAGE_ACCOUNT_IP>.log` |
| PCAP (tcp dump) | `tcpdump -i eth0 -p -s 0 port 2049 -n -w /tmp/repro.pcap` |

> AZNFS logs are tagged by `[V3]` or `[V4]` to distinguish NFSv3 vs NFSv4. For every successful mount you should find:
> - `Stunnel process is running` for the storage account IP on accept port
> - `Running the mount command`
> - `Updating mountmap status to mounted`
> - `Mount completed`

## AZNFS Package Installation

<details>
<summary>Expand for distro-specific install commands</summary>

**SUSE:**
```bash
curl -sSL -O https://packages.microsoft.com/config/$(source /etc/os-release && echo "$ID/${VERSION_ID%%.*}")/packages-microsoft-prod.rpm
sudo rpm -i packages-microsoft-prod.rpm && rm packages-microsoft-prod.rpm
sudo zypper refresh && sudo zypper install aznfs
```

**Debian/Ubuntu:**
```bash
curl -sSL -O https://packages.microsoft.com/config/$(source /etc/os-release && echo "$ID/$VERSION_ID")/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb && rm packages-microsoft-prod.deb
sudo apt-get update && sudo apt-get install aznfs
```

**RHEL/CentOS:**
```bash
curl -sSL -O https://packages.microsoft.com/config/$(source /etc/os-release && echo "$ID/${VERSION_ID%%.*}")/packages-microsoft-prod.rpm
sudo rpm -i packages-microsoft-prod.rpm && rm packages-microsoft-prod.rpm
sudo yum update && sudo yum install aznfs
```
</details>

## Client-Side Troubleshooting

### Check services running
```bash
sudo systemctl status aznfswatchdog*
```
Two processes should run: `aznfswatchdog` (NFSv3) and `aznfswatchdogv4` (NFSv4).

### Known Issue: TLS/Non-TLS mount conflict

**For a given endpoint, all mounts must either use TLS encryption OR clear-text (notls option) — they share the same connection.**

If a TLS mount was terminated before completing, the watchdog may take up to 3 minutes to clean up stale entries. If a non-TLS mount is attempted before cleanup finishes:

**Symptoms:**
```
Mount to the same endpoint ${storageaccount_ip} exists that is using TLS. Cannot mount without TLS to the same endpoint as they use the same connection.
```

**Resolution:** Use the `clean` option to immediately clear stale entries:
```bash
sudo mount -t aznfs -o vers=4.1,notls,clean <account>.file.core.windows.net:/<account>/<container> /mountpoint
```

### Verify mount type and port
```bash
nfsstat -m
```
Shows which port the share is mounted on. With TLS, share mounts to local loopback (127.0.0.1) not the actual server address.

```bash
sudo netstat -anp | grep stunnel
```
Check if stunnel process is running.

## TLS Investigation: Packet Capture

For TLS investigations, both encrypted and non-encrypted packets are needed.

```bash
# Capture on default NFS port (encrypted traffic)
tcpdump -i eth0 -p -s 0 port 2049 -n -w /tmp/repro.pcap

# Capture both TLS and stunnel ports
tcpdump "port 20049 or port 2049" -i any -n -w /tmp/repro.pcap
```
> Note: Cannot choose the port — the mount helper uses the nearest available port automatically. Find the stunnel port via `nfsstat -m`.

## Stunnel: Missing Certificate

**Symptoms in stunnel logs:**
```
[!] SSL_CTX_load_verify_locations: ... error:0B084088:x509 certificate routines:X509_load_cert_crl_file:no certificate or crl found
```

Stunnel looks for: `/etc/ssl/certs/DigiCert_Global_Root_G2.pem`

**Check if certificate exists:**
```bash
# RedHat-based
grep -q "DigiCert Global Root G2" /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem

# Debian/SUSE
ls /etc/ssl/certs/DigiCert_Global_Root_G2.pem
```

**If installed on RedHat but not extracted:**
```bash
awk '/DigiCert Global Root G2/ {found=1} found && /BEGIN CERTIFICATE/,/END CERTIFICATE/ {print > "/etc/ssl/certs/DigiCert_Global_Root_G2.pem"} found && /END CERTIFICATE/ {exit}' /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem
```

## Server-Side Investigation

Use tools: Xdiagnostics, Log Collector, or XDS for detailed server-side logs.

**Key search terms in EIT FE logs:**

| Keyword | Purpose |
|---------|---------|
| `"New connection.has been created"` | Find connection establishment (search with regex) |
| `"OncRpcTlsHandShake"` | Find all handshake logs |
| `"cbMaximumMessage"` in Perf Logs | Confirm handshake done and encryption buffers configured |
| `"isClientHello=1"` | Locate first client hello request |
| `connection_ptr` | Follow all TLS logs for a specific connection |
| `"[TLS]"` | All TLS-related logs |
| `"[OncRpcWsk]"` | WSK-level connection logs |
| `"RecordMarker"` | Record header (for packet length/content type issues) |

## Verify EIT is Active

```bash
# Check mount is on local loopback (confirms TLS via stunnel)
df -Th

# Verify traffic is encrypted via tcpdump + Wireshark
sudo tcpdump -i any port 2049 -w nfs_traffic.pcap
# Open in Wireshark: payload should show "Application Data" not readable text
```

## GitHub References

- [Mount helper source](https://github.com/Azure/AZNFS-mount/blob/main/src/nfsv4mountscript.sh)
- [NFSv4 watchdog source](https://github.com/Azure/AZNFS-mount/blob/main/src/aznfswatchdogv4)
