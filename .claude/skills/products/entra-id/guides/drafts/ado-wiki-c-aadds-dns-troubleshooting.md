---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra Domain Services/Microsoft Entra Domain Services - DNS Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20Domain%20Services%2FMicrosoft%20Entra%20Domain%20Services%20-%20DNS%20Troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AADDS DNS Troubleshooting

Microsoft Entra Domain Services domain controllers host DNS servers for clients joined to the managed domain. This guide covers troubleshooting DNS resolution failures.

## Step 1: Verify DNS Client Resolvers Point to MEDS Domain Controllers

1. On client workstation, run: `Get-NetIPConfiguration` (PowerShell)
2. Compare DNS Server IPs to MEDS DC IPs in:
   - ASC Resource Explorer → Azure AD Domain Services Overview → IP Addresses
   - Azure Portal → Microsoft Entra Domain Services → Properties → IP Addresses
3. If IPs don't match → client is NOT using MEDS DNS. Update DNS resolvers:
   - For Azure VMs: Update the Azure vNET's DNS Servers configuration → reboot VM.
4. Verify with nltest:
   ```
   nltest /dsgetdc:domain.com /force
   nltest /dnsgetdc:domain.com
   ```

## Step 2: Reproduce Failure and Collect Logs

1. Start a network capture: https://aka.ms/networktrace
2. Clear DNS cache: `ipconfig /flushdns`
3. Test DNS resolution to EACH MEDS DNS server:
   ```powershell
   Resolve-DNSName -Name test.domain.com -Server 10.0.0.4
   Resolve-DNSName -Name test.domain.com -Server 10.0.0.6
   ```
4. Stop the network capture: `netsh stop`

## Step 3: Determine Root Cause

- **If only one DC fails to resolve**: Possible DC-specific issue → escalate to MEDS team with Jarvis logs.
- **If both DCs fail**: Check DNS records in MEDS via RSAT DNS Manager (requires MEDS joined workstation + DC Admins group membership).
- **Custom DNS records**: Manage via RSAT. See [Manage DNS for Microsoft Entra Domain Services](https://learn.microsoft.com/en-us/entra/identity/domain-services/manage-dns).

## Common Root Causes

| Symptom | Cause | Resolution |
|--|--|--|
| DNS resolution fails on domain-joined client | Client DNS resolver not pointing to MEDS DC IPs | Update vNET/VM DNS settings to MEDS DC IPs |
| DNS resolves from one DC but not the other | DC-specific DNS failure | Escalate to MEDS team with Jarvis logs |
| Custom DNS record missing | Record not added in MEDS DNS | Add record via RSAT DNS Manager from MEDS-joined workstation |
