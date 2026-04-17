# Troubleshooting VPP App Sync Issues - TSG

**Source**: OneNote > Mooncake POD Support Notebook > iOS TSG > Troubleshooting VPP app Sync Issues

## Quick Validation Steps

Most issues can be identified within minutes by checking these items:

### Step 1: Check Apple System Status
- Go to https://www.apple.com/support/systemstatus/
- Verify "Volume Purchase Program" shows as **Available**

### Step 2: Validate VPP Token Status
- Intune Admin Center > Tenant administration > Connectors and tokens > Apple VPP Tokens
- Check token is syncing and reports no issues
- Note the VPP Token ID from the URL

### Step 3: Verify App Purchased in ABM
- Go to https://business.apple.com > Apps and Books
- Search for the affected app
- Check "Manage licenses" > verify the **Location** matches the VPP token name in Intune
- Note: Recent purchases may take a few minutes to propagate

### Step 4: Kusto Backend Validation

**Get sync Activity ID:**
```kql
VppFeatureTelemetry
| where accountId == "{AccountID}"
| where tokenId == "{VPP-Token-ID}"
| where TaskName == "VppAssetSyncSuccessEvent"
| where env_time > ago(3d)
| project env_time, accountId, tokenId, applications, ActivityId
```

**Check app sync details:**
```kql
IntuneEvent
| where ActivityId == "{ActivityID-from-above}"
| project ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6
```
Look for the affected app name and verify the TokenID value.

### Step 5: Renew VPP Token
If all above checks pass and the issue persists:
- Follow token renewal procedure in Intune admin center
- Reference: Intune: How to renew a VPP token

## Escalation

If steps 1-5 don't resolve the issue:
- Check with TA/TL or SME
- Post on Intune App-Deployment Teams channel with:
  - Sample app name
  - TokenId
  - Kusto query results
