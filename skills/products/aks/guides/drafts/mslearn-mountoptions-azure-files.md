# Recommended mountOptions for Azure Files (SMB & NFS)

Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/storage/mountoptions-settings-azure-files

## SMB Shares

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

## NFS Shares

```yaml
mountOptions:
  - nconnect=4       # multiple connections for performance
  - noresvport       # improves availability
  - actimeo=30       # reduces metadata latency
```

## Notes

- **Dynamic provisioning**: specify mountOptions on `StorageClass`
- **Static provisioning**: specify on `PersistentVolume`
- **Inline volume**: specify on `Pod` spec
- NFS requires `Premium_LRS` or `Premium_ZRS` SKU
