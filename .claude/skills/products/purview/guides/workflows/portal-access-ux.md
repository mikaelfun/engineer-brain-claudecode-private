# Purview 门户访问与 UX — 排查工作流

**来源草稿**: `ado-wiki-a-getting-access-new-purview-unified-portal.md`, `ado-wiki-a-new-purview-portal-trainings.md`, `ado-wiki-c-portal-cant-be-opened-via-private-endpoint.md`, `ado-wiki-check-entity-payload-from-ux.md`, `ado-wiki-faq-new-purview-enterprise-portal.md`
**Kusto 引用**: 无
**场景数**: 10
**生成日期**: 2026-04-07

---

## Scenario 1: Getting Access to New Purview Unified Portal (CSS Internal)
> 来源: ado-wiki-a-getting-access-new-purview-unified-portal.md | 适用: 未标注

### 排查步骤
> Access to the new Purview UX is currently restricted to limited users as PG enables it in a phased manner.

`[来源: ado-wiki-a-getting-access-new-purview-unified-portal.md]`

---

## Scenario 2: Option 1: Ninja Environment (Tenant-level / Enterprise-tier scenarios)
> 来源: ado-wiki-a-getting-access-new-purview-unified-portal.md | 适用: 未标注

### 排查步骤
For testing or reproducing customer issues in the new Unified Portal:

1. **Request Access** via: https://myaccess.microsoft.com/@seccxpninja.onmicrosoft.com#/access-packages

2. Select the appropriate package:
   - **Contoso Demos Users** — access to Contoso Demo environment
   - **Contoso Demos Users - Elevated** — limited write operations in Contoso Demo (7 days)
   - **Purview Access** (MSFT ONLY) — Purview Admin access (PurviewVteam + PurviewDataReader roles)
   - **Purview Data Curator Access** (MSFT ONLY) — Data Curator access
   - **Tier 1 Analysts** — SecurityDemoT1 + PurviewDataReader roles

3. Wait **up to 24 hours** for PG review and approval.

4. If not approved within 24 hours, email:
   - [Purview EEEs](mailto:azurepurvieweees@microsoft.com)
   - [Kevin McKinnerney](mailto:kemckinn@microsoft.com)

5. Once approved, access Ninja environment at: https://aka.ms/purviewninja (use Microsoft credentials)

For queries/feedback: [Purview EEEs](mailto:azurepurvieweees@microsoft.com)

---

`[来源: ado-wiki-a-getting-access-new-purview-unified-portal.md]`

---

## Scenario 3: Option 2: CSS Test Tenant (Quick Testing)
> 来源: ado-wiki-a-getting-access-new-purview-unified-portal.md | 适用: 未标注

### 排查步骤
Engineers can use the following link for direct testing & repro:

**URL:** https://purview.microsoft.com/home?tid=4f1dc10a-df9b-4f93-be0c-504b04f6309d

**Username:** purviewcss@Msftpurviewtest001.onmicrosoft.com

> **NOTE:** This information is only for CSS use. Do NOT share with customers or anyone outside CSS org.

`[来源: ado-wiki-a-getting-access-new-purview-unified-portal.md]`

---

## Scenario 4: Overview of new product strategy and demo of the new experience
> 来源: ado-wiki-a-new-purview-portal-trainings.md | 适用: 未标注

### 排查步骤
[Recorded Session](https://microsofteur-my.sharepoint.com/:v:/g/personal/batuhantuter_microsoft_com/ERXJcwStLzVDopCRMuiLlrUBsoWefdqR4cGTRvHgqmb9Fw?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3d&e=aiilg8)

> Covers: new product strategy overview and live demo of the new Purview experience.

`[来源: ado-wiki-a-new-purview-portal-trainings.md]`

---

## Scenario 5: Issue description
> 来源: ado-wiki-c-portal-cant-be-opened-via-private-endpoint.md | 适用: 未标注

### 排查步骤
User is opening portal in VNET and user has configured portal private endpoint in this VNET, but portal can't be opened.

`[来源: ado-wiki-c-portal-cant-be-opened-via-private-endpoint.md]`

---

## Scenario 6: COMMON RESOLUTIONS
> 来源: ado-wiki-c-portal-cant-be-opened-via-private-endpoint.md | 适用: 未标注

### 排查步骤
Most Common Options to Resolve:
1) If customer using Purview Network Config "Disabled Public", then they need to add their machine that they are connecting to the Portal from to the same Network as Purview...or if already done, then they need to check the DNS.

2) If the customer changes Purview Network Config to "Disabled Public for Ingestion" only...then it should resolve the issue.

`[来源: ado-wiki-c-portal-cant-be-opened-via-private-endpoint.md]`

---

## Scenario 7: Troubleshooting
> 来源: ado-wiki-c-portal-cant-be-opened-via-private-endpoint.md | 适用: 未标注

### 排查步骤
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

`[来源: ado-wiki-c-portal-cant-be-opened-via-private-endpoint.md]`

---

## Scenario 8: Steps
> 来源: ado-wiki-check-entity-payload-from-ux.md | 适用: 未标注

### 排查步骤
1. When the browser is active and you're viewing the asset entity under investigation, press **F12** to open developer tools.

2. Click on the **refresh** button to ask the portal to retrieve the entity again. You should see many requests on the **Network** tab.

3. Copy the GUID of the entity from the URI to the **filter** field to filter out the relevant requests.

4. Click on the request with **"bulk"** and size not equal to 0 — you should see the payload in the response tab.

`[来源: ado-wiki-check-entity-payload-from-ux.md]`

---

## Scenario 9: Use Case
> 来源: ado-wiki-check-entity-payload-from-ux.md | 适用: 未标注

### 排查步骤
This technique is useful for debugging entity-related issues in Microsoft Purview Governance Portal, such as:
- Verifying entity schema/metadata
- Checking if entity data is correctly returned from the API
- Troubleshooting missing or incorrect entity attributes

`[来源: ado-wiki-check-entity-payload-from-ux.md]`

---

## Scenario 10: FAQ - New Purview Enterprise Portal Experience
> 来源: ado-wiki-faq-new-purview-enterprise-portal.md | 适用: 未标注

### 排查步骤
**Q: What is the goal of the new Microsoft Purview experience?**
A: Provide a platform for data governance and drive business value creation. Microsoft Purview is becoming a broader enterprise solution and security platform, shifting from a technical experience to a solution experience.

**Q: What are the new experiences introduced?**
A: Business domains, Data products, Improved glossary terms, and Objectives and Key Results (OKRs). All available in a single, integrated SaaS framework.

**Q: How do the levels of permissions work?**
A: Access is divided between application roles for users and tenant/organization level roles for owners and stewards:
- Tenant/organization permissions
- Application-level permissions
- Business domain level permissions
- Collection level permissions
- Data access permissions

**Q: What are Business domains?**
A: Organizational objects providing context for data assets, aligning data estate to organization structure. They act as boundaries for scaling data governance practices.

**Q: What are Data products?**
A: Improvement on catalog organization that groups data assets together (tables, files, PBI reports, etc.) for users to discover, providing assets with a use case to be shared with data consumers.

**Q: What are the new features of Glossary terms?**
A: Glossary terms improved from static objects to active objects that define how data assets should be managed, governed, and made discoverable. Policies within terms allow data stewards to scale governance.

**Q: What are Objectives and Key Results (OKRs)?**
A: Metrics linking data products directly to objectives, bridging the gap between business and data catalog with measurable values and goals.

**Q: What are the new Data Estate Health experiences?**
A: Data estate health summary (quick glance into health + recommended actions) and Data estate health reports (detailed drill-down with customized reports).

`[来源: ado-wiki-faq-new-purview-enterprise-portal.md]`

---
