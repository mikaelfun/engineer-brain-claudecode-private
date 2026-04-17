---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/MDO Diagnostics/Assist diagnostic alternatives/IP Throttle Override for GCC"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FMDO%20Diagnostics%2FAssist%20diagnostic%20alternatives%2FIP%20Throttle%20Override%20for%20GCC"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# IP Throttle Override for GCC

GCC/H customers often ask to hydrate or whitelist new IPs for sending from their own systems or third-party vendors into M365/MDO in terms of IP throttling. Support engineers cannot check IP Health via diagnostics in Assist for GCC/H customers, so use the list below to see if IPs are already covered.

**Note: This is for IP throttling overrides only, not any other kind of whitelisting.**

| IP range | Expiration | Associated vendor |
|----------|------------|-------------------|
| 66.159.224.0/19 | Never | Proofpoint |
| 66.159.224.0/21 | Never | Proofpoint |
| 148.163.128.0/19 | Never | Proofpoint |
| 205.220.160.0/19 | Never | Proofpoint |

Keywords: throttling override, IPThrottleOverride, ML4, manual list 4
