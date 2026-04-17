# AKS Windows 节点通用 -- Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-installing-scoop-windows-nodes.md, ado-wiki-tcpdump-on-windows-nodes.md, ado-wiki-troubleshooting-aks-windows-nodes.md
**Generated**: 2026-04-07

---

## Phase 1: Corrupted or incompatible Azure CLI installation o

### aks-706: Agentic CLI error on Windows: ImportError: DLL load failed while importing win32...

**Root Cause**: Corrupted or incompatible Azure CLI installation on Windows, missing win32file DLL dependency

**Solution**:
Uninstall and reinstall the latest Azure CLI client

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAgentic%20CLI%20for%20AKS)]`

## Phase 2: Docker ignored runAsUserName at pod-spec level whe

### aks-797: Windows pod sandbox creation fails with 'The user name or password is incorrect....

**Root Cause**: Docker ignored runAsUserName at pod-spec level when starting pause container, but containerd does not. containerd attempts to find the specified user inside the pause container image, causing authentication failure.

**Solution**:
Move securityContext.windowsOptions.runAsUserName from pod-level spec to individual container-level spec. Do not set runAsUserName in pod.spec.securityContext; set it only in pod.spec.containers[].securityContext instead.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Docker%20Deprecation)]`

## Phase 3: Dockerfile ENTRYPOINT uses backslash-relative path

### aks-798: Windows pod enters CrashLoopBackOff with error 'hcs::System::CreateProcess <depl...

**Root Cause**: Dockerfile ENTRYPOINT uses backslash-relative path format (.\ScriptName) which Docker handled but containerd does not. containerd cannot resolve the backslash path correctly.

**Solution**:
Change ENTRYPOINT from shell form with backslash path to exec form using PowerShell: ["powershell", "-NoProfile", "-Command", ".\\script.ps1"]. See https://github.com/containerd/containerd/issues/5067

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Docker%20Deprecation)]`

## Phase 4: Docker is no longer supported as container runtime

### aks-799: ContainerRuntime remains containerd even when specifying --aks-custom-headers Wi...

**Root Cause**: Docker is no longer supported as container runtime in AKS Windows agent pools for k8s v1.24+. The flag WindowsContainerRuntime=docker is silently ignored for v1.24+ Windows node pools.

**Solution**:
Use containerd as the container runtime on AKS Windows nodes with k8s v1.24+. Docker was fully removed from AKS Windows nodes as of September 2022. Migrate workloads to be containerd-compatible.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Docker%20Deprecation)]`

## Phase 5: Unknown

### aks-1311: Need to run kubectl commands on windows node in kubernetes cluster.

**Root Cause**: N/A

**Solution**:
- Need to get kubectl exe file on the windows machine. - Need to copy the kubernetes config file from master node. - Run the below commands to set the environmental variable for kubectl. Note: Here in C:\kube we have the kubectl.exe and kubernetes config file in windows. $env:Path += ";C:\kube" [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\kube", [EnvironmentVariableTarget]::Machine) $env:KUBECONFIG= "C:\kube\config" [Environment]::SetEnvironmentVariable("KUBECONFIG", "C:\kube\config", [EnvironmentVariableTarget]::User) - After running this commands we can able to use kubectl commands on kubernetes cluster windows node.

`[Score: [B] 6.5 | Source: [ContentIdea#163532](https://support.microsoft.com/kb/5015060)]`

## Phase 6: This is a code defect / timing which causes the ms

### aks-1326: Windows Server 2022 Images previous to the 2025 11B updates may crash with Bugch...

**Root Cause**: This is a code defect / timing which causes the msquic.sys driver to register an etw session on its driver entry routine. If the module had not been previously loaded / unloaded, when nodes are teardown the driver entry routine will be called causing a registration to occur. This occurs in the context of windows performing etw cleanup code, which finds an etw registration on a list that should be otherwise empty, triggering the Bugcheck.

 The code defect has been resolved in FE and GE. See bugs below.

**Solution**:
FE bug: Bug 58533461 [Fe] Ensure that DriverEntry is never called while a thread is attached to a server silo GE Bug: Bug 57359043 Ensure that DriverEntry is never called while a thread is attached to a server silo

`[Score: [B] 6.5 | Source: [ContentIdea#208599](https://support.microsoft.com/kb/5081002)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Agentic CLI error on Windows: ImportError: DLL load failed while importing win32... | Corrupted or incompatible Azure CLI installation on Windows,... | Uninstall and reinstall the latest Azure CLI client | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAgentic%20CLI%20for%20AKS) |
| 2 | Windows pod sandbox creation fails with 'The user name or password is incorrect.... | Docker ignored runAsUserName at pod-spec level when starting... | Move securityContext.windowsOptions.runAsUserName from pod-l... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Docker%20Deprecation) |
| 3 | Windows pod enters CrashLoopBackOff with error 'hcs::System::CreateProcess <depl... | Dockerfile ENTRYPOINT uses backslash-relative path format (.... | Change ENTRYPOINT from shell form with backslash path to exe... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Docker%20Deprecation) |
| 4 | ContainerRuntime remains containerd even when specifying --aks-custom-headers Wi... | Docker is no longer supported as container runtime in AKS Wi... | Use containerd as the container runtime on AKS Windows nodes... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Docker%20Deprecation) |
| 5 | Need to run kubectl commands on windows node in kubernetes cluster. | - | - Need to get kubectl exe file on the windows machine. - Nee... | [B] 6.5 | [ContentIdea#163532](https://support.microsoft.com/kb/5015060) |
| 6 | Windows Server 2022 Images previous to the 2025 11B updates may crash with Bugch... | This is a code defect / timing which causes the msquic.sys d... | FE bug: Bug 58533461 [Fe] Ensure that DriverEntry is never c... | [B] 6.5 | [ContentIdea#208599](https://support.microsoft.com/kb/5081002) |
