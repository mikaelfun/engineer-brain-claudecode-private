---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/Extension/Manually Remove Extension_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FHow%20Tos%2FExtension%2FManually%20Remove%20Extension_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Manually Remove VM Extension (Last Resort)

## Important

Always have the customer first attempt to remove the extension via the Portal or with PowerShell/CLI before attempting manual removal. Manual removal may leave stale state in CRP, causing unintended consequences on reinstall.

## Windows Procedure

1. Remove the registry key:

```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows Azure\HandlerState\<extension name>
```

2. Remove the extension folder:

```
c:\packages\plugins\<extension name>
```

3. Trigger a new Goal State:

**ARM VMs (PowerShell):**
```powershell
Set-AzVM -ResourceGroupName <ResourceGroupName> -Name <VMName> -Reapply
```

**ARM VMs (Azure CLI):**
```bash
az vm reapply -g <ResourceGroupName> -n <VMName>
```

**Classic VMs:** Add an endpoint (any port, can be removed later).

4. Force removal through PowerShell:

```powershell
Remove-AzVMExtension -ResourceGroupName <RGname> -VMName <VMName> -Name <ExtensionName> -Force
```

## Linux Procedure

Currently under review with PG. For questions, post on the SME channel (MGMT - Agent and Extensions).

## References

- [FixEmulatedIO removal](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494990)
- [FixLinuxDiagnostic removal](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494991)
- [RunCommand removal](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494998)
