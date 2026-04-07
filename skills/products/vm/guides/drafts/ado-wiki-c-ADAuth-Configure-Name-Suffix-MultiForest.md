---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/TSGs/Azure Files Identity/AD DS with AD Connect Syncing to AAD with AAD DS/ADAuth Configure Name Suffix MultiForest_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FTSGs%2FAzure%20Files%20Identity%2FAD%20DS%20with%20AD%20Connect%20Syncing%20to%20AAD%20with%20AAD%20DS%2FADAuth%20Configure%20Name%20Suffix%20MultiForest_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Overview

The domain environment has multiple forests - or multiple tree collections of domains.
Typically, when setting up a forest trust, it automatically configures the domains to know to reach out to the other forest based on the "suffix" of the forest.

When a domain in forest A wants to reach an Azure storage account in forest B, this will not automatically work because the service principal of the storage account does not have a suffix matching the suffix of any domain in forest B.

It can work by manually configuring a suffix routing rule from forest A to forest B for a custom suffix of "file.core.windows.net" or modify the storage account name suffix to use the internal domain name instead of "file.core.windows.net"

# Detection / Diagnosis - Mount fails due to resource outside of forest where routing is not configured.

### Check to see if user and storage account domain object are in two different forests.

- Customer might already know they are in multiple forest environment
- If not, run following PowerShell on a VM from user domain, then from storage account domain, and compare the value of "Forest". If they're different, this is a multiple forest environment.

```powershell
get-addomain

# Check the "Forest" field in output:
# Forest: corp.microsoft.com
```

- If they're different and customer hasn't configured suffix routing for *.file.core.windows.net, proceed to next section.

### Wireshark Capture

Have the customer execute the following in order to capture the Kerberos traffic of the client accessing the storage account.

1. Download Wireshark https://www.wireshark.org/download.html and open the Wireshark application
2. Type `klist purge`
3. In Wireshark, Capture -> Start
4. Type `klist get cifs/<storageaccount>.file.core.windows.net`
5. Type `klist purge`
6. Type `net use \\<storageaccount>.file.core.windows.net\<shareName>`
7. In Wireshark, Capture -> Stop
8. File -> Save As

Then, look for:

1. **Kerberos TGS-REQ** for the storage account SPN `cifs/<storageaccount>.file.core.windows.net`
2. **Error response**: `KRB5KDC_ERR_S_PRINCIPAL_UNKNOWN` - indicates suffix routing is not configured
3. **Fallback to NTLM**: `Session Setup Request, NTLMSSP_NEGOTIATE` followed by `STATUS_LOGON_FAILURE`

# Mitigation 1: Name Suffix Routing

Adding custom name suffix in forest B for file.core.windows.net and a routing rule in forest A.

> Best when customer has no plans to integrate other storage accounts with forest A accessed from forest B (AD doesn't support duplicate name suffix in same forest trust).

1. **Adding the new custom suffix on forest B**
   - Logon to a VM in forest B
   - Open "Active Directory Domains and Trusts"
   - Right click on "Active Directory Domains and Trusts" -> Properties
   - Click "Add"
   - Add `file.core.windows.net`
   - Click Apply

2. **Adding the suffix routing rule to forest A**
   - Logon to a VM in forest A
   - Open "Active Directory Domains and Trusts"
   - Right-click on the domain -> select the "outgoing" trust of Forest B
   - Click Properties -> "Name Suffix Routing"
   - See that `*.file.core.windows.net` shows up (click Refresh if not)
   - Select `*.file.core.windows.net` -> Enable -> Apply

3. **Validate**
   ```cmd
   klist get cifs/onprem2testaccount.file.core.windows.net
   ```
   Should see a valid Kerberos ticket output.

# Mitigation 2: CNAME + SPN (Recommended for bi-directional multi-forest)

Best when customer has Azure file shares in each forest with cross-forest access needed.

1. **Add CNAME record in DNS**
   - Open AD DNS Manager
   - Go to Forward Lookup Zones -> your domain (e.g., fabrikam.com)
   - Right-click -> New Alias (CNAME)
   - Alias name: `<storage-account-name>`
   - Target host FQDN: `<storage-account-name>.file.core.windows.net`

2. **Modify SPNs of the storage account**
   ```cmd
   setspn -s cifs/<storage-account-name>.<DomainDnsRoot> <storage-account-name>
   ```
   Find `<DomainDnsRoot>` with: `(Get-AdDomain).DnsRoot`

Now users can access storage accounts in both forests using the internal domain name.

### References

- [Use Azure Files with multiple Active Directory forests](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-multiple-forests)
