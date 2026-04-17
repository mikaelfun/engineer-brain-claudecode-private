---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra Domain Services/Microsoft Entra Domain Services - Microsoft Entra DS Health Alert Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20Domain%20Services%2FMicrosoft%20Entra%20Domain%20Services%20-%20Microsoft%20Entra%20DS%20Health%20Alert%20Troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AADDS Health Alert Troubleshooting — Locating Service Logs

Guide for locating MEDS service logs corresponding to a customer's Microsoft Entra Domain Services Health Alert.

## Steps to Locate MEDS Service Logs

1. **Get the MEDS Resource URI** from ASC Resource Explorer or customer:
   `/subscriptions/{subId}/resourceGroups/{rg}/providers/Microsoft.AAD/DomainServices/{domain}`

2. **Open ASC Resource Explorer** → locate `Microsoft.AAD\DomainServices\{domain}` → note the **Tenant ID**.

3. **Visit the Health blade** → find the health alert → note **Last Detected** timestamp (UTC).

4. **Run Jarvis Query** to find health alert logs:
   - Commercial: https://portal.microsoftgeneva.com/s/594CA9DB
   - USGov: https://portal.microsoftgeneva.com/s/F83C152C
   - Update **Time Range** to ±5 minutes of "Last Detected" time.
   - Update **ContextId** filter to the Tenant ID.

5. Run query → click "columns" button → enable **ALL 8 available columns**.

6. Note the returned **activityId**.

7. **Run verbose trace log query** for the activityId:
   - Commercial: https://portal.microsoftgeneva.com/s/5E9B8763
   - USGov: https://portal.microsoftgeneva.com/s/9A8CBCAD
   - Update **Time Range** ±5 min around Last Detected.
   - Update **activityID** filter to the activityId from step 6.

8. Run query → review verbose errors and warnings to identify root cause.

9. **Most common MEDS health error**: Network connectivity.
   Follow TSG: [Azure AD Domain Services Test Network Connectivity](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/354252/Azure-AD-Domain-Services-Test-Traffic)

10. **For escalation**: Generate Jarvis deep link → click link icon next to "Server query" → copy **Short Link (Absolute time)** → paste in case notes / ICM.
