---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Linux/How-To/AMA Linux: HT: Find out the size of files or directories in Linux"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FAzure%20Monitor%20Agent%20(AMA)%20for%20Linux%2FHow-To%2FAMA%20Linux%3A%20HT%3A%20Find%20out%20the%20size%20of%20files%20or%20directories%20in%20Linux"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AMA Linux: Find Out the Size of Files or Directories

## Symptom
Log files (often AMA-related) keep growing indefinitely because logs fail to rotate, causing disk space to run out and the OS to halt.

## Steps to Find File Sizes
```bash
# List files with human-readable sizes
ls -lh

# List files with sizes in megabytes
ls -l --block-size=M
```

## Steps to Find Directory Sizes
```bash
# Show size of each directory/file in current folder
du -sh *

# Example: check AMA directory sizes
du -sh /var/opt/microsoft/azuremonitoragent/*
```

## Check Filesystem Space
```bash
# Check which filesystem a directory is on and space available
df -h /var/opt/microsoft/azuremonitoragent/events/
```
