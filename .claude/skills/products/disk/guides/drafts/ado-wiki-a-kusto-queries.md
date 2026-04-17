---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - HPC Cache/Kusto queries"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20HPC%20Cache%2FKusto%20queries"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Kusto Queries — Azure HPC Cache (Avere)

Brief overview of Kusto Queries for Azure Storage Caches (HPC Caches). Not a full tutorial — for deeper learning see: https://aka.ms/kwe

---

## ACCESS

Access requires membership in a project with access to the Kusto database.

Apply for access at: [MyAccess](https://myaccess/identityiq/home.jsf) (being replaced by CoreIdentity — ask manager for current site).

---

## SETUP — ARMProd Cluster

Navigate to Azure Data Explorer: https://dataexplorer.azure.com/clusters/armprod/databases/ARMProd

If ARMProd database is not showing, add it:
1. Click **Add Cluster**
2. Enter Connection URI: `https://armprod.kusto.windows.net/`
3. Optionally enter a Display Name
4. Click **Add**

---

## EXAMPLE QUERIES

**Query all failures in EventServiceEntries for a subscription (last day):**
```kusto
EventServiceEntries 
| where TIMESTAMP > ago(1d) 
| where subscriptionId=="646cce9f-0a1c-4acb-be06-401056b03659" 
| where status == 'Failed'
```

**Limit output to 10 lines:**
```kusto
EventServiceEntries 
| where TIMESTAMP > ago(1d) 
| where subscriptionId=="646cce9f-0a1c-4acb-be06-401056b03659" 
| where status == 'Failed'
| limit 10
```

**Tips:**
- Expand a result row to see full event details
- Browse table fields by expanding: ARMProd cluster → ARMProd database → table
- Field types shown (e.g., string, datetime)
- Additional KQL keywords: `summarize`, `project`, `order by`, `extend`, etc.

---

## NOTES

- Familiarize yourself with ARMProd tables to write more powerful queries
- For HPC Cache issues, query `EventServiceEntries` filtered by `subscriptionId` and status
