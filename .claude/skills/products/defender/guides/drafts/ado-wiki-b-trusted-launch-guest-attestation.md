---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations and remediation/[Product Knowledge] - Trusted Launch Guest Attestation"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FRecommendations%20and%20remediation%2F%5BProduct%20Knowledge%5D%20-%20Trusted%20Launch%20Guest%20Attestation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**AI-assisted content.** This article was partially created with the help of AI. An author reviewed and revised the content as needed.

Trusted Launch Guest Attestation
================================

## Summary

This article provides a detailed explanation of the Guest Attestation extension, a component of Microsoft Azure's trusted launch capabilities. It highlights the importance of the extension in securing virtual machines (VMs) and provides recommendations for its deployment.

## Detailed Explanation

The Guest Attestation extension is a critical component within Microsoft's trusted launch capabilities, designed to enhance the security of your virtual machines (VMs) against advanced and persistent threats. Trusted launch comprises various infrastructure technologies that can be independently enabled, each offering an additional layer of defense.

A key recommendation from Defender for Cloud is to ensure that a virtual Trusted Platform Module (vTPM) is enabled on supported Azure VMs. The vTPM measures the entire boot chain of a VM, including the Unified Extensible Firmware Interface (UEFI), operating system, system, and drivers. With the vTPM enabled, the Guest Attestation extension can remotely validate the secure boot process.

To ensure the proper deployment of this extension, the following recommendations should be followed:
- Enable Secure Boot on supported Windows VMs.
- Install the Guest Attestation extension on supported Windows VMs and Windows Virtual Machine Scale Sets.
- Install the Guest Attestation extension on supported Linux VMs and Linux Virtual Machine Scale Sets.

## What is Guest Attestation extension?

Trusted launch protects against advanced and persistent attack techniques. Trusted launch is composed of several, coordinated infrastructure technologies that can be independently enabled. Each technology provides another layer of defense against sophisticated threats.

Defender for Cloud's recommendation, **vTPM should be enabled on supported virtual machines**, ensures your Azure VMs are using a vTPM. This virtualized version of a hardware Trusted Platform Module enables attestation by measuring the entire boot chain of your VM (UEFI, OS, system, and drivers).

With the vTPM enabled, the Guest Attestation extension can remotely validate the secure boot. The following recommendations ensure this extension is deployed:
- Secure Boot should be enabled on supported Windows virtual machines
- Guest Attestation extension should be installed on supported Windows virtual machines
- Guest Attestation extension should be installed on supported Windows Virtual Machine Scale Sets
- Guest Attestation extension should be installed on supported Linux virtual machines
- Guest Attestation extension should be installed on supported Linux Virtual Machine Scale Sets

## Support Boundaries

- MDC supports the Recommendation health status
- Policy compliance or Policy false-positive reporting → escalate to **"Trusted Launch/TVM"** IcM team

## Related Articles

- [Trusted launch and Microsoft Defender for Cloud integration](https://learn.microsoft.com/azure/virtual-machines/trusted-launch#microsoft-defender-for-cloud-integration)
- [Trusted launch for Azure virtual machines - supported VMs and limitations](https://learn.microsoft.com/azure/virtual-machines/trusted-launch#limitations)
- [MDC Announcement](https://learn.microsoft.com/azure/defender-for-cloud/release-notes-archive#new-recommendations-to-enable-trusted-launch-capabilities-in-preview)
- [MDC and Trusted Launch support boundaries](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495587/Trusted-Launch_Deploy?anchor=support-boundaries-%26-escalations)
- Public documentation: [Trusted launch for Azure virtual machines](https://learn.microsoft.com/azure/virtual-machines/trusted-launch)
