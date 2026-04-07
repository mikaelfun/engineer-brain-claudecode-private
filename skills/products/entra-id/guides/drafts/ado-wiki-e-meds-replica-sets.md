---
source: ado-wiki
sourceRef: "Supportability\AzureAD\AzureAD;C:\Program Files\Git\GeneralPages\AAD\AAD Account Management\Microsoft Entra Domain Services\Microsoft Entra Domain Services Replica Sets"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Microsoft%20Entra%20Domain%20Services/Microsoft%20Entra%20Domain%20Services%20Replica%20Sets"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
- cw.comm-orgmgt
- cw.AADDS
- cw.TSG
- cw.TSG-AADDS
- cw.comm-orgmgt-tsg
- Replica-Sets
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Account-Management](/Tags/AAD%2DAccount%2DManagement) [AzureAD](/Tags/AzureAD) 

 
[[_TOC_]]



# Feature overview

Replica sets are now in public preview.

When you create a Microsoft Entra Domain Services (MEDS) managed domain, you define a unique namespace. This namespace is the domain name, such as aaddscontoso.com, and two domain controllers (DCs) are then deployed into your selected Azure region. This deployment of DCs is known as a replica set.

You can expand a managed domain to have more than one replica set per Microsoft Entra ID tenant. This ability provides geographical disaster recover for a managed domain. You can add a replica set to any peered virtual network in any Azure region that supports MEDS. Additional replica sets in different Azure regions provide geographical disaster recovery for legacy applications if an Azure region goes offline.

## How replica sets work
When you create a managed domain, such as aaddscontoso.com, an initial replica set is created to apply the domain configuration. Additional replica sets share the same namespace and configuration. Configuration changes, or user and credentials updates, are applied to all replica sets in the managed domain using AD DS replication.

You create each replica set in a virtual network. Each virtual network must be peered to every other virtual network that hosts a managed domain's replica set. This configuration creates a mesh network topology that supports directory replication. A virtual network can support multiple replicas sets provided each replica set is in a different virtual subnet.

Users, groups, group memberships, and password hashes are replicated using normal intrasite replication to provide the quickest convergence possible.


Here is a high-level diagram of a Microsoft Entra Domain Service with two replica sets?The first replica set created with the domain namespace and a second replica set:

[![Example2regions-0001.png](/.attachments/AAD-Account-Management/350991/Example2regions-0001.png)]



# Case handling

This feature is supported by [MSaaS AAD - Account Management Professional](https://msaas.support.microsoft.com/queue/ce0b7553-9d09-e711-8121-002dd815174c), [MSaaS AAD - Account Management Premier](https://msaas.support.microsoft.com/queue/6014a8ba-465c-e711-8129-001dd8b72a0c)


# Licensing
There are no licensing requirements. An Azure subscription is required.

# Risks

There are currently no known risks. For preview features we strongly recommend ou to using a test tenant.

# Limitations and known issues

Replica sets DO NOT enable multiple unique Microsoft Entra Domain Services domain names (instances) in a single Azure tenant. 

During the public preview a managed domain is currently limited to four replicas - the initial replica set, and three additional replica sets. We are testing adding more at GA but this is in the investigation stage.

Azure bills each created replica set based on the domain configuration SKU. For example, if you have Microsoft Entra Domain at the Enterprise SKU and you have three (3) replica sets, then Azure will bill your subscription .40 per hour (the Enterprise SKU rate) per each replica sets for a total of three replica sets.

For an application to have geographical redundancy in the event of a regional outage, the application platform that relies on Azure AD Domain Services MUST also reside in the other region. 

All DCs in all replica sets are in the same Active Directory site. This means Active Directory replication between DCs is **intra-site**. Intra-site replication means there should be no noticeable delay in replication.



# How to configure and manage

See [Tutorial - Create a replica set in Microsoft Entra Domain Services](https://review.learn.microsoft.com/en-us/entra/identity/domain-services/tutorial-create-replica-set?branch=main&branchFallbackFrom=pr-en-us-120618) for step by step setup instructions.

Note: The above link is a review link and will be updated as docs are made public. Please report bad links to paulhut@microsoft.com

Note: When the deployment is completed it will show only 1 DC and after 1 hour the second DC is completed.


# Troubleshooting from the portal

There are stable and existing troubleshooters for general Azure AD Domain Services in the CSS Support Wiki. See: 

[Azure AD Domain Services - Sync Troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/184100/Azure-AD-Domain-Services-Sync-Troubleshooting)


[Azure AD Domain Services - LDAPS Troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/341601/Azure-AD-Domain-Services-LDAPS-Troubleshooting)

[Azure AD Domain Services Account Lockout Troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/343034/Azure-AD-Domain-Services-Account-Lockout-Troubleshooting)

[Azure AD Domain Services - Windows Domain Join Troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/343280/Azure-AD-Domain-Services-Windows-Domain-Join-Troubleshooting)

[Azure AD Domain Services - Unix Domain Join Troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/343543/Azure-AD-Domain-Services-Unix-Domain-Join-Troubleshooting)


# Troubleshooting from the management VM

As there is no access to the console of domain controllers in Microsoft Entra Domain Services a management VM must be deployed and joined to the domain with a set of AD DS tools installed. 

At a minimum you should install:

- AD DS and AD LDS Tools

- DNS Server Tools

- Group Policy Management

This is done from the Server Manager Dashboard. 

1. Select Add roles and features to start the Add Roles and Features wizard.

2. Select **Next 4 times** to arrive at the **Select features** page

3. Select (check) Group Policy Management

4. Scroll down and expand **Remote Server Administration Tools** and **Role Administration Tools**

5. Select (check) **AD DS and AD LDS Tools** and **DNS Server Tools**

6. Select **Next** and then **Install** to complete

## How to list DCs and their IP addresses

Use nltest.exe to display a list of the domain controllers. Example: **nltest /dclist:ad.contoso.ml**


[![2020-06-30_14-41-13.png](/.attachments/AAD-Account-Management/350991/2020-06-30_14-41-13.png)](/.attachments/AAD-Account-Management/350991/2020-06-30_14-41-13.png)


There are several methods to discover the DC?s IP address: **Azure Support Center?s resource explorer,** in the **portal on the Azure AD Domain Service**, or using **nslookup.exe** from the management VM. 

[![2020-07-09_11-51-00.png](/.attachments/AAD-Account-Management/350991/2020-07-09_11-51-00.png)](/.attachments/AAD-Account-Management/350991/2020-07-09_11-51-00.png)

## Verify name resolution

Remember, when checking for errors in an MEDS domain the first place to look is DNS.

 

- Ping the FQN of the domain. A DNS server should reply. For example: From the VM that is having connectivity problems ping the **ad.contoso.ml** domain name. One of the authoritative DNS servers for ad.contoso.ml should reply.

- If you can't ping the domain name, ping a DC by name, then ping by IP address if the name fails.

- Be sure network connections are working. Ping the IP address, other machines on the subnet, etc. 

**If you can't ping the IP address, it?s (typically) a network issue.** 

 **If you can ping the address but can't ping the name, it?s (typically) a DNS issue.**

## Domain join issues

Domain join failures can be vexing. On the VM you might get an error stating a domain controller could not be contacted.

1. You can check c:\windows\debug\netsetup.log for any errors. In this case we see error **0x54b**

[![2020-07-10_10-40-08.png](/.attachments/AAD-Account-Management/350991/2020-07-10_10-40-08.png)](/.attachments/AAD-Account-Management/350991/2020-07-10_10-40-08.png)




2. Using the windows tool err.exe we can see that 0x54b in the winerror.h header file translates to The specified domain either does not exist or could not be contacted.

[![2020-07-10_10-43-26.png](/.attachments/AAD-Account-Management/350991/2020-07-10_10-43-26.png)](/.attachments/AAD-Account-Management/350991/2020-07-10_10-43-26.png)

Here?s some things to look for:

1. Ping PDC  -- Fails
2. Ping FQN of the domain ? Fails
3. Ping IP of the PDC ? Success 

In this example we know that routing and connectivity is good but DNS name resolution is failing because pinging by IP address succeeds.

[![2020-07-10_10-38-01.png](/.attachments/AAD-Account-Management/350991/2020-07-10_10-38-01.png)](/.attachments/AAD-Account-Management/350991/2020-07-10_10-38-01.png)

## Understanding MEDS replication

(Note: **Sync** is changes from Microsoft Entra ID to Microsoft Entra Domain Services. **Replication** is how changes propagate between domain controllers in Azure AD DS)

Replication is between DCs in Microsoft Entra Domain Services. If you have worked on anything AD related in the past you will be familiar with this.

1. An object is updated and its USN incremented.
2. KCC has determined our replication partners (in our case all since we are intra-site.)
3. DC with change queries DNS for IP of its replication partner.
4. DC with change notifies downstream partner of update.
5. Downstream partner requests change to be sent.
6. DC with change sends the update.
7. Downstream partner writes change to AD database.



This occurs very fast in MEDS because all DCs are in the same AD site. Replication should be instant.

[![ADREplication.png](/.attachments/AAD-Account-Management/350991/ADREplication.png)](/.attachments/AAD-Account-Management/350991/ADREplication.png)


We can run this on the management VM to demonstrate that all DCs are in sync.

1. In the following image, each dot after the first three represents a domain controller. There are 7 dots in this diagram, so there are total 4 Domain controllers in the forest.
2. The Largest delta denotes the longest replication gap amongst all replication links for a particular domain controller.
3. The Total is the replica links for a particular domain controller (one for each naming context on each domain controller).
4. Fail shows the total number of replica links failing to replicate for one reason or the other. This will never be greater than the Total field.
5. Percentage is the percentage of failures in relation to the total replica links on the domain controller.

When we look at this, we notice that it is divided into two main sections -- Source DSA and Destination DSA. We will also notice that the same servers are listed in both sections. The reason for this is that Active Directory uses a multi master domain model. In other words, Active Directory updates can be written to any domain controller. 

Those updates are then replicated to the other domain controllers in the domain. This is the reason why we see the same domain controllers listed as both source and destination DSAs.

[![2020-06-30_14-43-01.png](/.attachments/AAD-Account-Management/350991/2020-06-30_14-43-01.png)](/.attachments/AAD-Account-Management/350991/2020-06-30_14-43-01.png)


## Checking replication and object updates

Let?s say you have a customer that suspects a password change has not fully replicated to all DCs in MEDS. You can run this command against the object in question and see passwdLastSet and the timestamp it was updated. 

**repadmin /showobjmeta * "CN=Otto Langer,OU=AADDC Users,DC=ad,DC=contoso,DC=ml?**


By comparing the replication metadata for the same object on different domain controllers, you can determine whether replication has occurred, or which domain controller added, modified, or deleted an attribute or object. You can reference an object by its distinguished name path (as shown here,) object GUID, or security identifier (SID). If the distinguished name path includes a space, enclose it in quotation marks.



[![2020-07-12_11-46-02.png](/.attachments/AAD-Account-Management/350991/2020-07-12_11-46-02.png)](/.attachments/AAD-Account-Management/350991/2020-07-12_11-46-02.png)

Although the **repadmin /showobjmeta** command displays the number of times that the attributes on an object have changed and which domain controller made those changes, the **repadmin / showattr** command displays the actual values for an object. 

The **repadmin /showattr** command can also display the values for objects that are returned by a command-line Lightweight Directory Access Protocol (LDAP) query.

**repadmin /showattr * "CN=Otto Langer,OU=AADDC Users,DC=ad,DC=contoso,DC=ml?**

This shows all attributes:

[![2020-07-12_11-50-54.png](/.attachments/AAD-Account-Management/350991/2020-07-12_11-50-54.png)](/.attachments/AAD-Account-Management/350991/2020-07-12_11-50-54.png)

To make it even more targeted you can focus on a single attribute over all of the DCs. Here is an example of **badPwdCount**.

Note the **badPwdCount** appears to be inconsistent. That?s because this attribute does not replicate so the inconsistency is expected.

[![2020-07-12_12-08-27.png](/.attachments/AAD-Account-Management/350991/2020-07-12_12-08-27.png)](/.attachments/AAD-Account-Management/350991/2020-07-12_12-08-27.png)






# ICM escalations

Use this template to file an ICM: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=6351M1

For engineering to debug this, here is the information we should supply:

**Common to all:**

|                                                        |
| :----------------------------------------------------- |
| Exact error message or behavior                        |
| What behavior is the customer expecting?               |
| Tenant GUID for the customer                           |
| Exact Repro steps                                      |
| UPN of user who is experiencing the issue              |
| When did it happen? Exact Time and Date and Time zone. |

**If this is an authentication issue:**

| UPN of user who is experiencing the issue (one example)      |
| ------------------------------------------------------------ |
| Is the user object created in AAD as a result of AAD Sync? If yes, was a full sync done on AAD Connect? If so, when (in UTC)?If no, was the user?s password changed? If so, when (in UTC)? |

**If this is an user object attribute mismatching expectations:**

|                                                              |
| :----------------------------------------------------------- |
| UPN of user who is experiencing the issue (one example)      |
| Is the user object created in AAD as a result of AAD Sync?   |
| Dump of the user object on AAD from Entra powershell          |
| Dump of the user object on MEDS from ldp, for example showing all the attributes |

**If this is about changes that are done in AAD, but not available in AAD DS:**

Example of a change that was done in AAD, with the object dumped with Entra PowerShell command, and changes highlighted, the timestamp of the change (in UTC)

# Supportability documentation

## External documentation

Conceptual doc -?[Replica sets concepts for Microsoft Entra Domain Services](https://learn.microsoft.com/en-us/entra/identity/domain-services/concepts-replica-sets) 

Tutorial -?[Tutorial - Create a replica set in Microsoft Entra Domain Services](https://learn.microsoft.com/en-us/entra/identity/domain-services/tutorial-create-replica-set)


## Training sessions and brownbags

The brownbag is located here: https://aka.ms/AA8yzq8


