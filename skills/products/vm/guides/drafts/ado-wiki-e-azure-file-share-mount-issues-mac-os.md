---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/TSGs/Azure file share mount issues on MAC OS_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FTSGs%2FAzure%20file%20share%20mount%20issues%20on%20MAC%20OS_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## How to mount file share on MAC-OS

You can use one of the below two options:

- [Mount an Azure file share via Finder](https://docs.microsoft.com/en-us/azure/storage/files/storage-how-to-use-files-mac#mount-an-azure-file-share-via-finder)
- [Mount an Azure file share via Terminal](https://docs.microsoft.com/en-us/azure/storage/files/storage-how-to-use-files-mac#mount-an-azure-file-share-via-terminal)

## Known-issues

1. There is a bug at OS level regarding the unsupported character "/". See: [Cannot mount file share to MacOS no route to host](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/662566/Cannot-mount-file-share-to-MacOS-no-route-to-host)

2. Connection failures. Error: "There is a problem connecting to the server: *.file.core.windows."

3. Error: RPC struct is bad when mounting on 10.13 High Sierra

## Limitations

1. Azure Files does not currently support identity-based authentication to mount a file share on macOS.
   See: [Mount an Azure File share on macOS](https://learn.microsoft.com/en-us/azure/storage/files/storage-how-to-use-files-mac)

2. Azure file shares can be mounted with the industry standard SMB 3 protocol by macOS High Sierra 10.13+ or higher version.

## Troubleshooting steps

### Issue 1: Cannot mount / "no route to host"
See: [Cannot-mount-file-share-to-MacOS-no-route-to-host TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/662566/Cannot-mount-file-share-to-MacOS-no-route-to-host)

If it fails, generate two network capture traces:
- Generate network capture when trying to mount the failing file share (use Wireshark)
- Test network connectivity: `nc -vz storageaccountname.file.core.windows.net -port 445` or `telnet storageaccountname.file.core.windows.net 445`
- Successful output: `Connection to storageaccount.file.core.windows.net port 445 [tcp/https] succeeded!`

### Issue 2: Port 445 blocked
**Cause**: Port 445 is not open at the customer side.

**Diagnostics**:
- Check Jarvis (XSMBPerfMetric event) - no errors if port 445 blocked since communication does not reach backend
- Use ASC > XDiagnostics to check during the timestamp provided by the customer
- Test connectivity: `nc -vz storageaccountname.file.core.windows.net -port 445`

### Issue 3: RPC struct is bad (macOS < 10.13)
**Scope**: Only seen on macOS running below 10.13 (High Sierra).

**Diagnostics**:
- Check Jarvis (XSMBPerfMetric) - may show no errors if request not reaching backend
- Use ASC > XDiagnostics
- Wireshark trace: client stops sending further SMB calls after negotiation response
- Escalation: engage MAC support to review client side logs for SMB negotiation failure
- [Apple Support - Connect Mac to shared computers/servers](https://support.apple.com/guide/mac-help/connect-mac-shared-computers-servers-mchlp1140/mac)

## References
- [Mount Azure File share on macOS](https://docs.microsoft.com/en-us/azure/storage/files/storage-how-to-use-files-mac)
- [Azure Files NFS protocol support](https://learn.microsoft.com/en-us/azure/storage/files/files-nfs-protocol#support-for-azure-storage-features)
