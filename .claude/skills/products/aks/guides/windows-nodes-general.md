# AKS Windows 节点通用 -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 6
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Agentic CLI error on Windows: ImportError: DLL load failed while importing win32... | Corrupted or incompatible Azure CLI installation on Windows,... | Uninstall and reinstall the latest Azure CLI client | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAgentic%20CLI%20for%20AKS) |
| 2 | Windows pod sandbox creation fails with 'The user name or password is incorrect.... | Docker ignored runAsUserName at pod-spec level when starting... | Move securityContext.windowsOptions.runAsUserName from pod-l... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Docker%20Deprecation) |
| 3 | Windows pod enters CrashLoopBackOff with error 'hcs::System::CreateProcess <depl... | Dockerfile ENTRYPOINT uses backslash-relative path format (.... | Change ENTRYPOINT from shell form with backslash path to exe... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Docker%20Deprecation) |
| 4 | ContainerRuntime remains containerd even when specifying --aks-custom-headers Wi... | Docker is no longer supported as container runtime in AKS Wi... | Use containerd as the container runtime on AKS Windows nodes... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Docker%20Deprecation) |
| 5 | Need to run kubectl commands on windows node in kubernetes cluster. | - | - Need to get kubectl exe file on the windows machine. - Nee... | [B] 6.5 | [ContentIdea#163532](https://support.microsoft.com/kb/5015060) |
| 6 | Windows Server 2022 Images previous to the 2025 11B updates may crash with Bugch... | This is a code defect / timing which causes the msquic.sys d... | FE bug: Bug 58533461 [Fe] Ensure that DriverEntry is never c... | [B] 6.5 | [ContentIdea#208599](https://support.microsoft.com/kb/5081002) |

## Quick Troubleshooting Path

1. Check: Uninstall and reinstall the latest Azure CLI client `[source: ado-wiki]`
2. Check: Move securityContext `[source: ado-wiki]`
3. Check: Change ENTRYPOINT from shell form with backslash path to exec form using PowerShell: ["powershell",  `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/windows-nodes-general.md)
