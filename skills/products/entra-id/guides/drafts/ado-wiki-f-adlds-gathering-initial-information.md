---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADLDS/ADLDS Gathering Initial Information About the Environment"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADLDS%2FADLDS%20Gathering%20Initial%20Information%20About%20the%20Environment"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary:**
This guide provides step-by-step instructions to gather essential information about the Active Directory Lightweight Directory Services (AD LDS) environment, including instances, ports, and configuration settings. This information is crucial for troubleshooting and managing your AD LDS instances effectively.

### Step 1: List Instances

Always start by logging on to the AD LDS server and running the following command from an elevated command prompt:

```shell
dsdbutil "list instances" quit
```

Example output:

```shell
Instance Name:         SAGILAB
Long Name:             SAGILAB
LDAP Port:             50000
SSL Port:              50001
Install folder:        C:\Windows\
Database file:         C:\Program Files\Microsoft ADAM\SAGILAB\data\adamntds.dit
Log folder:            C:\Program Files\Microsoft ADAM\SAGILAB\data
Service state:         Running
```

Now you know: instance count, names, database locations, LDAP and SSL ports.

To test authentication, bind to an instance:
```shell
ldp localhost:<LDAP PORT>
```

To troubleshoot replication:
```shell
repadmin /replsum localhost:<LDAP PORT>
repadmin /showrepl localhost:<LDAP PORT>
```

### Step 2: Get the List of Naming Contexts (NCs)

Get NCs for each instance:

```shell
(Get-ADRootDSE -Server localhost:<LDAP PORT>).namingContexts
```

Example output:
```
CN=Configuration,CN={344A7D2C-304F-490B-857E-65DA5B450294}
CN=Schema,CN=Configuration,CN={344A7D2C-304F-490B-857E-65DA5B450294}
DC=SAGILAB,DC=local
```

### Step 3: Print Values of the msDS-Other-Settings Attribute

Use the following command to print `msDS-Other-Settings` values. Some of these can be related to common issues:

```shell
dsmgmt "Configurable Settings" Connections "connect to server localhost:<LDAP PORT>" q "show values" q q
```

Key settings to review:

| Setting | Description |
|---------|-------------|
| RequireSecureSimpleBind | 0 = allow non-TLS simple bind |
| RequireSecureProxyBind | 1 = require secure proxy bind |
| DenyUnauthenticatedBind | 0 = allow anonymous bind |
| ADAMDisablePasswordPolicies | 0 = enforce password policies |
| ADAMDisableLogonAuditing | 0 = auditing enabled |

To modify a value:
```shell
dsmgmt "Configurable Settings" Connections "connect to server localhost:50000" q "Set RequireSecureProxyBind to 0" "Commit changes" q q
```
