# Dynamic Groups Troubleshooting Guide

source: mslearn | url: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/dir-dmns-obj/troubleshoot-dynamic-groups

## Creation Issues

### Cannot Create Dynamic Group
1. **License**: Requires Entra ID P1 or P2 Premium
2. **Permissions**: Global admin, User admin; group creation may be restricted
3. **15,000 limit**: Max dynamic groups per tenant; no way to increase

### Rule Creation Errors
- Attribute not in supported properties list → check docs
- Use `user.` or `device.` prefix for properties
- Boolean attributes use `-eq`, not `-contains`
- Multiple predicates need `-and` / `-or` operators
- Simple rule builder supports max 5 expressions; use text box for more

## Membership Update Issues

### No Members / Wrong Members
1. Check processing status in portal (Overview page)
2. If "processing error" / "update paused" → contact admin/PG to resume
3. Validate user/device attributes match rule (manual validation or Validate Rules tab)
4. Guest user issue: Office 365 groups may block guest additions if `AllowToAddGuests=false`
   - Fix: allow guest users OR add `(user.userType -eq "member")` to rule
5. Wait minimum 24 hours for large tenants

### Processing Delays
- Usually completes within hours but can take >24h
- Factors: tenant size, number of changes, rule complexity, operator choice (CONTAINS/MATCH/MemberOf are slower)

### Force Reprocessing
- Add whitespace in middle of rule to trigger re-evaluation

## Deletion / Restoration
- Delete assigned licenses before deleting group
- O365 groups: restorable within 30 days; security/distribution groups cannot be restored
- Restored dynamic group re-populates from scratch (treated as new)

## Guest User Settings (PowerShell)
```powershell
# Check tenant-level AllowToAddGuests
Connect-MgGraph
# Read directory settings → check AllowToAddGuests value
# Update at tenant or group level as needed
```
