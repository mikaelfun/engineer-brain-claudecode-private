---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/ACE Identity TSGs/Identity Technical Wiki/AAD Connect - Synchronization/How to sync users from a second domain using AD Connect"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FACE%20Identity%20TSGs%2FIdentity%20Technical%20Wiki%2FAAD%20Connect%20-%20Synchronization%2FHow%20to%20sync%20users%20from%20a%20second%20domain%20using%20AD%20Connect"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Sync Users from a Second Domain Using AD Connect

## Overview

If a customer needs to integrate a new company/domain into an existing AD Connect setup that has active users syncing to an Azure AD tenant, there is a way to add the second domain to the Azure tenant so those users can also sync.

**Important prerequisites:**
- Review supported topologies: [Azure AD Connect Supported Topologies](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/plan-connect-topologies)
- An AD trust between the 2 domains must already be configured before proceeding.

## Resolution Steps

1. Launch **AD Connect** and click **Configure**.

2. Click **Customize synchronization options** and click **Next**.

3. Enter credentials to connect to Azure AD (must be a **Global Administrator** account).

4. Enter the name of the second domain and click **Add Directory**.

5. Enter the details of a user account in the domain that is a member of the **Enterprise Administrators** group.

6. The second domain will now appear in the configured directories list.

7. Select whether to sync **all objects** in the domain, or only objects in **specific OUs**.

8. Select any optional features required and click **Next**.

9. Optionally tick the box to **start synchronisation** once configuration completes (or leave unticked to keep AD Connect in disabled mode — activation via PowerShell required).

10. Click **Configure** to finish the process.

11. AD Connect will now synchronize objects from both domains into your Azure AD tenant. Monitor progress by launching the **AD Connect Synchronization Service Manager**.
