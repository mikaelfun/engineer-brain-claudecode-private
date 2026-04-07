---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Tools and Data Collection/Support Tools/CPC Diagnostics (CPCD)/Find CPC with Vip"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FTools%20and%20Data%20Collection%2FSupport%20Tools%2FCPC%20Diagnostics%20(CPCD)%2FFind%20CPC%20with%20Vip"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Find Cloud PC with VIP (Outbound Public IP)

## Scenario
Cloud PC may be abused as attacker; VIP captured by Azure Security team triggers a security incident.

## Process
1. Use CPCD (https://aka.ms/cpcd) > Toolbox > Find CPC with Vip
2. Find the tenant ID behind the VIP
3. Engage Human Investigation Team (HIT, contact GUHON) to verify

## Required Kusto Access

| Cluster | Endpoint | Access |
|---------|----------|--------|
| azslb | https://azslb.kusto.windows.net | Join SG AznwKustoReader in idweb |
| azcsupfollower | https://azcsupfollower.kusto.windows.net | Request Azure Standard Access in CoreIdentity |

## Note
Filter by time period when VIP was observed, as VIPs may be reused.
