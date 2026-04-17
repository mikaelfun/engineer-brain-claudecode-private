# MDC Alerts Validation Reference

> Source: OneNote — Mooncake POD Support Notebook / Microsoft Defender for Cloud / Alerts Validation & Detection
> Quality: draft | Needs: merge with mslearn docs, verify Mooncake availability

## Alert Reference List

- [Security alerts - a reference guide](https://docs.microsoft.com/en-us/azure/security-center/alerts-reference) — Complete list of ASC/MDC alerts
- Mooncake version: refer to Feature Gap list for availability differences

## Validation Methods

### Standard Tier (Azure Defender enabled)
- [Alert validation using EICAR test file](https://docs.microsoft.com/en-us/azure/security-center/security-center-alert-validation)
- Requires standard pricing tier on the subscription

### Playbooks for Simulation
- [Azure Security Center Playbook: Security Alerts](https://gallery.technet.microsoft.com/Azure-Security-Center-f621a046)
- [Azure Security Center Playbook: Linux Detections](https://gallery.technet.microsoft.com/Azure-Security-Center-0ac8a5ef)
- Goal: Simulate attacks in lab-monitored VMs to verify detection pipeline

## Key Notes
- Always test in **lab environment**, not production
- Standard pricing tier required for enhanced detection alerts
- Mooncake has limited detection availability — check Detection Availability matrix
