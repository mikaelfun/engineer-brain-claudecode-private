# End-to-End Troubleshooting of Entra Connect Objects & Attributes

> Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/user-prov-sync/troubleshoot-aad-connect-objects-attributes

## 4-Step Methodology

### Step 1: ADDS → ADCS (Import from AD)
**Check**: Is object/attribute present in AD Connector Space?

- **Connectivity**: Check Sync Service Manager → Import step → Connection Status
- **Permissions**: ADCA (AD Connector Account) needs read permissions
  - Use "Effective Access" in AD Users and Computers
  - Check inheritance blocking on OU/object
  - Check explicit Deny ACLs
- **AD Replication**: Compare data across DCs with `repadmin /showattr`
- **Filtering**: Check domain/OU filtering, attribute filtering, object type inclusion
- **Tools**: ADConnectivityTool, LDP, DSACLS, `Get-ADSyncConnector`

### Step 2: ADCS → Metaverse (Sync Rules Inbound)
**Check**: Does object/attribute flow from CS to MV?

- Check inbound provisioning sync rules: `Get-ADSyncRule | where {$_.Name -like "In From AD*"}`
- Check object lineage in Sync Service Manager
- Check scoping filters on sync rules
- Run Preview → Generate Preview → Commit Preview
- Export object: `Export-ADSyncToolsObjects -DistinguishedName '...' -ConnectorName '...'`

### Step 3: Metaverse → AADCS (Sync Rules Outbound)
**Check**: Does object/attribute flow from MV to AAD Connector Space?

- Check outbound provisioning rules: `Get-ADSyncRule | where {$_.Name -like "Out to AAD*"}`
- Check cloudFiltered attribute in MV
- Check scoping filters on outbound rules

### Step 4: AADCS → Entra ID (Export)
**Check**: Does object match in Entra ID?

Common silent issues:
- **Multiple active AADC servers**: Stale server reverts changes
- **DirSyncOverrides on Mobile**: Cloud update overrides on-prem sync
- **UPN not updating**: Enable SynchronizeUpnForManagedUsers feature
- **Invalid characters**: Silent discard by ProxyCalc (space in SMTP:, invisible chars in UPN)
- **ThumbnailPhoto**: 100KB limit; EXO may cache old HD image

## Anti-Patterns
- **DO NOT** disable DirSync to troubleshoot (takes 72h+ backend operation)
- Instead: `Set-ADSyncScheduler -SyncCycleEnabled $false` to pause
