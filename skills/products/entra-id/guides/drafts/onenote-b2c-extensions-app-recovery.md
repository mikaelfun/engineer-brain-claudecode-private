# Recovery of b2c-extensions-app

## Overview
The `b2c-extensions-app` is used by Azure AD B2C to store extension attributes. If accidentally deleted, the impact depends on whether the tenant uses extension attributes.

## Impact Assessment
- **No extension attributes used**: Deletion does NOT affect other B2C functionality
- **Extension attributes used**: Custom attributes stored via this app become inaccessible

## Recovery Procedures

### Within 30 days of deletion (Self-service)
Customer can restore the app themselves following:
- [Extensions app in Azure AD B2C - Microsoft Learn](https://learn.microsoft.com/en-us/azure/active-directory-b2c/extensions-app)

### After 30 days (PG intervention required)
1. Open an IcM to the B2C product group
2. PG has a database with records of the original app
3. PG will rebuild the app and base policy from their records
4. **Important**: The restored app will have a **different App ID** from the original
5. Customer cannot self-rebuild this app - it must be recognized by CPIM service

### Sample IcM
- [Incident-609431359](https://portal.microsofticm.com/imp/v5/incidents/details/609431359/summary)

## Key Notes
- The app name is not the important part - CPIM must recognize the app
- Customer-created replacement apps will NOT work
- Always check if customer actually uses extension attributes before escalating
