---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Group Management/SSGM - Self Service Group Management/TSG - Group Expiration and Group Expiration Notification Emails"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FGroup%20Management%2FSSGM%20-%20Self%20Service%20Group%20Management%2FTSG%20-%20Group%20Expiration%20and%20Group%20Expiration%20Notification%20Emails"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# TSG: Group Expiration and Auto-Renewal

## ShouldGroupBeAutoRenewed Flag

Located in group property `appMetadata`, stored as Base64. Decode the `ShouldGroupBeAutorenewed` value to see True/False.

Example appMetadata:
```
{ "version": 0, "data": [
  { "key": "Policyldentifier", "value": "" },
  { "key": "LastNotificationDateTime", "value": "" },
  { "key": "NumNotificationsSent", "value": "MA==" },
  { "key": "GroupExpiryDateTime", "value": "" },
  { "key": "ShouldGroupBeAutorenewed", "value": "RmFsc2U=" }  // Base64 for "False"
]}
```

Check in ASC: Group Properties tab > appMetadata.

## Expected Expiration Flow

1. **~60 days before expiry**: Groups 911 (Exchange team) monitors for qualifying activities. If activities found, sets `ShouldGroupBeAutoRenewed = True`.
   - Activities: [MS docs: activity-based automatic renewal](https://learn.microsoft.com/en-us/entra/identity/users/groups-lifecycle#activity-based-automatic-renewal)

2. **35 days before expiry**: SSGM checks flag (~twice/day). If True → renews group, resets flag to False.

3. **30 days before expiry**: If flag still False → SSGM sends expiration notification to owners + contact email. Additional emails at 15 days and 1 day.

4. **Expiration date reached**: If flag still False → SSGM deletes group, sends final notification with restore instructions.

> Note: Groups 911 only sets flag to True; SSGM only sets flag to False.

## Troubleshooting

### Verify group is targeted by expiration policy
```
GET beta/groups/{GroupID}/groupLifecyclePolicies
```
Returns policy data if group is in scope; empty if not.

### Issue: Expiration email received unexpectedly (group should have been autorenewed)
1. Obtain copy of email file (.msg or .eml)
2. Obtain group ObjectID
3. Create ICM to **IAM Services / SSGM Triage** with above info

### Issue: Group was renewed when it should not have been
Create ICM to **IAM Services / SSGM Triage** with:
- Group ObjectID
- DateTime (UTC) when autorenewed
- CorrelationID of autorenewal audit event (if available)

## Resources
- [EEE TechTalk: Understanding Group Autorenewal](https://microsoft.sharepoint.com/teams/EmbeddedEngineer/Training%20Videos/EEE%20Tech%20Talks/IAM%20Services/2023-12%20Understanding%20Group%20Autorenewal/)
- [Behavior when an LCM policy is enabled](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1787784/Behavior-when-an-LCM-policy-is-enabled)
