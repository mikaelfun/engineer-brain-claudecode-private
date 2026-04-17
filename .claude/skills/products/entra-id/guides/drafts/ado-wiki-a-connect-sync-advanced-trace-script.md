---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/General/AdvancedScript"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FGeneral%2FAdvancedScript"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Entra Connect Sync Advanced Trace Collection Script

## Purpose

Collect Network, LDAP, and authentication traces during a repro scenario with Entra Connect Sync server.

## Steps

1. **Log on to the AAD Connect Server**
2. **Disable Sync Scheduler**: `Set-ADSyncScheduler -SyncCycleEnabled:$false`
3. Ensure `C:\temp` folder exists
4. Open **elevated command prompt** (run cmd.exe as Administrator)
5. Paste and run the collection script (see below)
6. **Reproduce the issue** when prompted
7. Press any key to stop tracing
8. Collect output from `C:\temp\logs` (zipped to `C:\temp\MicrosoftTraceLogs.zip`)

## What the Script Collects

- **ETL Traces**: KDC, Kerberos, LDAP, NTLM, SSL
- **Event Logs**: Application, System, Security, CAPI2, Kerberos/Operational
- **Certificate Stores**: Machine and User store exports
- **Network**: NetTrace (netmon.etl), WinHTTP proxy config, ipconfig
- **Registry Keys**: LSA, Policies, LanmanServer/Workstation, Netlogon, NTDS, SCHANNEL
- **AAD Connect Config**: ProgramData\AADConnect, Server Configuration export, Company Features, Auto Upgrade, Connector Statistics
- **System Info**: tasklist, MSInfo32, GPResult, Computer Info, Services

## Script Version

V1.5 - 2025-Oct 6th

## Notes

- Script enables LDAP tracing for AzureADConnect.exe, miiserver.exe, and powershell.exe
- Purges Kerberos tickets (klist purge) and flushes DNS before repro
- Automatically cleans up registry keys and stops traces after collection
- Output: `C:\temp\MicrosoftTraceLogs.zip`
