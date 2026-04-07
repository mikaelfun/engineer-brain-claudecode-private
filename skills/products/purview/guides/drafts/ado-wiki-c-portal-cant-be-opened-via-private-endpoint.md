---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/UX/Portal can't be opened via Private Endpoint"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20%28TSGs%29%2FUX%2FPortal%20can%27t%20be%20opened%20via%20Private%20Endpoint"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

Author: Yusheng Jiang

Secondary Author: Tiffany Fischer

# Issue description
User is opening portal in VNET and user has configured portal private endpoint in this VNET, but portal can't be opened.

# COMMON RESOLUTIONS
Most Common Options to Resolve:
1) If customer using Purview Network Config "Disabled Public", then they need to add their machine that they are connecting to the Portal from to the same Network as Purview...or if already done, then they need to check the DNS.

2) If the customer changes Purview Network Config to "Disabled Public for Ingestion" only...then it should resolve the issue.

# Troubleshooting

1. Make sure customer does need portal private endpoint. Unlike account PE protecting customer's data from being visited in public network, Purview Portal is a totally static website, composed by several static html/css/js files. No customer's data will be sent or retrieved via Portal PE.

    Purview portal PE is not aimed at protecting customer's data in Purview account, it's only useful when customer's VNET has totally no public network access and the only way to access Portal is via private endpoint. If customer's VNET has public access and he/she can visit Purview portal without portal PE, it is suggested for customer to remove portal PE and visit portal through public network.

    And since Purview portal is global, multiple accounts will also share a same portal. Customer will only need one portal PE (if he/she really needs portal PE) no matter how many accounts he/she have. And Purview portal PE might also have issues when customer has multiple peering VNETs. We still recommend customer to remove portal PE if he/she can visit it without portal PE.

2. Check if DNS is correctly configured. Make sure customer has done one of the options in this [doc](https://learn.microsoft.com/en-us/azure/purview/catalog-private-link-name-resolution). Especially for customers that aren't using Azure private DNS zone, check if they have registered all DNS records in this [section](https://learn.microsoft.com/en-us/azure/purview/catalog-private-link-name-resolution#option-3---use-your-own-dns-servers). 

    Ask customer to run below commands one by one in cmd to check if their DNS is correctly configured.
    ```cmd
    nslookup {Customer's purview account name}.purview.azure.com
    nslookup web.purview.azure.com
    nslookup catalog.prod.ext.web.purview.azure.com
    nslookup web.privatelink.purviewstudio.azure.com
    ```
    The first one should be targeted to customer's account PE IP, the 2nd-4th ones should be targeted to customer's portal PE IP. Otherwise it means some DNS configurations are missing.

3. After checking DNS is correctly configured, check if portal is totally inaccessible or portal is partially loaded but having networking issue (You can see Microsoft Purview at top)

    - **Totally unaccessible** (ERR_NAME_NOT_RESOLVED): DNS not resolving — revisit DNS configuration.

    - **Partially loaded** (AxiosError: Network Error): Account API may have failed or be inaccessible. Note that account PE can't be shared across different accounts — each account needs a separate account PE.

      Open browser console -> network tab, check if there is any API failure. Click on the failed API requests and check its URL:
      - URL is `{account name}.purview.azure.com` → error is on account PE or account service
      - URL is `web.purview.azure.com` or `xxx.prod.ext.web.purview.azure.com` → error is on portal PE or portal web app failure
      
      Grab the HAR file and send it to Engineer team to triage.

    - **ERR_CERT_COMMON_NAME_INVALID in console**: Purview account endpoint is being pointed to a wrong IP. Check if account endpoint is correctly configured to account PE IP in customer's DNS configurations. Customer might confuse it with portal PE IP and configured it to portal IP, leading to a CERT error. Ask customer to run nslookup to verify:
      ```
      nslookup {accountname}.purview.azure.com
      ```
      Should resolve to account PE IP, not portal PE IP.
