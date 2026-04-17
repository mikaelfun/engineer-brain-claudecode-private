---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra Domain Services/Microsoft Entra Domain Services - LDAPS Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20Domain%20Services%2FMicrosoft%20Entra%20Domain%20Services%20-%20LDAPS%20Troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AADDS LDAPS Troubleshooting

Troubleshooting guide for LDAPS bind failures when using LDP.exe or other LDAP clients with Microsoft Entra Domain Services.

## Verify Basic Network Connectivity

1. In Azure Portal → Microsoft Entra Domain Services → Properties, verify:
   - Secure LDAP = **Enabled**
   - Secure LDAP certificate thumbprint (copy it)
   - Secure LDAP certificate = **Not Expired**
   - Secure LDAP external IP address

2. Download and install [PortQryUI](https://www.microsoft.com/en-us/download/details.aspx?id=24009)

3. Test TCP port 636 connectivity to the Secure LDAP external IP:
   ```powershell
   Test-NetConnection <LDAPS_PUBLIC_IP> -Port 636
   ```
   Expected result: Port should show **LISTENING**.

4. **If connectivity fails** → Check the MEDS NSG:
   - Verify NSG allows inbound TCP 636 from client IP to AAD DS subnet.
   - If NSG restricts by source IP, verify the client's PUBLIC IP is in the allowed list.
   - Client's public IP can be verified at https://www.whatismyip.com

## Perform DNS Resolution Test

After confirming network connectivity on the raw IP, test DNS name resolution:
```powershell
Resolve-DnsName -Name ldaptest.yourdomain.me
```
Expected: Resolves to the Secure LDAP external IP listed in MEDS properties.

> Note: The MEDS domain name (e.g., contoso.onmicrosoft.com) does NOT automatically resolve externally. A DNS record must be manually registered pointing to the LDAPS public IP.

## Perform LDAPS Certificate Trust Test

> Only needed if LDAP client doesn't auto-prompt for certificate trust and a self-signed certificate is in use (common with LDP.exe).

1. Export/copy the MEDS LDAPS certificate (identified by thumbprint).
2. Import into **Computer** certificate store on the client workstation.
3. Retry LDAPS bind with LDP.exe.

Alternatively, use the [LDAP Admin Utility](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD) for easier testing without manual certificate import.

## Common Root Causes

| Symptom | Cause | Resolution |
|--|--|--|
| TCP 636 connection refused/timeout | NSG blocking inbound TCP 636 | Add NSG inbound rule to allow TCP 636 from client IP |
| LDP.exe bind fails with certificate error | Self-signed cert not trusted / not imported | Import MEDS LDAPS cert into Computer cert store |
| DNS name does not resolve to LDAPS IP | No DNS record registered for the LDAPS endpoint | Manually register DNS record or use HOSTS file for testing |
| LDAPS disabled | Secure LDAP not enabled in MEDS portal | Enable Secure LDAP in Azure Portal → MEDS → Secure LDAP |
