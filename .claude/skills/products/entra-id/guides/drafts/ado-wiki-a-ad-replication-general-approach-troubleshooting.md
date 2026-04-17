---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Workflow:  Replication Scoping/General Approach to Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Replication%2FWorkflow%3A%20%20Replication%20Scoping%2FGeneral%20Approach%20to%20Troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# General Approach to Troubleshooting AD Replication

## Principles

1. **Use tools**: AD Replication Status Tool or `repadmin`
2. **One server at a time**: `repadmin /showrepl` for status
3. **Fix errors one by one**: Replication uses pull model
4. **Root domain first**: Fix contoso.com before child domains

## Workflow

1. Pick a DC, run `repadmin /showrepl`
2. Identify failing partners and error codes
3. Focus on one partner, resolve its error
4. Move to next partner after fix
5. Fix root domain -> child domains -> cross-domain

## Common Replication Errors

| Error Code | Message | Category |
|---|---|---|
| 1722 (0x6ba) | RPC server is unavailable | Network/connectivity |
| -2146893022 (0x80090322) | Target principal name is incorrect | Kerberos/SPN |
| 5 (0x5) | Access is denied | Permissions/security |

## Order of Operations

1. Fix intra-domain replication in root domain
2. Fix intra-domain replication in each child domain
3. Fix cross-domain replication errors
4. Use workflow and KB articles for specific error resolution
