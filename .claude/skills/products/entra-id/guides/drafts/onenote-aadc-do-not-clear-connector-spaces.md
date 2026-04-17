# AAD Connect: Do NOT Clear Connector Spaces

> Source: PG Guidance (shared internally)

## Key Rule

**B.L.U.F. DO NOT clear AAD Connect AD or AAD Connector Spaces without the approval of EEE or PG**

## Why Not

Clearing AD and/or AAD connector spaces can cause serious issues:

1. **State Loss** - Legitimate deletes accumulated in the DB are lost forever. Original AD objects are gone and Azure AD objects cannot be correlated to non-existent on-prem objects. Results in unexplained AAD objects that should have been deleted.

2. **Unintended Mass Deletion** - Scheduler can automatically trigger right after CS is deleted. If it runs remaining steps, it can delete large numbers of objects, causing Sev 1 incidents. Newer versions prompt to disable scheduler during deletion, but custom schedulers bypass this protection.

3. **PG Loses Diagnostic Opportunity** - If a product shortcoming causes the need to delete CS, PG never gets to see/fix the root cause.

## Recommended Alternative

1. **Perform a Full Sync** first - this resolves the issue in most cases
2. If Full Sync doesn't work, try **Full Import and/or Full Sync on the specific connector** having the issue
3. If still unresolved, escalate for further investigation via ICM

## Reference

- Internal KB: https://internal.support.services.microsoft.com/en-us/help/4077002
