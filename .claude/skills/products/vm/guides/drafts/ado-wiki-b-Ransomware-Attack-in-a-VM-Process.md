---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Security Cases Guidance/Ransomware Attack in a VM_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FProcesses%2FSecurity%20Cases%20Guidance%2FRansomware%20Attack%20in%20a%20VM_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

> **IMPORTANT: FIRST CONFIRM THAT THE CUSTOMER IS PREMIER.**

# Summary

This article provides instructions on how to handle a ticket where the customer was compromised by a ransomware attack.

The goal is to ensure Support Engineers (SE) and Support Escalation Engineers (SEE) provide high-quality support and collect important information that will help the Incident Response (IR) engineers assist the customer.

# Expectations

The IR team engages with customers worldwide, investigating and remediating attacks. Collect basic information and document it in notes before transferring cases or collaboration tasks to the IR team.

**Questions to share with customers:**

1. How did you discover the attack?
2. What was the sign of the attack?
3. Do you have backups of the disks?
4. Are there files blocked, or has someone contacted you asking for money?
5. Did you run a full scan using Defender AV?
6. If you are from the US, did you contact the FBI already? (The IR team may discuss it later if not)
7. Any additional information that could help with further steps.

# NSG/RDP Security Check

> **Important:** If the customer is already allowing RDP access to VMs from the internet:
> 1. Check NSG configuration
> 2. Find any rule that is publishing RDP and check if Source IP Address is a **wildcard (*)**
> 3. If wildcard, the VM could be under attack
> 4. **Fix:** Change NSG rules to use local public IP only, or use **Just-In-Time (JIT) VM access**

# Common Ransomware Attack Vectors

- Email messages with attachments that try to install ransomware or phish credentials
- Websites hosting "exploit kits" that attempt to use vulnerabilities in web browsers
- RDP open to the internet with attacker brute force → lateral movement in environment
- Exploitation of unpatched vulnerabilities on internet-facing systems

# Reducing the Impact of Ransomware

- Back up important/work files regularly using the 3-2-1 rule:
  - 3 copies of data, on 2 different storage types, at least 1 backup offsite
- Many organizations use automatic versioning of files (e.g., O365 OneDrive)
- Reference: [Secure your backups, not just your data!](https://azure.microsoft.com/en-us/blog/secure-your-backups-not-just-your-data/)

# Next Steps

Once the information is collected and added to the case notes, transfer the ticket or open a collaboration with the IR team (depending on the case).

Edit the SAP: The IR team is under the Windows Servers category under the Product Version **"Malicious activity suspected or detected"**.

# Reference Links

- [Azure backup and restore plan to protect against ransomware](https://docs.microsoft.com/en-us/azure/security/fundamentals/backup-plan-to-protect-against-ransomware)
- [Azure Defenses for Ransomware Attack](https://www.microsoft.com/content/dam/microsoft/final/en-us/microsoft-brand/photography/business/office/individual-work/ransomware/Ebook-ransomware(2).pdf)
- [Security features used with Azure VMs](https://docs.microsoft.com/en-us/azure/security/fundamentals/virtual-machines-overview)
- [Best practices for defending Azure Virtual Machines](https://www.microsoft.com/security/blog/2020/10/07/best-practices-for-defending-azure-virtual-machines/)
- [Human-operated ransomware attacks: A preventable disaster](https://www.microsoft.com/security/blog/2020/03/05/human-operated-ransomware-attacks-a-preventable-disaster/)
