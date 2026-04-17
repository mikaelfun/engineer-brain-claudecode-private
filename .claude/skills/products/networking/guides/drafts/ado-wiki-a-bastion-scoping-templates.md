---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Bastion/Scoping Templates"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FScoping%20Templates"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Bastion Scoping Templates

[[_TOC_]]

## Basic Case Types

Azure Bastion issues break down into 6 basic categories:
- **CrUD issues** – Creation, Update, Deletion
- **Connectivity issues**
- **Browser issues**
- **Authentication issues**
- **Issues creating NSGs on the AzureBastionSubnet**
- **Issues with SSH Keys**

Identify which type as quickly as possible. Choose the most closely matching template. May need to start with Basic Template then rescope.

---

## Basic Scoping Template (all cases)

```
- SubID:
- Name of the Bastion Resource:
- Name of the Backend Resource:
- Auth Creds used: User@domain.com
- Description of the issue (including errors seen):

> Note: "it failed to connect" is NOT enough – get details!

- Specific time of the failed attempt (narrow down as much as possible):
```

---

## Specific Scoping Template: CRUD Cases

```
- SubID:
- Name of the Bastion Resource:
- Action attempted: Creation / Update / Deletion
- How they attempted the action: Portal / PowerShell / CLI (include specific command if applicable)
- Time they tried to do action:
- Any errors seen:
```

---

## Specific Scoping Template: Connectivity Issues

```
- SubID:
- Name of the Bastion Resource:
- Vnet of the Bastion Resource:
- NSGs applied to the Bastion subnet:
- Name of the Backend Resource:
- Vnet of the Backend Resource:
- NSGs applied to the Backend Subnet/NIC:
- IP of the Backend Resource:
- OS of the Backend Resource: Windows / Linux
- Login Name used: User@domain.com
- Client IP: (use https://whatismyipaddress.com)
- Description of the issue (including errors seen):

> Note: "it failed to connect" is NOT enough – get details!

- Specific time of the failed attempt:
```

### Additional connectivity scoping questions (useful if available):
- Does this affect all backend VMs or only specific ones?
- Does it affect more than one client / only clients in a specific location?
- Does it only affect Windows? Or only Linux?
- Does it fail in both browsers?
- Does it fail in a default browser install?

---

## Specific Scoping Template: Browser Issues

```
- SubID:
- Name of the Bastion Resource:
- Browser version: Edge Chromium / Google Chrome
- Using Private/Incognito mode: Yes / No
- Description of the issue (including errors seen):
- Screenshot of the issues if applicable:
```

---

## Specific Scoping Template: Authentication Issues

```
- SubID:
- Name of the Bastion Resource:
- Name of the Backend Resource:
- IP of the Backend Resource:
- OS of the Backend Resource: Windows / Linux
- Login Name used: User@domain.com
- Client IP: (use https://whatismyipaddress.com)
- Description of the issue (including errors seen):

> Note: "it failed to connect" is NOT enough – get details!

- Specific time of the failed attempt:
```

---

## Specific Scoping Template: Issues Creating NSGs

```
- SubID:
- Name of the Bastion Resource:
- Vnet of the Bastion Resource:
- NSGs applied to the Bastion subnet:
- Name of the Backend Resource:
- Vnet of the Backend Resource:
- NSGs applied to the Backend Subnet/NIC:
```

---

## Specific Scoping Template: Issues with SSH Keys

```
- SubID:
- Name of the Bastion Resource:
- Copy of the RSA Key:
```

> **Source**: ADO Wiki - AzureNetworking/Wiki
> **Page**: /Azure Bastion/Scoping Templates
