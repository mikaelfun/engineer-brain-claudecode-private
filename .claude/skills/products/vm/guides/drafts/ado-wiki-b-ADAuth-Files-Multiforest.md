---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/TSGs/Azure Files Identity/Azure Active Directory (AAD) Kerberos Authentication/ADAuth Files Multiforest_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20All%20Topics%2FTSGs%2FAzure%20Files%20Identity%2FAzure%20Active%20Directory%20(AAD)%20Kerberos%20Authentication%2FADAuth%20Files%20Multiforest_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-All-Topics
- cw.TSG
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::
	 
 

[[_TOC_]]

 ##For the latest public guidance by engineering

 See [**Use Azure Files with multiple Active Directory forests**]( https://learn.microsoft.com/en-us/azure/storage/files/storage-files-identity-multiple-forests)

 Otherwise, refer to the example scenarios below. 

# Summary 
  
An AD forest contains a collection of domains (in a tree structure) that do not share a common namespace.  Each domain controller is able to access the "global catalog" which is a namespace service for all objects in that domain's forest.
 
If a Kerberos request comes from a client to access a domain resource within the forest, a domain controller finds the domain resource in the "global catalog" and routes it accordingly.
 
But, if a Kerberos request comes from a client to access a domain resource from another forest, there will be no entry for this domain resource in the "global catalog."  The domain controller receiving the request (from the client's domain) will have to decide where to route the request.
 
Usually, this is done based on the suffix of the domain resource object.  For instance, if a domain controller in REDMOND gets a request for cifs/servername.ntdev.corp.microsoft.com, it will know to route the request to the NTDEV domain.  When a trust was setup between REDMOND and NTDEV, NTDEV's DNS suffix was included in the trust's suffix list by default.
 
The problem with Azure Files is that all storage accounts end in *.file.core.windows.net rather than a DNS suffix for the domain that the storage account is joined to.  This makes it hard for domain controllers to be able to route Kerberos requests for Azure Files domain-joined storage accounts to the correct forest.
 
Additional configuration via "Name Suffix Routing" or a group policy is required.
 
Azure Files Share-Level Authorization based on Ticket SIDs
 
- A user joined to domain �A� and types �net use \\storageaccount.file.core.windows.net\sharename
- This triggers a Kerberos service ticket request to a domain controller in domain �A� for a domain resource named �cifs/storageaccount.file.core.windows.net�
	a. If the storage account is joined to domain �A� � **the domain controller verifies that the user has already authenticated to the domain and creates a service ticket that contains groups from domain �A�.**
	b. If the storage account is joined to a domain �B� in a different forest � the domain controller searches for �cifs/storageaccount.file.core.windows.net�, does not find it, and then looks at its suffix routing rules.  If there is a suffix routing rule in-place to route requests to *.file.core.windows.net to domain �B�, the request is redirected to domain �B�. **A domain controller from domain �B� creates the service ticket for the user, which contains groups from domain �A� and groups from domain �B� for that user.**
- The client gets this service ticket and passes it to Azure Files for authentication.  Azure Files decrypts it to authenticate the user and then creates an �access token� object that contains all of the SIDs that were present in this Kerberos ticket.  
- The SIDs present in this token are cross-checked with the �onpremisessecurityidentifiers� of any AAD identity that has been assigned RBAC permissions for the file share.
	a. If a match is found, the user is given share-level access to the file share.
	b. If a match is not found, we return �access denied� error.  
 
For this case, the takeaway here is that **unless a user is accessing a domain resource (ie. Storage account) outside of its current forest, the service ticket will not contain SIDs for any forest other than the one the user belongs to.**  There�s no need for a domain controller to put SIDS from another forest into a service ticket as these SIDS are not relevant to the authorization decisions on-premises services make based off this ticket.  
 


 
## Symptoms
 
Customers with improperly configured multi-forest environment have reported the following:
 
<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>Symptom</th>
<th>Cause</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td style="vertical-align:top"> No kerb ticket

Users mounting from a different forest than that of the storage account AD object see:
1.	Prompt for credentials
2.	"Username or Password is incorrect' error after typing in their correct username or password..
</td>
<td style="vertical-align:top"> 

 - The client couldn�t get a Kerberos ticket to the storage account.  This is because the service ticket request was received by the client's AD DC who did not find the object in the Global Catalog.  Since there was no trust with a DNS suffix of "file.core.windows.net" and no other routing in-place, the Kerberos request failed with "principal not found" error.
 - SMB client falls back to using NTLM after attempt to use Kerberos fails.  
Azure Files does not accept domain credentials over NTLM - so the error is "username or password is incorrect"
</td>
</tr>
<tr class="even">
<td style="vertical-align:top">Access denied 5

Users mounting from the same forest (forest "A") that the storage account AD object is in see "Access denied" error - even though they have been granted access to the share via an AD group (that AD group is part of a different forest, forest "B")
</td>
<td style="vertical-align:top">

 - The AD group in Forest "B" is not part of the ticket the user is getting for forest "A" 
 - Unless a user is accessing a domain resource (ie. Storage account) outside of its current forest, the service ticket will not contain SIDs for any forest other than the one the user belongs to.  There�s no need for a domain controller to put SIDS from another forest into a service ticket as these SIDS are not relevant to the authorization decisions on-premises services make based off this ticket.  
</td>
</tr>
</tbody>
</table>

 
### Required Trust
 
A trust must be setup between forests that enables clients from forest "A" to access Azure Files domain resources in forest "B".
 
## Config Option #1: Name Suffix Routing
 
Name suffix routing enables you to configure how authentication requests are routed between forests.  You can choose to add a name suffix routing rule to route all requests to "*.file.core.windows.net' to a specific forest.
 
	TSG: Configure name suffix routing to enable multiforest
 
Some things to be aware of with Name Suffix Routing.  
- This requires all storage accounts be "joined" to the same forest.  Due to company structure, forest structure is sometimes based on geography or totally different distinct companies.  It may not be possible or easy to manage to have admins from every forest create their storage accounts in a single forest.
- This does require adding the alternate UPN �file.core.windows.net� to the forest in which the storage accounts are joined to.  This is a domain-level change and some customers don't like the "cosmetics" of adding a weird UPN across the domain just to get a file share to work.  
- Given that this requires a change on the AD trust object as well as adding the alternate UPN, someone who is a domain admin likely has to make this change.
 
## Config Option #2: "Use Forest Search Order" GPO
 
- With this feature, domain controllers (or clients) can automatically search trusted forests for a specific SPN (ie. cifs/<storageaccount>.file.core.windows.net�) when it doesn�t find that SPN in its own forest.
- The path for this configuration is: Computer Configuration > Administrative Templates > System > Kerberos > �Use forest search order�  
- With this enabled, clients in the source forest would first request a service ticket from the source forest's domain controllers.  This would fail because the service principal is not found in theforest global catalog (database of objects).
- If a DC policy is in-place, the DC would iterate through its �forest search list� and ask each forest for this SPN.
- Once found, the Kerberos authentication request would go through the correct forest (destination forest where storage account is joined to)
- This can either be a client or domain controller policy.
- Note that this �forest search order� policy would apply to all Kerberos requests in the environment (domain or specific client) it is applied to.  There is no way to limit this logic to only requests for a specific suffix (ie. file.core.windows.net)
- For the value, Use a semicolon separated list of DNS suffixes (forests)
 
## Config Option #3: "Define host name-to-Kerberos realm mappings� GPO
 
- With this client-side configurations, you can specify mappings for specific suffixes (like file.core.windows.net) to specific realms (like REALMNAME.domain.com).  
- The path for this configuration is: Computer Configuration > Administrative Templates > System > Kerberos > �Define host name-to-Kerberos realm mappings�  
- For an example of how you could configure it, see below.  In sample situation of REDMOND's forest, it would be something like
	- Value name: corp.microsoft.com, Value: file.core.windows.net
	 
	![adGPO.png](/.attachments/SME-Topics/Azure-Files-All-Topics/adGPO-6acd1b4e-2bae-4385-a9cf-a0893337f42c.png)
	 
# Windows Explorer Limitation - Two-way forest trust
 
Azure Files ACL configuration in Windows Explorer works by Azure Files implementing a RPC server that handles a subset of RPC API calls from Windows Explorer.  While debugging this customer�s issue, we identified that the two-way forest scenario is dependent on an RPC API type that Azure Files currently does not implement or handle.   We have filed a work item to address this missing feature.  But  we do not have an ETA to provide at this time for its completion.  
 
At the same time, configuring ACLs through Windows Explorer is not the only way to set ACLs in Windows environments.  We�d recommend the customer to try out icacls command-line utility as a workaround until we are able to fix this.
 
- Error observed:
 
 ![adError.jpg](/.attachments/SME-Topics/Azure-Files-All-Topics/adError-7763bb49-2f23-4e95-b921-cc7550797fb9.jpg)


### Links 

[Main AD Auth TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495028)

==Case Coding ==
Azure Storage\File\AD Auth for Azure Files\

 [[Category:Azure]]
[[Category:Azure - TSG]]
[[Category:Azure Storage]]
[[Category:Azure Storage - TSG]]

|Role|Name  | Alias |
|--|--|--|
|Content Creator  | Leslie Davies | ledavies |
|  Editor | Drew Bailey | abail |


::: template /.templates/Processes/Knowledge-Management/Azure-Files-All-Topics-Feedback-Template.md
:::
