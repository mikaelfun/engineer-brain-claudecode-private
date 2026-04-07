# AAD Connect: Stop Syncing One Forest's Objects to Azure AD

> Source: Internal sharing (multi-forest scenario)

## Scenario

Multiple forests configured in a single AAD Connect instance. Need to stop syncing objects from one specific forest while keeping others.

## Steps

1. **Disable sync scheduler**:
   ```powershell
   Set-MsolDirSyncEnabled -EnableDirSync $false
   ```

2. **Delete the target forest's connector** in Synchronization Service Manager:
   - Open Sync Service Manager
   - Go to Connectors
   - Right-click the connector for the forest to remove → Delete

3. **Re-enable scheduler and run full sync**:
   ```powershell
   Set-ADSyncScheduler -SyncCycleEnabled $true
   Start-ADSyncSyncCycle -PolicyType Initial
   ```

4. **Verify** in Azure AD:
   - Open AAD Connect wizard - the removed forest should no longer appear
   - Check Azure AD - users from the removed forest should be deleted

## Notes

- Objects from the removed forest will be **deleted from Azure AD** after full sync
- The forest can be **re-added** later via AAD Connect wizard if needed
- Consider impact on users before removing a forest connector
