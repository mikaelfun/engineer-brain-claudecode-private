---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Advisor/How Tos/Get Customer PUID_Advisor"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Advisor/How%20Tos/Get%20Customer%20PUID_Advisor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Summary
Methods to retrieve customer PUID.

## Method 1: Using Extension Analyzer
### Prerequisites
- Customer's SessionId (follow Portal workflow to get it)
- Access to [ExtensionAnalyzer](https://extensionanalyzer.azure-test.net/)

### Instructions
1. Browse to [ExtensionAnalyzer](https://extensionanalyzer.azure-test.net/)
2. Provide the SessionId, click Analyze
3. Under Overview > Summary, the **User ID** is the PUID

## Method 2: Using Kusto
### Prerequisites
- Customer's SessionId
- Access to [azportalpartnerrow](https://azportalpartnerrow.westus.kusto.windows.net/) cluster

### Instructions
```kql
cluster("azportalpartnerrow.westus.kusto.windows.net").database("AzurePortal").SvcSessions
| where PreciseTimeStamp >= ago(1d)
| where sessionId == "{SESSION_ID}"
| summarize by sessionId, userId
```
`userId` = PUID

## Method 3: Using ASC
### Prerequisites
- User's email address (or Display Name, UPN, Object ID)

### Instructions
1. Go to ASC > Tenant Explorer > Users
2. Paste email address in search box
3. Click 'run' - PUID is labeled as **NetID**

## Method 4: Using Azure Cloud Shell
### Prerequisites
- Customer needs Cloud Shell access

### Instructions
Have the customer run: `env | grep ACC_PUID`
`ACC_PUID` is the PUID.
