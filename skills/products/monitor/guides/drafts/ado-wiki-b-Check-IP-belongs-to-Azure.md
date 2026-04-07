---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/General/How-To: Check if an IP belongs to a Microsoft Azure provider"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Log%20Analytics/How-To%20Guides/General/How-To%3A%20Check%20if%20an%20IP%20belongs%20to%20a%20Microsoft%20Azure%20provider"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
This tool can facilitate validating if a specific IP address that customer is asking about, belongs to the Azure list of public IP's and what is its respective provider


# High level steps
---
- [ ] Open the web application
- [ ] Paste the IP that you wish to validate, and check the output 

## Open the web application
---
1. Open [Microsoft IP tool](http://csstoolkit.azurewebsites.net/(S(5gar5bnseqzzyhxchoscdkq5))/Home/MicrosoftIPs)
1. It should look like this:

![image.png](/.attachments/image-16dfefd3-f394-4a7a-8bfd-41b49fc0ad58.png)

## Paste the IP that you wish to validate, and check the output 
---
1. Paste the IP you want to check on the white box
1. Click **Submit** and check the output:

![image.png](/.attachments/image-598597ef-e40a-49ef-9430-54809502fa82.png)

# References
---
[Microsot IP tool](http://csstoolkit.azurewebsites.net/(S(5gar5bnseqzzyhxchoscdkq5))/Home/MicrosoftIPs)
[Azure Public IP addresses](https://www.microsoft.com/download/details.aspx?id=56519)
