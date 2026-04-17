# AKS Azure Files SMB — storage — 排查工作流

**来源草稿**: mslearn-mountoptions-azure-files.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Recommended mountOptions for Azure Files (SMB & NFS)
> 来源: mslearn-mountoptions-azure-files.md | 适用: 适用范围未明确

### 排查步骤

#### Recommended mountOptions for Azure Files (SMB & NFS)

Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/mountoptions-settings-azure-files

#### SMB Shares

Recommended mountOptions for StorageClass:

```yaml
mountOptions:
  - dir_mode=0777
  - file_mode=0777
  - mfsymlinks      # support symbolic links
  - cache=strict
  - nosharesock      # reduces reconnect race probability
  - actimeo=30       # reduces metadata-heavy workload latency
  - nobrl            # disable byte range locks for posix lock issues
```

#### NFS Shares

```yaml
mountOptions:
  - nconnect=4       # multiple connections for performance
  - noresvport       # improves availability
  - actimeo=30       # reduces metadata latency
```

#### Notes

- **Dynamic provisioning**: specify mountOptions on `StorageClass`
- **Static provisioning**: specify on `PersistentVolume`
- **Inline volume**: specify on `Pod` spec
- NFS requires `Premium_LRS` or `Premium_ZRS` SKU

---
