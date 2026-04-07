---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Workloads/Azure Local VMs Enabled by Azure Arc/Best Practices for Azure Local VMs Enabled by Azure Arc (Disconnected Environments)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Workloads/Azure%20Local%20VMs%20Enabled%20by%20Azure%20Arc/Best%20Practices%20for%20Azure%20Local%20VMs%20Enabled%20by%20Azure%20Arc%20(Disconnected%20Environments)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Best Practices for Azure Local VMs Enabled by Azure Arc (Disconnected Environments)

## Overview

Azure Local VMs enabled by Azure Arc allow organizations to run and manage virtual machines in disconnected or partially connected environments — ideal for secure, remote, or regulated locations. These VMs are provisioned and managed through Azure Arc, but operate locally on Azure Stack HCI or other Arc-enabled infrastructure.

---

## 1. Infrastructure Preparation

### Hardware & Platform Readiness
- Ensure host infrastructure (e.g., Azure Stack HCI) meets minimum requirements for Azure Arc integration
- Validate BIOS/firmware compatibility and enable virtualization features (VT-x, AMD-V)
- Use validated hardware from the Azure Stack HCI catalog

### Network Configuration
- Configure a secure, isolated network for VM traffic
- Use static IPs or DHCP with reservations for predictable VM addressing
- Plan for DNS resolution and time synchronization in disconnected mode

---

## 2. Security & Identity

### Least Privilege Access
- Use Azure Arc RBAC to limit who can create, modify, or delete VMs
- Implement Just-In-Time (JIT) access for administrative tasks

### Local Identity Integration
- Integrate with Active Directory or Azure AD DS (if cached) for VM authentication
- Use local credential vaulting for disconnected identity scenarios

---

## 3. VM Lifecycle Management

### VM Provisioning
- Use Azure Arc VM templates or custom ARM templates stored locally
- Pre-stage VM images and ISO files in a local repository
- Automate provisioning using PowerShell or CLI with Arc extensions

### VM Configuration
- Apply Desired State Configuration (DSC) or Group Policy for consistent VM setup
- Use local configuration management tools (Ansible, Puppet) if Arc extensions are unavailable offline

### VM Updates
- Maintain a local WSUS or update mirror for patching
- Schedule update windows during planned connectivity (if hybrid)

---

## 4. Storage & Backup

### Storage Planning
- Use resilient local storage (Storage Spaces Direct) with redundancy
- Monitor disk usage and IOPS to avoid performance bottlenecks

### Backup & Recovery
- Implement local backup solutions (Veeam, DPM)
- Store backups in a secure, offline-accessible location
- Test recovery procedures regularly

---

## 5. Monitoring & Logging

### Local Monitoring
- Use Windows Admin Center or System Center for local performance monitoring
- Collect logs using local Log Analytics gateways or Syslog servers

### Alerting
- Configure local alerting mechanisms (SNMP traps, email alerts)
- Use Azure Monitor when connectivity is available for hybrid alerting

---

## 6. Synchronization & Connectivity

### Periodic Sync
- Plan for periodic re-connection to Azure for Arc metadata sync
- Use a secure jump box or bastion host for controlled sync operations

### Offline Operations
- Ensure all critical operations (VM start/stop, snapshot, backup) are fully functional offline
- Maintain local documentation for offline troubleshooting

---

## 7. Documentation & Compliance
- Maintain detailed runbooks for VM provisioning, patching, and recovery
- Document all local configurations and custom scripts
- Ensure compliance with regulatory requirements for data locality and access control
