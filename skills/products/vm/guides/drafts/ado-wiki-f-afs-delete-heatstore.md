---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/TSG 213 AFS Cloud Tiering Deleting a heatstore_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FTSG%20213%20AFS%20Cloud%20Tiering%20Deleting%20a%20heatstore_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG 213: AFS Cloud Tiering - Deleting a Heatstore

> **WARNING**: This TSG contains steps to delete AFS databases. Backup existing directories before and apply caution.

## Summary

Steps to delete the heat store database when required. Deleting the DB is currently the only way to reset heat history.

## Procedure

### 1. Backup Existing Files

Follow steps 1, 2, and 3 from TSG 212 (Collect heatstore for offline analysis) first.

### 2. Delete the Heat Store

> **WARNING**: Perform this step only if deletion is required.

```
CD <drive>:\System Volume Information\HFS\HeatStore\DB
del *.*
```

### 3. Restart Storage Sync Agent

```
sc config "filesyncsvc" start=auto
net start filesyncsvc
```

Or via Services.msc: Right-click Storage Sync Agent > Startup type: Automatic > Ensure service is running.
