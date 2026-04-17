---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Grafana/How-To/Retrieve the UID of a Grafana Data Source and Dashboard"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Managed%20Grafana/How-To/Retrieve%20the%20UID%20of%20a%20Grafana%20Data%20Source%20and%20Dashboard"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Retrieve the UID of a Grafana Data Source and Dashboard

At times it may be required to obtain a UID of a particular object such as a data source or dashboard within the Grafana portal for use with additional troubleshooting.

## Data Source UID

### From URL

1. Navigate under **Configuration -> Data sources** from the side bar in Grafana.
2. Click on one of the data sources which will load the individual page, take note of the URL:

   `https://AMGNAME.REGION.grafana.azure.com/datasources/edit/UID`

   The last portion of this URL is the UID of the data source.

### From Browser Dev Tools

1. Launch Browser Dev Tools (F12 in Edge) once on the Main Grafana page.
2. Navigate to **Configuration -> Data sources**.
3. In the network tab, look for the `datasources` call. The response JSON contains all UIDs for all datasources.

## Dashboard UID

1. Navigate under **Dashboards -> Browse** from the side bar.
2. Click on the folder and on the dashboard to load it, take note of the URL:

   `https://AMGNAME.REGION.grafana.azure.com/d/UID/DASHBOARDNAME`

   The portion marked UID is the UID of the dashboard.

3. Alternatively, click on the gear icon in the top right -> **JSON Model** and the `uid` field shows the dashboard UID.
