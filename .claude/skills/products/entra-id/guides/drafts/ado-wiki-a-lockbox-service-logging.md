---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Customer LockBox/Log Query Reference/Lockbox Service Logging"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FCustomer%20LockBox%2FLog%20Query%20Reference%2FLockbox%20Service%20Logging"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Customer Lockbox - Service Logging

## Finding a Client Request ID

**Jarvis Configuration**:
- Namespace: **LockBox**
- EventName: **OperationTrace**
- Filtering: `AnyField contains <request Id>`

This ensures you can follow the whole request path even after it is handed between services.
