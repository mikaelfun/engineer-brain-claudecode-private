---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure Internal DNS (VNET)/How to setup DNS Role in windows server"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Internal%20DNS%20%28VNET%29%2FHow%20to%20setup%20DNS%20Role%20in%20windows%20server"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to Setup DNS Role in Windows Server

[[_TOC_]]

## Overview

How to setup a DNS role for Windows Server and confirm basic configurations.

Customers often need to configure VMs with DNS roles and conditional forwarders to forward DNS requests between Azure and on-premises, or across peered VNETs.

---

## Set Up the DNS Role

Steps may differ slightly for different Windows Server versions:

1. Open **Server Manager** and go to **Local Server**
2. Click **Manage** > **Add Roles and Features**
3. Read the "Before you begin" section, click **Next**
4. Select **Role-based or Feature-based installation**
5. Select the target server
6. Select the **DNS Server** role
7. Confirm dependencies (Administration Tools) — click **Add Features**
8. Verify the checkbox is marked, click **Next**
9. In "Select Features" leave defaults, click **Next**
10. In "DNS Server" click **Next**
11. Click **Install** and wait for completion

---

## Setup a Conditional Forwarder for a Specific Domain

Once the DNS role is installed, configure a conditional forwarder for a given zone (e.g., for `privatelink` zones):

1. Open **Server Manager**
2. Click **Tools** (upper right) > **DNS Server**
3. In the DNS Manager window, click your server name
4. Go to **Conditional Forwarders** in the left panel
5. Right-click in the right panel > **New Conditional Forwarder**
6. Enter the domain name to forward (e.g., `privatelink.blob.core.windows.net`)
7. Enter the target DNS server IP (e.g., Azure DNS `168.63.129.16`)
8. Click **OK**

> **Common Use Case:** Forward all `privatelink.*` zones to `168.63.129.16` so Azure-managed Private Link DNS resolution works correctly for on-premises or cross-VNET scenarios.
