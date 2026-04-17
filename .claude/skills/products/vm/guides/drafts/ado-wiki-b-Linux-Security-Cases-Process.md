---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Security Cases Guidance/Linux Security Cases_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FProcesses%2FSecurity%20Cases%20Guidance%2FLinux%20Security%20Cases_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

> **APPLIES TO:** SUSE / Red Hat / CentOS / Debian / Ubuntu  
> **NOT APPLICABLE to:** Azure Linux Distro (for AKS) — engage SecurityCSS Taskforce instead.

# Summary

This article provides instructions on how to proceed with a ticket where the customer has security questions regarding Linux Virtual Machines when they do **not** use any Microsoft security products (Defender AV, Defender for Endpoint, Defender for Cloud, etc.).

# Support Scope (Shared Responsibility Model)

Azure follows a Shared Responsibility model. For IaaS:
- **Outside our support scope:** Forensics, security incident response investigations, intrusion prevention assistance, compromised VMs
- **Within limited scope (may assist):**
  - Sharing security best practices
  - Guiding customers to official vendor documentation about specific CVEs
  - Opening cases with vendors if a patch doesn't cover a given vulnerability
  - Helping customers apply patches that are failing to install

# Customer Template

```
Dear Customer,

I understand your unfortunate situation affecting your Azure Linux VMs. We want to bring to your attention that the services Microsoft plans have a scope that follows:

Scenarios related to security aren't supported. They include but aren't limited to:
- Compromised virtual machines
- Security incident response investigations
- Intrusion-prevention assistance

Reference: https://learn.microsoft.com/en-us/troubleshoot/azure/cloud-services/support-linux-open-source-technology#linux-support-scope

It is very important to engage your internal security team as soon as possible and let them know your findings to start with their internal security response.
```

**Then include vendor-specific support links based on Linux distro (see Third Party Support section below).**

# Security Best Practices to Share with Customers

**Harden your systems:**
- [Best practices for defending Azure Virtual Machines](https://www.microsoft.com/security/blog/2020/10/07/best-practices-for-defending-azure-virtual-machines/)

**Security Baseline:**
- [Azure security baseline for Linux Virtual Machines](https://learn.microsoft.com/en-us/security/benchmark/azure/baselines/virtual-machines-linux-security-baseline)

**Understand configuration:**
- [Security posture for Microsoft Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/secure-score-security-controls)

**Follow industry standards:**
- [CIS benchmark for Linux containers](https://azure.microsoft.com/en-us/updates/cis-benchmark-for-linux-containers/)

**After compromise — golden rule:**
- [Microsoft Security: Compromised Systems](https://learn.microsoft.com/en-us/previous-versions/tn-archive/cc184918(v=msdn.10)?redirectedfrom=MSDN)
- Reformatting/reinstalling is the conservative choice; attackers can leave undetected backdoors

# Third Party Support Links

| Distro | Support | FAQs | CVEs |
|--------|---------|------|------|
| **SUSE** | https://scc.suse.com/ | https://www.suse.com/support/faq/ | https://www.suse.com/security/cve/index.html |
| **Red Hat** | https://access.redhat.com/support | https://www.redhat.com/en/services/support | https://access.redhat.com/security/security-updates/#/cve |
| **CentOS** | https://wiki.centos.org/ReportBugs | https://wiki.centos.org/FAQ | N/A |
| **Debian** | https://www.debian.org/support.html | https://wiki.debian.org/FAQ | https://www.debian.org/security/cve-compatibility |
| **Ubuntu** | https://ubuntu.com/support | https://help.ubuntu.com/community/CommonQuestions | https://ubuntu.com/security/cves |

# Next Steps

Once the information is shared with the customer, engage your TA and/or Manager for knowledge and proceed with the recovery procedure before closing the case.
