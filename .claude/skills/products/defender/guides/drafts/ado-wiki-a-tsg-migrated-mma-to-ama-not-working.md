---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Archive/Agents and Log Analytics/Azure Monitoring Agent (AMA)/[TSG] Migrated from MMA to AMA and something is not working properly"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FArchive%2FAgents%20and%20Log%20Analytics%2FAzure%20Monitoring%20Agent%20(AMA)%2F%5BTSG%5D%20Migrated%20from%20MMA%20to%20AMA%20and%20something%20is%20not%20working%20properly"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview

The MDC pipeline on top of AMA includes many components. It is recommended to use MDC Auto-Provisioning to guarantee all components are provisioned properly.

Whenever a ticket is opened on MDC for something not working properly after MMA→AMA migration, **always collect the following provisioning details**:

1. Was auto-provisioning used? If so, which workspace (system-defined or user-defined)?
2. If not, was the deployment done via Policy?
   - Which policies / policy initiative were assigned?
   - Were all remediation tasks created and completed successfully?
3. For manual installation — verify each pipeline component was created correctly.

# Routing Table — Issue to Team

| Problem | Owning Team | ICM Routing |
|---------|-------------|-------------|
| AMA Windows is not being properly installed | Azure Monitoring Agent | Azure Monitor Data Collection\AMA Windows |
| AMA Linux is not being properly installed | Azure Monitoring Agent | Azure Monitor Data Collection\AMA Linux |
| ASA is not being properly installed | ASM | Azure Security Monitoring (Engineering)\ASM-Dev |
| MDC auto-provisioning failed unexpectedly | MDC | Microsoft Defenders for Cloud\Guardians |

# References

- [MDC Pipeline using AMA](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/3364/-Product-Knowledge-MDC-Pipeline-using-Azure-Monitoring-Agent-(AMA))
- [MDC Auto-Provisioning using AMA](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/1909/-Product-Knowledge-MDC-Auto-Provisioning-using-AMA)
