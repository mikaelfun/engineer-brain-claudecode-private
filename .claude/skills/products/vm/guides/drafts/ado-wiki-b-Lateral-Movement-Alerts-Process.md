---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Security Cases Guidance/Lateral Movement Alerts_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FProcesses%2FSecurity%20Cases%20Guidance%2FLateral%20Movement%20Alerts_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Summary

This article provides instructions on how to handle a ticket where the customer received a lateral movement alert in the Microsoft Defender for Identity portal or the Microsoft 365 Defender portal.

The goal is to ensure Support Engineers (SE) and Support Escalation Engineers (SEE) provide high-quality support and collect important information that will help the Threat Analytics (ThA) engineers assist the customer.

# Expectations

Inform the customer: we are collecting information required for the ThA team to ensure timely resolution, but the ThA team will need to analyze once we gather the information.

**Questions to share with customers:**

1. How did you discover the attack?
2. Where did you get the alert (The Endpoint/VM, Microsoft Defender for Identity Portal)?
3. What is the number of devices affected and the impact?
4. Are there files blocked by your protection tool?
5. What is the type of alert displayed?
6. Any additional information (screenshots, alert ID, etc.) that could help with further steps.

# Common Lateral Movement Alert Types (Microsoft Defender for Identity)

| External ID | Alert Name |
|-------------|------------|
| 2415 | Suspected exploitation attempt on Windows Print Spooler service |
| 2036 | Remote code execution over DNS |
| 2017 | Suspected identity theft (pass-the-hash) |
| 2018 | Suspected identity theft (pass-the-ticket) |
| 2039 | Suspected NTLM authentication tampering |
| 2037 | Suspected NTLM relay attack (Exchange account) |
| 2002 | Suspected overpass-the-hash attack (Kerberos) |
| 2047 | Suspected rogue Kerberos certificate usage |
| 2406 | Suspected SMB packet manipulation (CVE-2020-0796 exploitation) |
| 2416 | Suspicious network connection over Encrypting File System Remote Protocol |
| 2414 | Exchange Server Remote Code Execution (CVE-2021-26855) |

Reference: [Lateral Movement Alerts Details](https://docs.microsoft.com/en-us/defender-for-identity/lateral-movement-alerts)

# Next Steps

Once the information is requested, add the details in the case notes. Transfer the ticket or open a collaboration with the ThA team (depending on the case).

Edit the SAP: The Threat Analytics team is inside the Security category under:
- Product Name: **"Microsoft Advanced Threat Analytics"**
- Category: **"Investigating ATA Alerts"**

The POD/Queue name may appear as **"MSaaS Security – Threat Analytics"** or **"MCAS Team"**.

# Reference Links

- [Microsoft Defender for Identity](https://docs.microsoft.com/en-us/defender-for-identity/what-is)
- [Understanding Security Alerts](https://docs.microsoft.com/en-us/defender-for-identity/understanding-security-alerts)
- [Microsoft Defender for Identity Lateral Movement Paths (LMPs)](https://docs.microsoft.com/en-us/defender-for-identity/use-case-lateral-movement-path)
