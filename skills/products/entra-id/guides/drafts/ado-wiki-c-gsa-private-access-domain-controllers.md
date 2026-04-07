---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/GSA Entra Private Access for Domain Controllers"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGSA%20Entra%20Private%20Access%20for%20Domain%20Controllers"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# GSA Entra Private Access for Domain Controllers

## Summary

Strengthens secure access for on-premises users by utilizing Entra CA and MFA to protect on-premises applications using Kerberos authentication with Domain Controllers.

## Prerequisites

- Global Secure Access Administrator role
- Microsoft Entra Private Access license
- Windows 10+ client, Entra joined or hybrid joined
- Latest Private network connector with DC line of sight
- Inbound TCP port 1337 open on DCs
- SPNs identified (case insensitive, exact match or wildcard like cifs/*)

## Key Configuration Steps

1. Install Private Network Connector on Windows Server with DC line of sight
2. Create GSA Application (Quick Access or Enterprise App) - publish DCs using IP/FQDN, port 88 TCP
3. Add SPNs for resources to secure
4. Assign Users + Conditional Access with MFA
5. Enable Private Access Profile in Traffic Forwarding
6. Install GSA Client on Windows 10/11 Entra joined device
7. Install Private Access Sensor on DC
8. Configure Sensor Policy Files - verify SPNs in cloudpolicy, add connector IPs to localpolicy SourceIPAllowList

## Break Glass Mode

- Entra admin center: Global Secure Access > Connect > Connectors and sensors > Private access sensors > Settings > Enable break glass mode
- Or registry: HKLM SOFTWARE Microsoft PrivateAccessSensor - set TmpBreakglass (DWORD) from 0 to 1, restart sensors

## Important Notes

- One sensor per DC for testing; install on all DCs for production
- Test with private apps first before enforcing MFA on DC SPN (avoid admin lockout)
- If using NTLMv1/v2, may need to restrict NTLM and use Kerberos auth

## Troubleshooting

- Event Viewer: Review Private Access Sensor logs
- Log Collection: Run PrivateAccessSensorLogsCollector from sensor install path
- GSA Client Logs: Right-click tray icon > Advanced Diagnostics > Advanced log collection

## ICM Escalation

| Area | ICM Path |
|------|----------|
| Private Access Data Path | Global Secure Access / GSA Datapath |
| Private Access Control Plane | Global Secure Access / GSA Control Plane |
