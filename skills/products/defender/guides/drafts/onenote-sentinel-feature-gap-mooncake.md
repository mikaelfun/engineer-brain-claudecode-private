# Sentinel Feature Availability in Mooncake (Azure China 21Vianet)

> Source: OneNote — Sentinel / Feature Gap
> Quality: draft | Needs: review, note Sentinel retiring Aug 2026, verify latest at https://learn.microsoft.com/en-us/azure/sentinel/feature-availability

## General

- Sentinel is **only available in China East 2 region**
- Features not GA in Azure Global are **not deployed in Azure China 21Vianet**
- Sentinel retirement date in Mooncake: **August 18, 2026**

## Available Features

### Incidents

- Automation rules
- Cross-tenant/Cross-workspace incidents view
- Entity insights
- SOC incident audit metrics
- Incident advanced search

### Detection

- Fusion (advanced multistage attack detection)

### Data Collection

- ASIM (Advanced SIEM Information Model)
- Notebooks (incl. Azure Synapse integration)
- Watchlists (incl. watchlist templates)
- Hunting

### Azure Service Connectors (Available)

- Azure Activity Logs
- Azure Active Directory
- Microsoft Defender for Cloud
- Azure Firewall
- Azure Key Vault
- Azure Kubernetes Services (AKS)
- Azure SQL Databases
- Azure WAF
- Windows Firewall
- Security Events via Legacy Agent
- Office 365

### External Connectors (Available)

- Cisco ASA
- Syslog

## NOT Available in Mooncake

### Incidents

- Microsoft 365 Defender integration
- Microsoft Teams integrations
- Bring Your Own ML (BYO-ML)
- Search large datasets
- Restore historical data

### Detection

- Fusion for ransomware / emerging threats
- Anomalous RDP/SSH login detection
- Anomalous Windows File Share Access

### Content & Threat Intelligence

- Content hub and solutions
- Repositories
- TAXII data connector
- TIP data connector
- Threat Intelligence Research Blade
- URL Detonation
- GeoLocation/WhoIs enrichment
- TI matching analytics
- Threat Intelligence workbook

### Azure Service Connectors (NOT Available)

- Azure ADIP
- Azure DDoS Protection
- Microsoft Purview
- Microsoft Defender for IoT
- Microsoft Insider Risk Management
- Azure Information Protection

### Domain Solutions (NOT Available)

- Apache Log4j, CMMC, IoT/OT, M2131, IRM, Deception, Zero Trust

### External Connectors (NOT Available)

Most third-party connectors (Check Point, Fortinet, Palo Alto, CrowdStrike, etc.) — only Cisco ASA and Syslog are available.

### Watchlists

- Large watchlists from Azure Storage — NOT available
