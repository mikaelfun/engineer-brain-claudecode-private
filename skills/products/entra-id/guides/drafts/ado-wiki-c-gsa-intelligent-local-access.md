---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/GSA Intelligent Local Access for Private Access"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGSA%20Intelligent%20Local%20Access%20for%20Private%20Access"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# GSA Intelligent Local Access (ILA) for Private Access

## Summary

ILA enables intelligent network routing. Without ILA, all traffic goes through cloud service causing latency. ILA uses DNS probes to determine if client is inside corporate network, then bypasses cloud routing for local resources.

## Enable ILA

1. Entra admin center > Global Secure Access > Connect > Private networks
2. Add Private network: Name, DNS Servers (IPv4), FQDN, Resolved IP type (IP/CIDR/range)
3. Select Target Resource (Quick Access or PA enterprise app to bypass locally)
4. Create

## Verify ILA Flow

1. Open Advanced diagnostics for GSA client
2. Start Collecting Network traffic
3. Filter by Destination IP/FQDN
4. Remove default Action == Tunnel filter
5. Access application
6. Verify Connection Status = Bypassed and Action = Local

## Troubleshooting

- Registry: HKEY_LOCAL_MACHINE SOFTWARE Microsoft Global Secure Access Client (REG_SZ)
- Network Definitions array contains DNS probe settings and IP configurations
- ASC: Tenant Explorer > Global Secure Access > Private Network
- Use Graph Explorer in Tenant Explorer for apps assigned to Private Network

## Public Documentation

- https://learn.microsoft.com/en-us/entra/global-secure-access/enable-intelligent-local-access
