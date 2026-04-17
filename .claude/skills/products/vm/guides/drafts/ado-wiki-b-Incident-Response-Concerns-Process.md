---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Security Cases Guidance/Incident Response Concerns_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FProcesses%2FSecurity%20Cases%20Guidance%2FIncident%20Response%20Concerns_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

> **IMPORTANT: FIRST CONFIRM THAT THE CUSTOMER IS PREMIER.**

# Summary

This article provides instructions on how to handle a ticket where the customer has security questions that may involve Incident Response, based on the internal procedures followed by the team that supports these types of cases.

The goal is to ensure Support Engineers (SE) and Support Escalation Engineers (SEE) provide high quality support and collect important information that will help the IR engineers assist the customer.

# Scenario Decision Tree

## Scenario 1: Azure VM encrypted by ransomware
→ CIRT can engage and take ownership  
→ Refer to: [Ransomware Attack in a VM](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/585131/Ransomware-Attack-in-a-VM_Process)

## Scenario 2: Defender for Cloud alerts indicating resource under attack
- Confirm it's not a false positive first
- If attack confirmed → engage IR team
- If not confirmed → engage Defender for Endpoint team or Infrastructure solutions team
- Refer to: [Common Topics and Transfer Queues in Security](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/585128/An-Overview-Security-Cases-Guidance_Process?anchor=common-topics-and-transfer-queues)

## Scenario 3: Customer under attack (external BruteForce confirmed, RDP open)
- Customer should use NSGs to close affected ports (e.g., RDP=3389) or enable JIT/Bastion
- **Root cause:** NSG rule allows RDP from wildcard (*) source IP
- **Fix:** Change NSG rules to use local public IP only, or enable Just-In-Time (JIT) VM access
- Contact CSAM to find an expert to help the customer set up their environment

## Scenario 4: Malicious login to customer's VM confirmed
- IR/CIRT can be engaged and will take ownership of the case

## Scenario 5: Customer asks if machine is clean of malware
- We CANNOT provide health checks due to overall MSFT guidelines
- Inform customer accordingly

## Scenario 6: Customer wants to run Pen testing
- **Pen testing in an Azure environment violates the rules of engagement of the service**
- Refer customer to: [Penetration Testing Rules of Engagement](https://www.microsoft.com/en-us/msrc/pentest-rules-of-engagement)

## Scenario 7: Azure person performing malicious activity on customer's system
- Affected customer must file an abuse report with the CDOC
- This is outside CSS scope
- Public link: [Submit Abuse Report at CDOC](https://msrc.microsoft.com/report/abuse)

## Scenario 8: Alert in message center / email about abusing service (Lynx.com or ASC)
- Investigation on Windows OS → IR team can be involved and will take ownership
- If request is to prevent subscription takedown → customer must engage directly with the notification DL in the same message

# Information to Collect (shareable with customers)

1. How did you discover the attack?
2. What was the sign of the attack?
3. Do you have backups of the disks?
4. Are there files blocked or missing?
5. Did you run a full scan using Defender AV?
6. Any other information that could help with further steps.

> **Note:** MSFT does not perform sanity checks due to legal implications. The customer must provide the indicator of compromise (evidence of malicious activity).

# Next Steps

Once the information is collected and added to the case notes, transfer the ticket or open a collaboration with the IR team (depending on the case).

Edit the SAP of the ticket: The IR team is under the Windows Servers category under the Product Version **"Malicious activity suspected or detected"**.

# Reference Links

- [Azure backup and restore plan to protect against ransomware](https://docs.microsoft.com/en-us/azure/security/fundamentals/backup-plan-to-protect-against-ransomware)
- [Azure Defenses for Ransomware Attack](https://azure.microsoft.com/en-us/resources/azure-defenses-for-ransomware-attack/)
- [Security features used with Azure VMs](https://docs.microsoft.com/en-us/azure/security/fundamentals/virtual-machines-overview)
- [Best practices for defending Azure Virtual Machines](https://www.microsoft.com/security/blog/2020/10/07/best-practices-for-defending-azure-virtual-machines/)
