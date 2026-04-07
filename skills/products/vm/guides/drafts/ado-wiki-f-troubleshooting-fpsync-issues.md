---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/TSGs/Network File Systems (NFS)/Troubleshooting fpsync issues_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FTSGs%2FNetwork%20File%20Systems%20(NFS)%2FTroubleshooting%20fpsync%20issues_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting fpsync Issues

## Overview

Microsoft recommends fpsync for migrating Linux file servers to NFS Azure File Shares.
See: https://learn.microsoft.com/en-us/azure/storage/files/storage-files-migration-nfs

fpsync supports baseline, incremental, and final copy operations.

## How to Install and Use

Steps documented at: https://learn.microsoft.com/en-us/azure/storage/files/storage-files-migration-nfs?tabs=ubuntu#using-fpsync-vs-rsync

## Debug fpsync Issues

- fpsync logs timestamps of start/stop, parts created by fpart, processes under /tmp/fpsync/log/<fpart-run-id>
- Check .log files at /tmp/fpsync/log/<fpsync-run-id>:
  - "Fpsync completed without error" = success
  - "Fpsync completed with error" = failure
- Check .err files for specific error details
- Use fpsync -vv for verbose monitoring
- Use rsync verbose with -o option in fpsync

## Escalation

Escalate through usual channels (Ava/ICM). Collect fpsync logs for the migration job and share in ICM.
Do NOT redirect customers to external fpsync forums unless recommended by PG.
