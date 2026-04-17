---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Application Gateway Layer 4 Proxy/Application Gateway QuickStart: Direct SQL traffic with Azure Application"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/How%20To/Application%20Gateway%20Layer%204%20Proxy/Application%20Gateway%20QuickStart%3A%20Direct%20SQL%20traffic%20with%20Azure%20Application"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Application Gateway QuickStart: Direct SQL traffic with Azure Application Gateway L4 Proxy

## Overview

This QuickStart uses the Azure portal to create an Application Gateway with SQL Server on Azure VMs as backend. It covers creating a listener on port 1433, configuring TCP backend settings, and testing connectivity through SQL Server Management Studio.

Three parts:
1. **Create an SQL server** (Azure VM)
2. **Create an Application Gateway** (L4 TCP proxy)
3. **Connect to SQL server** (via SSMS)

## 1. Create an SQL Server VM

1. In Azure portal search bar, enter **SQL Virtual Machine**
2. Click **Create** > Select SQL deployment option
3. Choose **Free SQL Server License** from the dropdown
4. Configuration details:
   - Provide basic details
   - SQL Server settings: Use **Port 1433**
   - Note SQL authentication credentials (needed later)
5. Note the Azure VM's Public IP address after deployment

## 2. Create an Application Gateway

> Portal experience for Layer 4 proxy is currently available using special link.

### Basics Tab

| Field | Details |
|-------|---------|
| Subscription | Existing subscription |
| Resource Group | Select under that subscription |
| Application Gateway | Name for easy identification |
| Region | Azure region for deployment |
| Tier | Standard v2 or WAF v2 (WAF functions only apply to HTTP/S in hybrid mode) |
| Enable autoscaling | Applicable for both L7 and L4 proxy |
| HTTP2 | Can leave disabled for this config |
| Virtual network/Subnet | AppGW requires its own dedicated subnet |

### Frontends Tab

| Field | Details |
|-------|---------|
| Frontend IP address type | Public (for traffic from internet) |
| Public IP address | Select existing or assign new |

### Backends Tab

1. Click **Add a backend pool**
2. Specify name
3. Choose **IP address or FQDN** > enter SQL VM IP address
4. Click **Add**

### Configuration Tab

1. Click **Add a routing rule**
2. Specify rule name and priority (1-20000)
3. **Listener tab**:
   - Name for listener
   - Frontend IP: Public
   - Protocol: **TCP**
   - Port: **1433**
4. **Backend targets tab**:
   - Target type: Backend Pool
   - Backend target: Select created pool
   - Backend settings > Add New:
     - Backend protocol: **TCP**
     - Backend port: **1433**

### Tags & Review

Add tags as needed, then **Review + Create**.

## 3. Connect to SQL Server

Prerequisites:
- Public IP of Azure VM (or AppGW frontend IP)
- SQL Authentication Login username
- SQL Authentication Login password

Steps:
1. Open **SQL Server Management Studio**
2. Connect using **Database Engine**
3. In **Server name**: enter AppGW frontend IP address or FQDN
4. Provide SQL username and password
5. You should now be able to view and manage the SQL server

## Clean Up

Stop or delete resources when no longer needed to avoid charges.
