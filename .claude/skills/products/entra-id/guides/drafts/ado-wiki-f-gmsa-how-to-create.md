---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/GMSA/Workflow: gMSA : How to create a gMSA"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FGMSA%2FWorkflow%3A%20gMSA%20%3A%20How%20to%20create%20a%20gMSA"
importDate: "2026-04-07"
type: troubleshooting-guide
---

### Summary
This article provides a comprehensive guide on creating a Group Managed Service Account (gMSA) in a Windows environment. It includes steps for ensuring Domain Controllers (DCs) have a Key Distribution Services (KDS) root key and instructions for creating the gMSA.

## Creating a gMSA

Creating a Group Managed Service Account (gMSA) is a two-step process:
1. Make sure the Domain Controllers (DCs) have a Key Distribution Services (KDS) root key in the forest.
2. Create the gMSA.

### Step 1: Ensure DCs have a KDS root key

Domain Controllers require a root key to begin generating gMSA passwords. Make sure that you have a valid KDS root key by running the command `Get-KdsRootKey`.

#### Create KDS root key

If the KDS root key is not present in the forest, you need to create it by running the command `Add-KdsRootKey`.

The domain controllers will wait up to 10 days from the time of creation to allow all domain controllers to converge their Active Directory (AD) replication before allowing the creation of a gMSA. This is a safety measure to prevent password generation from occurring before all DCs in the environment are capable of answering gMSA requests.

**By default, a KDS root key is created with an effective date set to 10 days after the current date.**

The Effective time parameter can be used to give time for keys to propagate to all DCs before use. Using `Add-KdsRootKey -EffectiveImmediately` will add a root key to the target DC, which will be used by the KDS service immediately. However, other domain controllers will not be able to use the root key until replication is successful.

**It will still require 10 hours of synchronization time to become fully operational.**

KDS root keys are stored in Active Directory in the container `CN=Master Root Keys,CN=Group Key Distribution Service,CN=Services,CN=Configuration,DC=<forest name>`. They have an attribute `msKds-DomainID` that links to the computer account of the Domain Controller that created the object.

#### Creating the KDS root key in a test environment

For test environments with only one DC, you can create a KDS root key and set the start time in the past:

```powershell
$a=Get-Date
$b=$a.AddHours(-10)
Add-KdsRootKey -EffectiveTime $b

# Or use a single command
Add-KdsRootKey -EffectiveTime ((get-date).addhours(-10))
```

### Step 2: Create the gMSA

```powershell
New-ADServiceAccount -Name <TestGMSA> -DNSHostName <TestGMSA.Contoso.com> -PrincipalsAllowedToRetrieveManagedPassword <object name>
```

#### Parameters:
- `-Name`: Specifies the name of the object (LDAP Display Name: `name`).
- `-DNSHostName`: Specifies the DNS host name of the Service Account.
- `-PrincipalsAllowedToRetrieveManagedPassword`: Specifies the membership policy for systems that can use a group-managed service account. Sets the `msDS-GroupMSAMembership` attribute.
- `-ManagedPasswordIntervalInDays`: Specifies the password change interval (default: 30 days, cannot be modified after creation). Sets `msDS-ManagedPasswordInterval`.

### References
- [Create the Key Distribution Services KDS Root Key](https://learn.microsoft.com/en-us/windows-server/security/group-managed-service-accounts/create-the-key-distribution-services-kds-root-key)
- [New-ADServiceAccount](https://learn.microsoft.com/en-us/powershell/module/activedirectory/new-adserviceaccount?view=windowsserver2022-ps)
- [Getting Started with Group Managed Service Accounts](https://learn.microsoft.com/en-us/windows-server/security/group-managed-service-accounts/getting-started-with-group-managed-service-accounts)
