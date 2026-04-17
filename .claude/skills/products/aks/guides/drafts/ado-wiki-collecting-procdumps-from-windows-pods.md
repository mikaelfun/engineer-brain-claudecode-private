---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Windows/Collecting procdumps from Windows pods"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FWindows%2FCollecting%20procdumps%20from%20Windows%20pods"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Collect a Process Dump from a Windows Pod

## Summary

Step-by-step guide to collect process dumps (procdumps) from Windows pods in AKS using Sysinternals Procdump tool.

## Steps

1. **Exec into the Windows pod**:
   ```ps
   kubectl exec -it [WINDOWS-POD-NAME] -- powershell
   ```

2. **Create a temp folder**:
   ```ps
   cd\
   md temp
   ```

3. **Download and extract Procdump**:
   ```ps
   Invoke-WebRequest -UseBasicParsing -Uri https://download.sysinternals.com/files/Procdump.zip -OutFile C:\temp\procdump.zip
   cd temp
   Expand-Archive .\procdump.zip
   cd .\procdump\
   ```

4. **List processes**:
   ```ps
   Get-Process
   ```

5. **Run procdump** (3 dumps at 5s intervals):
   ```ps
   .\procdump.exe -ma PROCESS_ID -s 5 -n 3 -64 -accepteula
   ```

6. **Copy dump off the pod**:
   ```ps
   kubectl cp namespace/podName:/temp/procdump/filename.dmp /folder/filename.dmp
   ```

Reference: https://kubernetes.io/docs/reference/kubectl/cheatsheet/#copying-files-and-directories-to-and-from-containers
