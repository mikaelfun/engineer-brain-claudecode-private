---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/How-To/How to get Tenant level diagnostic settings for an Azure tenant from Azure Support center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/How-To/How%20to%20get%20Tenant%20level%20diagnostic%20settings%20for%20an%20Azure%20tenant%20from%20Azure%20Support%20center"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

# Instructions
---

1. Please navigate to Azure Support center and input the customer support id.
2. Click on the "Resource explorer" on the left nav.
3. Wait for all the resources to load on the resource tree for the given subscription.
4. Search for "Microsoft.Insights" and click on it.
5. Click on the Diagnostic Settings V2(Azure Monitor) tab.
![image.png](/.attachments/image-635e034c-f0a7-48d1-822b-9350a6981859.png)
6. The tenant id is automatically populated and its displayed in the title.(its removed from the screenshot)
![image.png](/.attachments/image-293614d5-4abf-4405-9395-b2a37a599767.png)
7. If diagnostic settings exists for the tenant id, all the various of settings are shown the dropdown list. The Type shown in the screenshot is "AAD".
8. Select the required type and click "Run". The current diagnostic setting is displayed in the JSON format.
