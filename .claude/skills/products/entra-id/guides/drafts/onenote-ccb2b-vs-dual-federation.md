# Cross-Cloud B2B vs Dual-Federation vs Multi-Tenant Sync

> Source: OneNote - Cross Cloud B2B / Technical details / Comparison with dual-fed

## Comparison Table

| Aspect | Dual Federation (same UPN) | Sync AD to Multiple Tenants | Cross-Cloud B2B |
|--------|---------------------------|---------------------------|-----------------|
| **Description** | Sync same user to both clouds via AAD Connect + ADFS. Single username/password. Must be approved by PG. | Sync same user to both clouds. Password hash sync. Different UPN domains required. | B2B guest invitation across sovereign clouds. Customer controls collaboration scope. |
| **Requirements** | Unified MS support contract, 1500+ paid seats per cloud, PG pre-approval, FastTrack + CSA engagement | Domain names CANNOT be same across clouds | Configure cross-tenant access settings on both tenants, invite guests |
| **User Experience** | Same UPN + password | Same password, different UPN | Same UPN + password (home tenant auth) |
| **Office 365** | NOT supported on multiple clouds | Supported | Supported (SharePoint, OneDrive, Teams, co-editing) |
| **Azure Services** | Supported | Supported | **Limited** - NOT on official support list (ADX web UI fails) |
| **Dynamics 365** | Supported | Supported | **NOT supported** |
| **Power BI** | Supported | Supported | Supported |

## Recommendation Decision Tree

1. **Need Dynamics 365 cross-cloud?** → Dual-Fed or Multi-Tenant Sync (CC B2B not supported)
2. **Need Azure CLI/PowerShell cross-cloud?** → Dual-Fed or Multi-Tenant Sync (CC B2B limited)
3. **Only need O365 + Teams collaboration?** → CC B2B (simplest, no PG approval needed)
4. **Have 1500+ seats + Unified support?** → Consider Dual-Fed for full scope
5. **Cannot use same domain on both clouds?** → Multi-Tenant Sync or CC B2B

## Known Issues - CC B2B

- ADX web UI authentication does not work
- Dynamics 365 not supported
- Azure Portal subscription overview infinite loading (ICM-367805534)
- Must use tenanted endpoint for portal access
- Consumer accounts (LiveID) not supported
