---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations and remediation/Server (Compute) Recommendations/[Product Knowledge] - Recommendations for Virtual Machine Scale Sets (VMSS)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FRecommendations%20and%20remediation%2FServer%20(Compute)%20Recommendations%2F%5BProduct%20Knowledge%5D%20-%20Recommendations%20for%20Virtual%20Machine%20Scale%20Sets%20(VMSS)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Recommendations for Virtual Machine Scale Sets (VMSS)

**AI-assisted content.** This article was partially created with the help of AI. An author reviewed and revised the content as needed.

## Summary

This article outlines the recommendations available for Virtual Machine Scale Sets (VMSS) within Microsoft Defender for Cloud (MDC). VMSS allows users to create and manage a group of load-balanced virtual machines, providing high availability and centralized management. This article highlights the security recommendations that can help protect your VMSS using MDC.

## Detailed Explanation

Azure Virtual Machine Scale Sets (VMSS) enable the creation and management of a group of load-balanced virtual machines (VMs). The number of VM instances can automatically scale up or down in response to demand or based on a defined schedule. VMSS is designed to provide high availability and allows for centralized management, configuration, and updates of a large number of VMs.

MDC automatically detects VMSS and recommends installing the monitoring agent for enhanced security assessments and event-based threat detection.

## VMSS Recommendations

| Recommendation | Description | Severity |
| --- | --- | --- |
| Endpoint protection health issues on virtual machine scale sets should be resolved | Remediate endpoint protection health failures on your virtual machine scale sets to protect them from threats and vulnerabilities. | Low |
| Endpoint protection should be installed on virtual machine scale sets | Install an endpoint protection solution on your virtual machine scale sets to protect them from threats and vulnerabilities. | High |
| Guest Attestation extension should be installed on supported Linux virtual machine scale sets | Install Guest Attestation extension on supported Linux VMSS to allow MDC to proactively attest and monitor boot integrity. Applies only to trusted launch-enabled Linux VMSS. | Low |
| Guest Attestation extension should be installed on supported Windows virtual machine scale sets | Install Guest Attestation extension on supported Windows VMSS to allow MDC to proactively attest and monitor boot integrity. Applies only to trusted launch-enabled VMSS. | Low |
| Log Analytics agent should be installed on virtual machine scale sets | MDC collects data from Azure VMs to monitor for security vulnerabilities and threats using the Log Analytics agent. | High |
| System updates on virtual machine scale sets should be installed | Install missing system security and critical updates to secure your Windows and Linux VMSS. | High |
| Virtual machine scale sets should be configured securely | Remediate vulnerabilities in the security configuration on your VMSS to protect them from attacks. | High |

## Notes

- **System Updates v2 (Azure Update Manager)**: Azure Update Manager does **not** support VMSS. Only legacy system updates (MMA-based) apply to VMSS.
- **Endpoint protection recommendations on VMSS**: These are being deprecated. Use the new EDR (agentless endpoint protection) experience where available.

## Related Articles

- [Azure Virtual Machine Scale Sets Overview](https://docs.microsoft.com/en-us/azure/virtual-machine-scale-sets/overview)
- [Recommendations List for Microsoft Defender for Cloud](https://docs.microsoft.com/en-us/azure/security-center/recommendations-reference)
