---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/server-software-support
importDate: '2026-04-20'
type: guide-draft
---

# Microsoft Server Software Support on Azure VMs

## Overview

Comprehensive reference for supported and unsupported Microsoft server software, Windows Server roles/features on Azure IaaS VMs.

## Supported Server Software

| Software | Minimum Version |
|----------|----------------|
| Microsoft Entra Connect | Current |
| BizTalk Server | 2013+ |
| Dynamics AX | 2012 R3+ |
| Dynamics GP | 2013+ |
| Dynamics NAV | 2013+ |
| Dynamics CRM | 2015+ |
| Dynamics 365 Server | 9.1+ |
| Exchange Server | 2013+ |
| Forefront Identity Manager | 2010 R2 SP1+ |
| HPC Pack | 2012+ |
| Project Server | 2013+ |
| SharePoint Server | 2010+ |
| SQL Server (64-bit) | 2008+ |
| System Center | 2012 SP1+ |
| Team Foundation Server | 2012+ |

## Windows Server

- Standard editions (2016/2019/2022) not in Azure Marketplace — must upload image
- Windows Server 2003+ supported for deployment (2003 requires CSA for OS support)
- EOS versions (pre-2008 R2) require Custom Support Agreement

## Supported Windows Server Roles (2008 R2+)

AD CS, AD DS, AD FS, AD LDS, Application Server, DNS, Failover Clustering,
File Services, Hyper-V (Ev3/Dv3 only), NPS, Print/Document Services, RDS, Web Server (IIS), WSUS

## Unsupported Roles

- DHCP Server (on Azure VNet NIC; OK for nested virt internal networks)
- Rights Management Services
- Windows Deployment Services

## Unsupported Features

- BitLocker on OS disk (data disks OK)
- Internet Storage Name Server (iSNS)
- Multipath I/O
- Network Load Balancing (use Azure LB)
- RRAS / DirectAccess (use Azure VPN GW)
- SNMP Services
- Storage Manager for SANs
- Windows Internet Name Service (WINS)
- Wireless LAN Service

## WSFC Requirements

- Windows Server 2008 R2+ required
- WS2012/2008R2: install hotfix KB2854082 on all nodes
- Single cluster IP resource only
- Azure-hosted storage options: app-level replication, volume-level replication, ExpressRoute iSCSI, Azure Files
- Third-party clustered roles supported by vendor

## Licensing

- Azure VMs include Windows Server license by default
- Standard edition has same license cost as Datacenter (use Standard only for compatibility)
- License Mobility available for other MS software via SA
- Email sending: must use SMTP relay (e.g., M365), no direct external email from Azure compute
