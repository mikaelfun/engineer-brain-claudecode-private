# NFS 4.1 vs SMB Protocol Comparison for Azure Files

Source: OneNote - [File]NFS4.1 V.S. SMB

## Protocol Overview

| Feature | NFS 4.1 | SMB 2.0/3.x | REST API |
|---------|---------|-------------|----------|
| OS affinity | Linux/UNIX | Windows | Any (Portal/Explorer) |
| File system | POSIX-compliant | Win32/.NET | N/A |
| Hard links | Supported | N/A | N/A |
| Symbolic links | Supported | N/A | N/A |
| Encryption in transit | Not native (needs stunnel/aznfs) | AES-256-GCM, AES-128-GCM, AES-128-CCM | HTTPS |
| AD integration | UID/GID | AD domain join + DACL | SAS/AAD |
| Network isolation | Private endpoint | Private endpoint | Private endpoint |
| Multi-channel | N/A | SMB Multichannel (premium only) | N/A |
| Soft delete | N/A | Supported | Supported |
| VSS snapshots | N/A | Supported | N/A |

## Typical Scenarios

### NFS 4.1
- Linux/UNIX line-of-business apps using POSIX file system APIs
- Workloads requiring POSIX compliance, case sensitivity, or Unix-style permissions (UID/GID)
- New app/service development needing random IO and tiered storage

### SMB
- End-user file shares (team shares, home directories)
- Windows application backends (SQL Server, Win32/.NET LOB apps)
- New app/service development needing random IO and tiered storage
- Can be mounted locally or cached on-premises via Azure File Sync

## Mooncake Notes
- NFS 4.1 encryption in transit (aznfs/stunnel) has certificate issues in Mooncake - see known issue disk-onenote-108/109
- For NFS mount troubleshooting, see guide: onenote-nfs-mount-failure-aks.md
- For NFS encryption setup, see guide: onenote-nfs41-encryption-in-transit-aznfs.md

## References
- NFS protocol: https://docs.azure.cn/zh-cn/storage/files/files-nfs-protocol
- SMB protocol: https://docs.azure.cn/zh-cn/storage/files/files-smb-protocol
