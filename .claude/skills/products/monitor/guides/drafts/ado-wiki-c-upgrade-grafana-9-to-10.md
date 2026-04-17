---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Grafana/How-To/Upgrade From Grafana Version 9 to 10"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Managed%20Grafana/How-To/Upgrade%20From%20Grafana%20Version%209%20to%2010"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Upgrade Azure Managed Grafana from Version 9 to 10

Grafana 9 reached end of support on August 31st, 2024.

## Via Azure Portal

1. Navigate to **Grafana > Configuration > General Settings** and verify current version is Grafana 9.
2. Change the **Grafana Version** dropdown to 10.
3. Check the warning checkbox (irreversible operation; instance will be upgraded to unified alerting which may require alert adjustments).
4. Click **Save**.
5. Navigate to the **Overview** blade and click the endpoint to verify successful upgrade and login.

## Via Azure CLI

1. Set subscription context:
   ```bash
   az account set --subscription SUBSCRIPTIONID
   ```

2. Verify current version (check `grafanaMajorVersion` shows 9):
   ```bash
   az grafana show --name GRAFANANAME
   ```

3. Upgrade to version 10:
   ```bash
   az grafana update --name GRAFANANAME --major-version 10
   ```

4. Navigate to the **Overview** blade and click the endpoint to verify.

## Important Notes

- This is an **irreversible** operation
- Instance will be upgraded to **unified alerting** if not already
- Customer may need to adjust existing alerts after upgrade

## Resources

- [Upgrade to Grafana Version 10](https://learn.microsoft.com/azure/managed-grafana/how-to-upgrade-grafana-10?tabs=azure-portal)
