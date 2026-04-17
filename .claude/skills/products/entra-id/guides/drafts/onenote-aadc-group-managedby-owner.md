# AAD Connect: Group ManagedBy and Owner Attribute Sync Logic

> Source: Internal case study

## Key Findings

### Cloud-Created Groups
- Setting the **Owner** attribute reflects to O365 portal, AAD portal, and AAD backend Owner attribute

### Synced Groups (from on-prem)
1. **ManagedBy** and **Owner** are synced **separately**
2. **ManagedBy** is synced directly from on-prem AD
3. **Owner** attribute by default is **not** in on-prem AD (cloud-only attribute)
4. The "Manager" (value of ManagedBy) of the synced group **must also exist in cloud** - otherwise AAD backend, AAD portal, and O365 portal will show empty

### O365 Portal Display
- The Manager shown in O365 portal is a **combined result** of either ManagedBy or Owner attributes
- Value in either attribute will show up in O365 portal

## Implications for Troubleshooting

- If customer reports group manager not showing in O365: check if the manager user object is also synced to cloud
- If ManagedBy is set on-prem but empty in cloud: verify the manager user object exists in AAD
- Owner attribute in AAD is independent from ManagedBy - they are separate attributes with different sync paths
