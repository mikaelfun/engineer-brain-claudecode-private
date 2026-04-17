# Blobfuse Detailed Logging on AKS

## Mount Options for Logging

Set `--log-level` in PV mountOptions:

```yaml
mountOptions:
  - -o allow_other
  - --file-cache-timeout-in-seconds=120
  - --use-attr-cache=true
  - --cancel-list-on-mount-seconds=10  # prevent billing charges on mounting
  - -o attr_timeout=120
  - -o entry_timeout=120
  - -o negative_timeout=120
  - --log-level=LOG_WARNING  # LOG_WARNING, LOG_INFO, LOG_DEBUG
  - --cache-size-mb=1000  # Default will be 80% of available memory
```

## Log Levels

| Level | Use Case |
|-------|----------|
| LOG_WARNING | Production default |
| LOG_INFO | Troubleshooting (recommended) |
| LOG_DEBUG | Deep debugging with source code |

## Reference

- [Azure Blob CSI driver mount options](https://docs.azure.cn/zh-cn/aks/azure-csi-blob-storage-provision?tabs=mount-blobfuse%2Csecret#storage-class-using-blobfuse)
