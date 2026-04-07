---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/AMPLS (Azure Monitor Private Link Scope)/Learning Resources/Training/Course Materials/AMPLS Labs/Deploy a minified version of the Lab manually"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAMPLS%20%28Azure%20Monitor%20Private%20Link%20Scope%29%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAMPLS%20Labs%2FDeploy%20a%20minified%20version%20of%20the%20Lab%20manually"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Required Azure resources

1. Log Analytics
2. App Insights
4. Virtual Network
5. Function App
6. AMPLS resource
7. Private endpoint


# Lab walkthrough

# Build your landing zone

**1. Create Virtual Network**

**a.** Pick a name for your VNET

**b.** Configure the **IP ranges** and **subnets** — create at least:
   - `mgmtSubnet` (for Private Endpoint)
   - `appSubnet` (for App Service / Function App VNET Integration)

# Create AMPLS

**a.** Search for "Azure monitor Private Link Scope" from search bar and select.

**b.** Create a new AMPLS resource. Pick a name for your AMPLS resource and keep other as default.

> **Note**: AMPLS is a Global resource. Resource Group region is where the metadata for AMPLS is kept.

**2. Create Private Endpoint and Private Endpoint Connection**

   **a.** From the created AMPLS resource, click on Private endpoint connection and click + Private Endpoint

   **b.** Provide a Name for private endpoint. The Network interface name will get auto populated with a _-nic_ suffix on private endpoint name.

   > **Note**: Location should be same as virtual network location.

   **c.** On Resource Type, search for _"Microsoft.Insights"_ and select _Microsoft.Insights/privatelinkScopes_

   **d.** On Resource, Select previously created AMPLS resource. Target sub-resource will get auto populated.

   **e.** On Virtual Network tab, select the previously created virtual network and on subnet, select _mgmtSubnet._

   **f.** On DNS ensure _Integrate with private DNS zone_ is selected to _Yes_ and new private DNS Zones are being created.


# Create Azure Monitor Resources
**1. Log Analytics Workspace (LAW)**

   Pick a name for your LAW and **create a new resource group** (RG) in which all our resources will be saved into. Also pick a location close to you.

**2. Application Insights**

   Inside the same resource group, add a new workspace-based App Insights resource.
   Make sure to select the LAW we previously created as the workspace.


# Add Azure monitor resources to AMPLS

   **a.** From AMPLS, Click on _Azure Monitor Resources_ and Click _+ Add_

   **b.** Select the Application Insights resource that we created for this lab and click _Apply_.

   **c.** Follow the same Step to Add Log Analytics Workspace

   **d.** After adding both resources, both can be seen listed as Azure monitor resources in AMPLS.


# Generate sample data with a Function App

**1. Create the Function App**

   **a.** Pick a name for the Function App (should be unique, e.g. **ampls-workshop231011**)

   **b.** On the same blade select:
   - _Do you want to deploy code or container image?_ → **Code**
   - Runtime stack → **.NET**
   - Version → **6(LTS)**
   - Region → Select same as the Resource Group location

   **c.** Select Operating System _"Windows"_, On Hosting options and plans select _"App Service plan"_. Select pricing plan.

   **d.** On monitoring Tab, select the Application insights we created on previous step.

**2. Create a Function**

**a.** On the Function app overview blade, select functions and click create in Azure portal.

**b.** Select Time trigger
- Give function a Name
- In schedule, copy and paste → _`*/30 * * * * *`_ (this function will run every 30 seconds)

**4. Check Live Metrics and Logs in Application insights**

**a. Live Metrics** — verify telemetry is flowing

**b. Transaction Search** — verify individual requests are appearing


## AMPLS relies on DNS

**1. Check DNS resolution from your Function Apps Kudu Console**

   **a.** From Function App, click on _Advanced tool_ and click _Go_

   **b.** On Kudu page click _Debug Console_ and Select _PowerShell_.

> **Tip**: On Windows App Service use _nameresolver.exe_ instead of _nslookup_.

   At this point (before VNET integration), DNS will likely return a **public IP** for the Azure Monitor endpoints.

**2. Enable Vnet Integration in Function App**

   **a.** From Function App, click on _Networking_ and then _Vnet Integration_.

   **b.** Click on _Add virtual network integration_, Select the virtual network that we created in previous step and for subnet select _appSubnet_. Then click _Connect_.

> **Important**:
> - Vnet Integration can be enabled on the Networks that are in same location as the web App / Function App.
> - If subnet is not already delegated to App Service, it should be empty and not delegated to any other services.

**3. Verify DNS Resolution is now returning Private IP**

   **a.** Follow Steps above to check DNS Resolution from Function App Kudu.

   After VNET integration is enabled, `nameresolver.exe` should now return a **private IP** for Azure Monitor endpoints — this confirms AMPLS private DNS is working correctly.


# Lock down access on App Insights and Log Analytics

_1. Disable ingestion from public Networks in Application insights and Log Analytics Workspace_

_2. Check Transaction search_ — data should still flow via private link

_3. Disable query too from public Network on App Insights and Log Analytics Workspace_

_4. Check transaction Search_ — portal queries from public network should now be blocked

**Congratulations. You just succeeded in setting up the lab.**

### Clean up Resource

When you are done, you can delete the resource group to delete all the created resources.
