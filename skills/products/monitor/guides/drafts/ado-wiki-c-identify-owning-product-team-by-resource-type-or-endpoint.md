---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Application Insights General Resources/Identify owning product team by resource type or endpoint"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FApplication%20Insights%20General%20Resources%2FIdentify%20owning%20product%20team%20by%20resource%20type%20or%20endpoint"
importDate: "2026-04-05"
type: troubleshooting-guide
---
## Identify the correct product team

If a customer is deploying an ARM template or Terraform script and it fails, you should attempt to narrow down the specific resource type that is failing to deploy in order to identify which product team is best to respond to the failing API calls. 

Use the table below to find owners of the specific resource type, or search (CTRL+F) for url hostname of the failing API call found in ARM logs to locate the correct product team. 

List is built from the _microsoft.insights_ ARM manifest file. 

[[_TOC_]]


##Resource Type: components
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: components/query
ICM Service: Azure Log Analytics
ICM Team: Draft (API)-OMS
Team Email: aiapi@microsoft.com
Resource Endpoints: 
   * https://internal.api.applicationinsights.io/
   * https://internal.api.aimon.applicationinsights.io/

---
##Resource Type: components/metadata
ICM Service: Azure Log Analytics
ICM Team: Draft (API)-OMS
Team Email: aiapi@microsoft.com
Resource Endpoints: 
   * https://internal.api.applicationinsights.io/
   * https://internal.api.aimon.applicationinsights.io/

---
##Resource Type: components/metrics
ICM Service: Azure Log Analytics
ICM Team: Draft (API)-OMS
Team Email: aiapi@microsoft.com
Resource Endpoints: 
   * https://internal.api.aimon.applicationinsights.io/
   * https://internal.api.applicationinsights.io/
   * https://internal.api.applicationinsights.io/
   * https://internal.api.applicationinsights.io/

---
##Resource Type: components/events
ICM Service: Azure Log Analytics
ICM Team: Draft (API)-OMS
Team Email: aiapi@microsoft.com
Resource Endpoints: 
   * https://internal.api.applicationinsights.io/
   * https://internal.api.aimon.applicationinsights.io/

---
##Resource Type: components/syntheticmonitorlocations
ICM Service: Application Insights
ICM Team: Availability Tests
Team Email: GenevaSynthetics@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: components/analyticsItems
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: components/webtests
ICM Service: Application Insights
ICM Team: Availability Tests
Team Email: GenevaSynthetics@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: components/workItemConfigs
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: components/myFavorites
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: components/operations
ICM Service: Azure Log Analytics
ICM Team: Draft (API)-OMS
Team Email: aiapi@microsoft.com
Resource Endpoints: 
   * https://internal.api.aimon.applicationinsights.io/
   * https://internal.api.applicationinsights.io/
   * https://internal.api.applicationinsights.io/
   * https://internal.api.applicationinsights.io/
   * https://internal.api.applicationinsights.io/

---
##Resource Type: components/exportConfiguration
ICM Service: Application Insights
ICM Team: Continuous Export
Team Email: aiexport@microsoft.com
Resource Endpoints: 
   * https://export.aimon.applicationinsights.io/
   * https://export.applicationinsights.io/
   * https://export.applicationinsights.io/
   * https://export.applicationinsights.io/
   * https://export.applicationinsights.io/
   * https://export.applicationinsights.io/
   * https://export.applicationinsights.io/
   * https://export.applicationinsights.io/
   * https://export.applicationinsights.io/
   * https://export.applicationinsights.io/
   * https://export.applicationinsights.io/
   * https://export.applicationinsights.io/
   * https://export.applicationinsights.io/
   * https://export.applicationinsights.io/
   * https://export.applicationinsights.io/
   * https://export.applicationinsights.io/

---
##Resource Type: components/purge
ICM Service: Azure Log Analytics
ICM Team: Draft (API)-OMS
Team Email: aiapi@microsoft.com
Resource Endpoints: 
   * https://internal.api.aimon.applicationinsights.io/
   * https://internal.api.applicationinsights.io/
   * https://internal.api.applicationinsights.io/
   * https://internal.api.applicationinsights.io/
   * https://internal.api.applicationinsights.io/

---
##Resource Type: components/api
ICM Service: Azure Log Analytics
ICM Team: Draft (API)-OMS
Team Email: aiapi@microsoft.com
Resource Endpoints: 
   * https://internal.api.aimon.applicationinsights.io/
   * https://internal.api.applicationinsights.io/
   * https://internal.api.applicationinsights.io/
   * https://internal.api.applicationinsights.io/
   * https://internal.api.applicationinsights.io/

---
##Resource Type: components/aggregate
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: components/metricDefinitions
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: components/extendQueries
ICM Service: Azure Log Analytics
ICM Team: Draft (API)-OMS
Team Email: aiapi@microsoft.com
Resource Endpoints: 
   * https://internal.api.aimon.applicationinsights.io/
   * https://internal.api.applicationinsights.io/
   * https://internal.api.applicationinsights.io/
   * https://internal.api.applicationinsights.io/
   * https://internal.api.applicationinsights.io/

---
##Resource Type: components/apiKeys
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: components/myAnalyticsItems
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: components/favorites
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: components/defaultWorkItemConfig
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: components/annotations
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: components/proactiveDetectionConfigs
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: components/move
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: components/currentBillingFeatures
ICM Service: Application Insights
ICM Team: Azure Monitor Billing (Application Insights)
Team Email: aialm@microsoft.com
Resource Endpoints: 
   * https://billing.aimon.applicationinsights.io/locations/westcentralus/
   * https://billing.applicationinsights.io/locations/eastus/
   * https://billing.applicationinsights.io/locations/southcentralus/
   * https://billing.applicationinsights.io/locations/northeurope/
   * https://billing.applicationinsights.io/locations/westeurope/
   * https://billing.applicationinsights.io/locations/southeastasia/
   * https://billing.applicationinsights.io/locations/westus2/
   * https://billing.applicationinsights.io/locations/uksouth/
   * https://billing.applicationinsights.io/locations/canadacentral/
   * https://billing.applicationinsights.io/locations/centralindia/
   * https://billing.applicationinsights.io/locations/japaneast/
   * https://billing.applicationinsights.io/locations/australiaeast/
   * https://billing.applicationinsights.io/locations/koreacentral/
   * https://billing.applicationinsights.io/locations/francecentral/
   * https://billing.applicationinsights.io/locations/centralus/
   * https://billing.applicationinsights.io/locations/eastus2/
   * https://billing.applicationinsights.io/locations/eastasia/
   * https://billing.applicationinsights.io/locations/westus/
   * https://billing.applicationinsights.io/locations/southafricanorth/
   * https://billing.applicationinsights.io/locations/northcentralus/
   * https://billing.applicationinsights.io/locations/brazilsouth/
   * https://billing.applicationinsights.io/locations/switzerlandnorth/
   * https://billing.applicationinsights.io/locations/norwayeast/
   * https://billing.applicationinsights.io/locations/norwaywest/
   * https://billing.applicationinsights.io/locations/australiasoutheast/
   * https://billing.applicationinsights.io/locations/australiacentral2/
   * https://billing.applicationinsights.io/locations/germanywestcentral/
   * https://billing.applicationinsights.io/locations/switzerlandwest/
   * https://billing.applicationinsights.io/locations/uaecentral/
   * https://billing.applicationinsights.io/locations/ukwest/
   * https://billing.applicationinsights.io/locations/japanwest/
   * https://billing.applicationinsights.io/locations/brazilsoutheast/
   * https://billing.applicationinsights.io/locations/uaenorth/
   * https://billing.applicationinsights.io/locations/australiacentral/
   * https://billing.applicationinsights.io/locations/francesouth/
   * https://billing.applicationinsights.io/locations/southindia/
   * https://billing.applicationinsights.io/locations/westcentralus/
   * https://billing.applicationinsights.io/locations/eastus2euap/
   * https://billing.applicationinsights.io/locations/westus3/
   * https://billing.applicationinsights.io/locations/koreasouth/
   * https://billing.applicationinsights.io/locations/swedencentral/
   * https://billing.applicationinsights.io/locations/swedensouth/
   * https://billing.applicationinsights.io/locations/canadaeast/
   * https://billing.applicationinsights.io/locations/jioindiacentral/
   * https://billing.applicationinsights.io/locations/jioindiawest/
   * https://billing.applicationinsights.io/locations/qatarcentral/
   * https://billing.applicationinsights.io/locations/southafricawest/
   * https://billing.applicationinsights.io/locations/centraluseuap/
   * https://billing.applicationinsights.io/locations/germanynorth/
   * https://billing.applicationinsights.io/locations/polandcentral/
   * https://billing.applicationinsights.io/locations/israelcentral/
   * https://billing.applicationinsights.io/locations/israelnorthwest/
   * https://billing.applicationinsights.io/locations/italynorth/
   * https://billing.applicationinsights.io/locations/malaysiasouth/
   * https://billing.applicationinsights.io/locations/mexicocentral/
   * https://billing.applicationinsights.io/locations/taiwannorth/
   * https://billing.applicationinsights.io/locations/taiwannorthwest/

---
##Resource Type: components/quotaStatus
ICM Service: Application Insights
ICM Team: Azure Monitor Billing (Application Insights)
Team Email: aialm@microsoft.com
Resource Endpoints: 
   * https://billing.aimon.applicationinsights.io/locations/westcentralus/
   * https://billing.applicationinsights.io/locations/eastus/
   * https://billing.applicationinsights.io/locations/southcentralus/
   * https://billing.applicationinsights.io/locations/northeurope/
   * https://billing.applicationinsights.io/locations/westeurope/
   * https://billing.applicationinsights.io/locations/southeastasia/
   * https://billing.applicationinsights.io/locations/westus2/
   * https://billing.applicationinsights.io/locations/uksouth/
   * https://billing.applicationinsights.io/locations/canadacentral/
   * https://billing.applicationinsights.io/locations/centralindia/
   * https://billing.applicationinsights.io/locations/japaneast/
   * https://billing.applicationinsights.io/locations/australiaeast/
   * https://billing.applicationinsights.io/locations/koreacentral/
   * https://billing.applicationinsights.io/locations/francecentral/
   * https://billing.applicationinsights.io/locations/centralus/
   * https://billing.applicationinsights.io/locations/eastus2/
   * https://billing.applicationinsights.io/locations/eastasia/
   * https://billing.applicationinsights.io/locations/westus/
   * https://billing.applicationinsights.io/locations/southafricanorth/
   * https://billing.applicationinsights.io/locations/northcentralus/
   * https://billing.applicationinsights.io/locations/brazilsouth/
   * https://billing.applicationinsights.io/locations/switzerlandnorth/
   * https://billing.applicationinsights.io/locations/norwayeast/
   * https://billing.applicationinsights.io/locations/norwaywest/
   * https://billing.applicationinsights.io/locations/australiasoutheast/
   * https://billing.applicationinsights.io/locations/australiacentral2/
   * https://billing.applicationinsights.io/locations/germanywestcentral/
   * https://billing.applicationinsights.io/locations/switzerlandwest/
   * https://billing.applicationinsights.io/locations/uaecentral/
   * https://billing.applicationinsights.io/locations/ukwest/
   * https://billing.applicationinsights.io/locations/japanwest/
   * https://billing.applicationinsights.io/locations/brazilsoutheast/
   * https://billing.applicationinsights.io/locations/uaenorth/
   * https://billing.applicationinsights.io/locations/australiacentral/
   * https://billing.applicationinsights.io/locations/francesouth/
   * https://billing.applicationinsights.io/locations/southindia/
   * https://billing.applicationinsights.io/locations/westcentralus/
   * https://billing.applicationinsights.io/locations/eastus2euap/
   * https://billing.applicationinsights.io/locations/westus3/
   * https://billing.applicationinsights.io/locations/koreasouth/
   * https://billing.applicationinsights.io/locations/swedencentral/
   * https://billing.applicationinsights.io/locations/swedensouth/
   * https://billing.applicationinsights.io/locations/canadaeast/
   * https://billing.applicationinsights.io/locations/jioindiacentral/
   * https://billing.applicationinsights.io/locations/jioindiawest/
   * https://billing.applicationinsights.io/locations/qatarcentral/
   * https://billing.applicationinsights.io/locations/southafricawest/
   * https://billing.applicationinsights.io/locations/centraluseuap/
   * https://billing.applicationinsights.io/locations/germanynorth/
   * https://billing.applicationinsights.io/locations/polandcentral/
   * https://billing.applicationinsights.io/locations/israelcentral/
   * https://billing.applicationinsights.io/locations/israelnorthwest/
   * https://billing.applicationinsights.io/locations/italynorth/
   * https://billing.applicationinsights.io/locations/malaysiasouth/
   * https://billing.applicationinsights.io/locations/mexicocentral/
   * https://billing.applicationinsights.io/locations/taiwannorth/
   * https://billing.applicationinsights.io/locations/taiwannorthwest/

---
##Resource Type: components/featureCapabilities
ICM Service: Application Insights
ICM Team: Azure Monitor Billing (Application Insights)
Team Email: aialm@microsoft.com
Resource Endpoints: 
   * https://billing.aimon.applicationinsights.io/locations/westcentralus/
   * https://billing.applicationinsights.io/locations/eastus/
   * https://billing.applicationinsights.io/locations/southcentralus/
   * https://billing.applicationinsights.io/locations/northeurope/
   * https://billing.applicationinsights.io/locations/westeurope/
   * https://billing.applicationinsights.io/locations/southeastasia/
   * https://billing.applicationinsights.io/locations/westus2/
   * https://billing.applicationinsights.io/locations/uksouth/
   * https://billing.applicationinsights.io/locations/canadacentral/
   * https://billing.applicationinsights.io/locations/centralindia/
   * https://billing.applicationinsights.io/locations/japaneast/
   * https://billing.applicationinsights.io/locations/australiaeast/
   * https://billing.applicationinsights.io/locations/koreacentral/
   * https://billing.applicationinsights.io/locations/francecentral/
   * https://billing.applicationinsights.io/locations/centralus/
   * https://billing.applicationinsights.io/locations/eastus2/
   * https://billing.applicationinsights.io/locations/eastasia/
   * https://billing.applicationinsights.io/locations/westus/
   * https://billing.applicationinsights.io/locations/southafricanorth/
   * https://billing.applicationinsights.io/locations/northcentralus/
   * https://billing.applicationinsights.io/locations/brazilsouth/
   * https://billing.applicationinsights.io/locations/switzerlandnorth/
   * https://billing.applicationinsights.io/locations/norwayeast/
   * https://billing.applicationinsights.io/locations/norwaywest/
   * https://billing.applicationinsights.io/locations/australiasoutheast/
   * https://billing.applicationinsights.io/locations/australiacentral2/
   * https://billing.applicationinsights.io/locations/germanywestcentral/
   * https://billing.applicationinsights.io/locations/switzerlandwest/
   * https://billing.applicationinsights.io/locations/uaecentral/
   * https://billing.applicationinsights.io/locations/ukwest/
   * https://billing.applicationinsights.io/locations/japanwest/
   * https://billing.applicationinsights.io/locations/brazilsoutheast/
   * https://billing.applicationinsights.io/locations/uaenorth/
   * https://billing.applicationinsights.io/locations/australiacentral/
   * https://billing.applicationinsights.io/locations/francesouth/
   * https://billing.applicationinsights.io/locations/southindia/
   * https://billing.applicationinsights.io/locations/westcentralus/
   * https://billing.applicationinsights.io/locations/eastus2euap/
   * https://billing.applicationinsights.io/locations/westus3/
   * https://billing.applicationinsights.io/locations/koreasouth/
   * https://billing.applicationinsights.io/locations/swedencentral/
   * https://billing.applicationinsights.io/locations/swedensouth/
   * https://billing.applicationinsights.io/locations/canadaeast/
   * https://billing.applicationinsights.io/locations/jioindiacentral/
   * https://billing.applicationinsights.io/locations/jioindiawest/
   * https://billing.applicationinsights.io/locations/qatarcentral/
   * https://billing.applicationinsights.io/locations/southafricawest/
   * https://billing.applicationinsights.io/locations/centraluseuap/
   * https://billing.applicationinsights.io/locations/germanynorth/
   * https://billing.applicationinsights.io/locations/polandcentral/
   * https://billing.applicationinsights.io/locations/israelcentral/
   * https://billing.applicationinsights.io/locations/israelnorthwest/
   * https://billing.applicationinsights.io/locations/italynorth/
   * https://billing.applicationinsights.io/locations/malaysiasouth/
   * https://billing.applicationinsights.io/locations/mexicocentral/
   * https://billing.applicationinsights.io/locations/taiwannorth/
   * https://billing.applicationinsights.io/locations/taiwannorthwest/

---
##Resource Type: components/getAvailableBillingFeatures
ICM Service: Application Insights
ICM Team: Azure Monitor Billing (Application Insights)
Team Email: aialm@microsoft.com
Resource Endpoints: 
   * https://billing.aimon.applicationinsights.io/locations/westcentralus/
   * https://billing.applicationinsights.io/locations/eastus/
   * https://billing.applicationinsights.io/locations/southcentralus/
   * https://billing.applicationinsights.io/locations/northeurope/
   * https://billing.applicationinsights.io/locations/westeurope/
   * https://billing.applicationinsights.io/locations/southeastasia/
   * https://billing.applicationinsights.io/locations/westus2/
   * https://billing.applicationinsights.io/locations/uksouth/
   * https://billing.applicationinsights.io/locations/canadacentral/
   * https://billing.applicationinsights.io/locations/centralindia/
   * https://billing.applicationinsights.io/locations/japaneast/
   * https://billing.applicationinsights.io/locations/australiaeast/
   * https://billing.applicationinsights.io/locations/koreacentral/
   * https://billing.applicationinsights.io/locations/francecentral/
   * https://billing.applicationinsights.io/locations/centralus/
   * https://billing.applicationinsights.io/locations/eastus2/
   * https://billing.applicationinsights.io/locations/eastasia/
   * https://billing.applicationinsights.io/locations/westus/
   * https://billing.applicationinsights.io/locations/southafricanorth/
   * https://billing.applicationinsights.io/locations/northcentralus/
   * https://billing.applicationinsights.io/locations/brazilsouth/
   * https://billing.applicationinsights.io/locations/switzerlandnorth/
   * https://billing.applicationinsights.io/locations/norwayeast/
   * https://billing.applicationinsights.io/locations/norwaywest/
   * https://billing.applicationinsights.io/locations/australiasoutheast/
   * https://billing.applicationinsights.io/locations/australiacentral2/
   * https://billing.applicationinsights.io/locations/germanywestcentral/
   * https://billing.applicationinsights.io/locations/switzerlandwest/
   * https://billing.applicationinsights.io/locations/uaecentral/
   * https://billing.applicationinsights.io/locations/ukwest/
   * https://billing.applicationinsights.io/locations/japanwest/
   * https://billing.applicationinsights.io/locations/brazilsoutheast/
   * https://billing.applicationinsights.io/locations/uaenorth/
   * https://billing.applicationinsights.io/locations/australiacentral/
   * https://billing.applicationinsights.io/locations/francesouth/
   * https://billing.applicationinsights.io/locations/southindia/
   * https://billing.applicationinsights.io/locations/westcentralus/
   * https://billing.applicationinsights.io/locations/eastus2euap/
   * https://billing.applicationinsights.io/locations/westus3/
   * https://billing.applicationinsights.io/locations/koreasouth/
   * https://billing.applicationinsights.io/locations/swedencentral/
   * https://billing.applicationinsights.io/locations/swedensouth/
   * https://billing.applicationinsights.io/locations/canadaeast/
   * https://billing.applicationinsights.io/locations/jioindiacentral/
   * https://billing.applicationinsights.io/locations/jioindiawest/
   * https://billing.applicationinsights.io/locations/qatarcentral/
   * https://billing.applicationinsights.io/locations/southafricawest/
   * https://billing.applicationinsights.io/locations/centraluseuap/
   * https://billing.applicationinsights.io/locations/germanynorth/
   * https://billing.applicationinsights.io/locations/polandcentral/
   * https://billing.applicationinsights.io/locations/israelcentral/
   * https://billing.applicationinsights.io/locations/israelnorthwest/
   * https://billing.applicationinsights.io/locations/italynorth/
   * https://billing.applicationinsights.io/locations/malaysiasouth/
   * https://billing.applicationinsights.io/locations/mexicocentral/
   * https://billing.applicationinsights.io/locations/taiwannorth/
   * https://billing.applicationinsights.io/locations/taiwannorthwest/

---
##Resource Type: webtests
ICM Service: Application Insights
ICM Team: Availability Tests
Team Email: GenevaSynthetics@microsoft.com
Resource Endpoints: 
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/
   * https://westcentralus.cds.monitor.azure.com/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: webtests/getTestResultFile
ICM Service: Application Insights
ICM Team: Availability Tests
Team Email: GenevaSynthetics@microsoft.com
Resource Endpoints: 
   * https://aimon.gsm.applicationinsights.io/
   * https://prod.gsm.applicationinsights.io/

---
##Resource Type: scheduledqueryrules
ICM Service: Azure Log Search Alerts
ICM Team: Log Search Alerts (Scheduled Query Rules) On Call
Team Email: lsateam@microsoft.com
Resource Endpoints: 
   * https://wcus.prod.sqr.trafficmanager.net
   * https://prod.sqr.trafficmanager.net
   * https://lsa-northcentralus-pgms.alertsrp.pgms.trafficmanager.net
   * https://lsa-westeurope-pgms.alertsrp.pgms.trafficmanager.net
   * https://lsa-northeurope-pgms.alertsrp.pgms.trafficmanager.net
   * https://lsa-eastus2euap-prod.alertsrp.trafficmanager.net
   * https://lsa-westcentralus-prod.alertsrp.trafficmanager.net

---
##Resource Type: scheduledqueryrules/networkSecurityPerimeterAssociationProxies
ICM Service: Azure Monitor Control Service (AMCS)
ICM Team: Triage
Team Email: amcsdev@microsoft.com
Resource Endpoints: 
   * https://eastus2euap.reto.canary.control.monitor.azure.com/
   * https://eastus2euap.reto.canary.control.monitor.azure.com/
   * https://northcentralus.reto.control.monitor.azure.com/

---
##Resource Type: scheduledqueryrules/networkSecurityPerimeterConfigurations
ICM Service: Azure Monitor Control Service (AMCS)
ICM Team: Triage
Team Email: amcsdev@microsoft.com
Resource Endpoints: 
   * https://eastus2euap.reto.canary.control.monitor.azure.com/
   * https://eastus2euap.reto.canary.control.monitor.azure.com/
   * https://northcentralus.reto.control.monitor.azure.com/

---
##Resource Type: components/pricingPlans
ICM Service: Application Insights
ICM Team: Azure Monitor Billing (Application Insights)
Team Email: aialm@microsoft.com
Resource Endpoints: 
   * https://billing.aimon.applicationinsights.io/locations/westcentralus/
   * https://billing.applicationinsights.io/locations/eastus/
   * https://billing.applicationinsights.io/locations/southcentralus/
   * https://billing.applicationinsights.io/locations/northeurope/
   * https://billing.applicationinsights.io/locations/westeurope/
   * https://billing.applicationinsights.io/locations/southeastasia/
   * https://billing.applicationinsights.io/locations/westus2/
   * https://billing.applicationinsights.io/locations/uksouth/
   * https://billing.applicationinsights.io/locations/canadacentral/
   * https://billing.applicationinsights.io/locations/centralindia/
   * https://billing.applicationinsights.io/locations/japaneast/
   * https://billing.applicationinsights.io/locations/australiaeast/
   * https://billing.applicationinsights.io/locations/koreacentral/
   * https://billing.applicationinsights.io/locations/francecentral/
   * https://billing.applicationinsights.io/locations/centralus/
   * https://billing.applicationinsights.io/locations/eastus2/
   * https://billing.applicationinsights.io/locations/eastasia/
   * https://billing.applicationinsights.io/locations/westus/
   * https://billing.applicationinsights.io/locations/southafricanorth/
   * https://billing.applicationinsights.io/locations/northcentralus/
   * https://billing.applicationinsights.io/locations/brazilsouth/
   * https://billing.applicationinsights.io/locations/switzerlandnorth/
   * https://billing.applicationinsights.io/locations/norwayeast/
   * https://billing.applicationinsights.io/locations/norwaywest/
   * https://billing.applicationinsights.io/locations/australiasoutheast/
   * https://billing.applicationinsights.io/locations/australiacentral2/
   * https://billing.applicationinsights.io/locations/germanywestcentral/
   * https://billing.applicationinsights.io/locations/switzerlandwest/
   * https://billing.applicationinsights.io/locations/uaecentral/
   * https://billing.applicationinsights.io/locations/ukwest/
   * https://billing.applicationinsights.io/locations/japanwest/
   * https://billing.applicationinsights.io/locations/brazilsoutheast/
   * https://billing.applicationinsights.io/locations/uaenorth/
   * https://billing.applicationinsights.io/locations/australiacentral/
   * https://billing.applicationinsights.io/locations/francesouth/
   * https://billing.applicationinsights.io/locations/southindia/
   * https://billing.applicationinsights.io/locations/westcentralus/
   * https://billing.applicationinsights.io/locations/eastus2euap/
   * https://billing.applicationinsights.io/locations/westus3/
   * https://billing.applicationinsights.io/locations/koreasouth/
   * https://billing.applicationinsights.io/locations/swedencentral/
   * https://billing.applicationinsights.io/locations/swedensouth/
   * https://billing.applicationinsights.io/locations/canadaeast/
   * https://billing.applicationinsights.io/locations/jioindiacentral/
   * https://billing.applicationinsights.io/locations/jioindiawest/
   * https://billing.applicationinsights.io/locations/qatarcentral/
   * https://billing.applicationinsights.io/locations/southafricawest/
   * https://billing.applicationinsights.io/locations/centraluseuap/
   * https://billing.applicationinsights.io/locations/germanynorth/
   * https://billing.applicationinsights.io/locations/polandcentral/
   * https://billing.applicationinsights.io/locations/israelcentral/
   * https://billing.applicationinsights.io/locations/israelnorthwest/
   * https://billing.applicationinsights.io/locations/italynorth/
   * https://billing.applicationinsights.io/locations/malaysiasouth/
   * https://billing.applicationinsights.io/locations/mexicocentral/
   * https://billing.applicationinsights.io/locations/taiwannorth/
   * https://billing.applicationinsights.io/locations/taiwannorthwest/

---
##Resource Type: migrateToNewPricingModel
ICM Service: Application Insights
ICM Team: Azure Monitor Billing (Application Insights)
Team Email: aialm@microsoft.com
Resource Endpoints: 
   * https://billing.applicationinsights.io/
   * https://billing.aimon.applicationinsights.io/

---
##Resource Type: rollbackToLegacyPricingModel
ICM Service: Application Insights
ICM Team: Azure Monitor Billing (Application Insights)
Team Email: aialm@microsoft.com
Resource Endpoints: 
   * https://billing.applicationinsights.io/
   * https://billing.aimon.applicationinsights.io/

---
##Resource Type: listMigrationdate
ICM Service: Application Insights
ICM Team: Azure Monitor Billing (Application Insights)
Team Email: aialm@microsoft.com
Resource Endpoints: 
   * https://billing.applicationinsights.io/
   * https://billing.aimon.applicationinsights.io/

---
##Resource Type: logprofiles
ICM Service: Azure Monitor Essentials
ICM Team: Sev 1 and 2
Team Email: auxmonhot@microsoft.com
Resource Endpoints: 
   * https://westus.monitoring.dev.windows.azure.net
   * https://global.monitoring.prod.windows.azure.net

---
##Resource Type: migratealertrules
ICM Service: Azure Metric Alerts
ICM Team: LSI
Team Email: gautamdedir@microsoft.com
Resource Endpoints: 
   * https://ama-test.alertsrp.trafficmanager.net
   * https://ama-prod.alertsrp.trafficmanager.net

---
##Resource Type: metricalerts
ICM Service: Azure Metric Alerts
ICM Team: LSI
Team Email: azuremetricalerts@microsoft.com
Resource Endpoints: 
   * https://ama-test.alertsrp.trafficmanager.net
   * https://ama-prod.alertsrp.trafficmanager.net
   * https://ama-pgms.alertsrp.pgms.trafficmanager.net
   * https://ama-northcentralus-pgms.alertsrp.pgms.trafficmanager.net
   * https://ama-test.alertsrp.trafficmanager.net
   * https://ama-eastus2euap-prod.alertsrp.trafficmanager.net
   * https://ama-prod.alertsrp.trafficmanager.net
   * https://ama-westeurope-prod.alertsrp.trafficmanager.net
   * https://ama-northeurope-prod.alertsrp.trafficmanager.net
   * https://ama-swedencentral-prod.alertsrp.trafficmanager.net
   * https://ama-germanywestcentral-prod.alertsrp.trafficmanager.net

---
##Resource Type: alertrules
ICM Service: Azure Metric Alerts
ICM Team: LSI
Team Email: auxmonhot@microsoft.com
Resource Endpoints: 
   * https://westus.monitoring.dev.windows.azure.net
   * https://eastus.monitoring.dev.windows.azure.net
   * https://westus.monitoring.prod.windows.azure.net
   * https://eastus.monitoring.prod.windows.azure.net
   * https://northeurope.monitoring.prod.windows.azure.net
   * https://westeurope.monitoring.prod.windows.azure.net
   * https://eastasia.monitoring.prod.windows.azure.net
   * https://southeastasia.monitoring.prod.windows.azure.net
   * https://japaneast.monitoring.prod.windows.azure.net
   * https://japanwest.monitoring.prod.windows.azure.net
   * https://northcentralus.monitoring.prod.windows.azure.net
   * https://southcentralus.monitoring.prod.windows.azure.net
   * https://eastus2.monitoring.prod.windows.azure.net
   * https://centralus.monitoring.prod.windows.azure.net
   * https://australiaeast.monitoring.prod.windows.azure.net
   * https://australiasoutheast.monitoring.prod.windows.azure.net
   * https://brazilsouth.monitoring.prod.windows.azure.net
   * https://uksouth.monitoring.prod.windows.azure.net
   * https://ukwest.monitoring.prod.windows.azure.net
   * https://southindia.monitoring.prod.windows.azure.net
   * https://centralindia.monitoring.prod.windows.azure.net
   * https://westindia.monitoring.prod.windows.azure.net
   * https://canadaeast.monitoring.prod.windows.azure.net
   * https://canadacentral.monitoring.prod.windows.azure.net
   * https://westcentralus.monitoring.prod.windows.azure.net
   * https://westus2.monitoring.prod.windows.azure.net
   * https://koreasouth.monitoring.prod.windows.azure.net
   * https://koreacentral.monitoring.prod.windows.azure.net
   * https://australiacentral.monitoring.prod.windows.azure.net
   * https://australiacentral2.monitoring.prod.windows.azure.net
   * https://francecentral.monitoring.prod.windows.azure.net
   * https://francesouth.monitoring.prod.windows.azure.net
   * https://westus.monitoring.dev.windows.azure.net
   * https://eastus.monitoring.dev.windows.azure.net
   * https://westus.monitoring.prod.windows.azure.net
   * https://eastus.monitoring.prod.windows.azure.net
   * https://northeurope.monitoring.prod.windows.azure.net
   * https://westeurope.monitoring.prod.windows.azure.net
   * https://eastasia.monitoring.prod.windows.azure.net
   * https://southeastasia.monitoring.prod.windows.azure.net
   * https://japaneast.monitoring.prod.windows.azure.net
   * https://japanwest.monitoring.prod.windows.azure.net
   * https://northcentralus.monitoring.prod.windows.azure.net
   * https://southcentralus.monitoring.prod.windows.azure.net
   * https://eastus2.monitoring.prod.windows.azure.net
   * https://centralus.monitoring.prod.windows.azure.net
   * https://australiaeast.monitoring.prod.windows.azure.net
   * https://australiasoutheast.monitoring.prod.windows.azure.net
   * https://brazilsouth.monitoring.prod.windows.azure.net
   * https://uksouth.monitoring.prod.windows.azure.net
   * https://ukwest.monitoring.prod.windows.azure.net
   * https://southindia.monitoring.prod.windows.azure.net
   * https://centralindia.monitoring.prod.windows.azure.net
   * https://westindia.monitoring.prod.windows.azure.net
   * https://canadaeast.monitoring.prod.windows.azure.net
   * https://canadacentral.monitoring.prod.windows.azure.net
   * https://westcentralus.monitoring.prod.windows.azure.net
   * https://westus2.monitoring.prod.windows.azure.net
   * https://koreasouth.monitoring.prod.windows.azure.net
   * https://koreacentral.monitoring.prod.windows.azure.net
   * https://australiacentral.monitoring.prod.windows.azure.net
   * https://australiacentral2.monitoring.prod.windows.azure.net
   * https://francecentral.monitoring.prod.windows.azure.net
   * https://francesouth.monitoring.prod.windows.azure.net
   * https://westus.monitoring.dev.windows.azure.net
   * https://eastus.monitoring.dev.windows.azure.net
   * https://westus.monitoring.prod.windows.azure.net
   * https://eastus.monitoring.prod.windows.azure.net
   * https://northeurope.monitoring.prod.windows.azure.net
   * https://westeurope.monitoring.prod.windows.azure.net
   * https://eastasia.monitoring.prod.windows.azure.net
   * https://southeastasia.monitoring.prod.windows.azure.net
   * https://japaneast.monitoring.prod.windows.azure.net
   * https://japanwest.monitoring.prod.windows.azure.net
   * https://northcentralus.monitoring.prod.windows.azure.net
   * https://southcentralus.monitoring.prod.windows.azure.net
   * https://eastus2.monitoring.prod.windows.azure.net
   * https://centralus.monitoring.prod.windows.azure.net
   * https://australiaeast.monitoring.prod.windows.azure.net
   * https://australiasoutheast.monitoring.prod.windows.azure.net
   * https://brazilsouth.monitoring.prod.windows.azure.net
   * https://uksouth.monitoring.prod.windows.azure.net
   * https://ukwest.monitoring.prod.windows.azure.net
   * https://southindia.monitoring.prod.windows.azure.net
   * https://centralindia.monitoring.prod.windows.azure.net
   * https://westindia.monitoring.prod.windows.azure.net
   * https://canadaeast.monitoring.prod.windows.azure.net
   * https://canadacentral.monitoring.prod.windows.azure.net
   * https://westcentralus.monitoring.prod.windows.azure.net
   * https://westus2.monitoring.prod.windows.azure.net
   * https://koreasouth.monitoring.prod.windows.azure.net
   * https://koreacentral.monitoring.prod.windows.azure.net
   * https://australiacentral.monitoring.prod.windows.azure.net
   * https://australiacentral2.monitoring.prod.windows.azure.net
   * https://eastus2euap.monitoring.prod.windows.azure.net
   * https://centraluseuap.monitoring.prod.windows.azure.net
   * https://francecentral.monitoring.prod.windows.azure.net
   * https://francesouth.monitoring.prod.windows.azure.net
   * https://southafricanorth.monitoring.prod.windows.azure.net
   * https://southafricawest.monitoring.prod.windows.azure.net
   * https://uaecentral.monitoring.prod.windows.azure.net
   * https://uaenorth.monitoring.prod.windows.azure.net

---
##Resource Type: autoscalesettings
ICM Service: Azure Monitor Essentials
ICM Team: Sev 1 and 2
Team Email: auxmonhot@microsoft.com
Resource Endpoints: 
   * https://westus.monitoring.dev.windows.azure.net
   * https://eastus.monitoring.dev.windows.azure.net
   * https://westus.monitoring.prod.windows.azure.net
   * https://eastus.monitoring.prod.windows.azure.net
   * https://northeurope.monitoring.prod.windows.azure.net
   * https://southcentralus.monitoring.prod.windows.azure.net
   * https://eastus2.monitoring.prod.windows.azure.net
   * https://centralus.monitoring.prod.windows.azure.net
   * https://australiasoutheast.monitoring.prod.windows.azure.net
   * https://brazilsouth.monitoring.prod.windows.azure.net
   * https://uksouth.monitoring.prod.windows.azure.net
   * https://ukwest.monitoring.prod.windows.azure.net
   * https://southindia.monitoring.prod.windows.azure.net
   * https://centralindia.monitoring.prod.windows.azure.net
   * https://westindia.monitoring.prod.windows.azure.net
   * https://canadaeast.monitoring.prod.windows.azure.net
   * https://canadacentral.monitoring.prod.windows.azure.net
   * https://westcentralus.monitoring.prod.windows.azure.net
   * https://westus2.monitoring.prod.windows.azure.net
   * https://koreasouth.monitoring.prod.windows.azure.net
   * https://koreacentral.monitoring.prod.windows.azure.net
   * https://australiacentral.monitoring.prod.windows.azure.net
   * https://australiacentral2.monitoring.prod.windows.azure.net
   * https://francecentral.monitoring.prod.windows.azure.net
   * https://francesouth.monitoring.prod.windows.azure.net
   * https://westeurope.monitoring.prod.windows.azure.net
   * https://eastasia.monitoring.prod.windows.azure.net
   * https://southeastasia.monitoring.prod.windows.azure.net
   * https://japaneast.monitoring.prod.windows.azure.net
   * https://japanwest.monitoring.prod.windows.azure.net
   * https://northcentralus.monitoring.prod.windows.azure.net
   * https://australiaeast.monitoring.prod.windows.azure.net
   * https://eastus2euap.monitoring.prod.windows.azure.net
   * https://centraluseuap.monitoring.prod.windows.azure.net
   * https://southafricanorth.monitoring.prod.windows.azure.net
   * https://southafricawest.monitoring.prod.windows.azure.net
   * https://uaecentral.monitoring.prod.windows.azure.net
   * https://uaenorth.monitoring.prod.windows.azure.net
   * https://switzerlandnorth.monitoring.prod.windows.azure.net
   * https://switzerlandwest.monitoring.prod.windows.azure.net
   * https://germanynorth.monitoring.prod.windows.azure.net
   * https://germanywestcentral.monitoring.prod.windows.azure.net
   * https://norwayeast.monitoring.prod.windows.azure.net
   * https://norwaywest.monitoring.prod.windows.azure.net
   * https://brazilsoutheast.monitoring.prod.windows.azure.net
   * https://westus3.monitoring.prod.windows.azure.net
   * https://jioindiawest.monitoring.prod.windows.azure.net
   * https://jioindiacentral.monitoring.prod.windows.azure.net
   * https://swedensouth.monitoring.prod.windows.azure.net
   * https://swedencentral.monitoring.prod.windows.azure.net
   * https://qatarcentral.monitoring.prod.windows.azure.net
   * https://polandcentral.monitoring.prod.windows.azure.net

---
##Resource Type: eventtypes
ICM Service: Azure Monitor Essentials
ICM Team: Sev 1 and 2
Team Email: auxmonhot@microsoft.com
Resource Endpoints: 
   * https://event.prod.csm.windows.azure.net:444/
   * https://event.prod.csm.windows.azure.net:444/
   * https://event.prod.csm.windows.azure.net:444/
   * https://event.prod.csm.windows.azure.net:444/
   * https://event.prod.csm.windows.azure.net:444/
   * https://japan.event.dev.csm.windows.azure.net:444/
   * https://eastus2euap.api.loganalytics.io/v1/activitylog/
   * https://api.loganalytics.azure.com/v1/activitylog/

---
##Resource Type: locations
ICM Service: Azure Monitor Essentials
ICM Team: Sev 1 and 2
Team Email: auxmonhot@microsoft.com
Resource Endpoints: 
   * https://eastus.monitoring.prod.windows.azure.net
   * https://eastus.monitoring.prod.windows.azure.net

---
##Resource Type: locations/operationResults
ICM Service: Azure Monitor Essentials
ICM Team: Sev 1 and 2
Team Email: auxmonhot@microsoft.com
Resource Endpoints: 
   * https://monitoring.prod.windows.azure.net
   * https://monitoring.prod.windows.azure.net

---
##Resource Type: vmInsightsOnboardingStatuses
ICM Service: Service Map and VM Insights
ICM Team: VMI UX and Agent
Team Email: depmone@microsoft.com
Resource Endpoints: 
   * https://servicemap-prod.trafficmanager.net/api/arm/

---
##Resource Type: operations
ICM Service: Azure Monitor Essentials
ICM Team: Sev 1 and 2
Team Email: auxmonhot@microsoft.com
Resource Endpoints: 
   * https://global.monitoring.prod.windows.azure.net
   * https://global.monitoring.prod.windows.azure.net
   * https://global.monitoring.prod.windows.azure.net

---
##Resource Type: diagnosticSettings
ICM Service: Azure Monitor Essentials
ICM Team: Sev 1 and 2
Team Email: auxmonhot@microsoft.com
Resource Endpoints: 
   * https://westus.monitoring.dev.windows.azure.net
   * https://eastus.monitoring.dev.windows.azure.net
   * https://eastus2euap.monitoring.dev.windows.azure.net
   * https://centraluseuap.monitoring.dev.windows.azure.net
   * https://westus.monitoring.prod.windows.azure.net
   * https://eastus.monitoring.prod.windows.azure.net
   * https://northeurope.monitoring.prod.windows.azure.net
   * https://westeurope.monitoring.prod.windows.azure.net
   * https://eastasia.monitoring.prod.windows.azure.net
   * https://southeastasia.monitoring.prod.windows.azure.net
   * https://japaneast.monitoring.prod.windows.azure.net
   * https://japanwest.monitoring.prod.windows.azure.net
   * https://northcentralus.monitoring.prod.windows.azure.net
   * https://southcentralus.monitoring.prod.windows.azure.net
   * https://eastus2.monitoring.prod.windows.azure.net
   * https://centralus.monitoring.prod.windows.azure.net
   * https://australiaeast.monitoring.prod.windows.azure.net
   * https://australiasoutheast.monitoring.prod.windows.azure.net
   * https://brazilsouth.monitoring.prod.windows.azure.net
   * https://uksouth.monitoring.prod.windows.azure.net
   * https://ukwest.monitoring.prod.windows.azure.net
   * https://southindia.monitoring.prod.windows.azure.net
   * https://centralindia.monitoring.prod.windows.azure.net
   * https://westindia.monitoring.prod.windows.azure.net
   * https://canadaeast.monitoring.prod.windows.azure.net
   * https://canadacentral.monitoring.prod.windows.azure.net
   * https://westcentralus.monitoring.prod.windows.azure.net
   * https://westus2.monitoring.prod.windows.azure.net
   * https://koreasouth.monitoring.prod.windows.azure.net
   * https://koreacentral.monitoring.prod.windows.azure.net
   * https://australiacentral.monitoring.prod.windows.azure.net
   * https://australiacentral2.monitoring.prod.windows.azure.net
   * https://eastus2euap.monitoring.prod.windows.azure.net
   * https://centraluseuap.monitoring.prod.windows.azure.net
   * https://francecentral.monitoring.prod.windows.azure.net
   * https://francesouth.monitoring.prod.windows.azure.net
   * https://global.monitoring.prod.windows.azure.net
   * https://southafricanorth.monitoring.prod.windows.azure.net
   * https://southafricawest.monitoring.prod.windows.azure.net
   * https://uaecentral.monitoring.prod.windows.azure.net
   * https://uaenorth.monitoring.prod.windows.azure.net
   * https://switzerlandnorth.monitoring.prod.windows.azure.net
   * https://switzerlandwest.monitoring.prod.windows.azure.net
   * https://germanynorth.monitoring.prod.windows.azure.net
   * https://germanywestcentral.monitoring.prod.windows.azure.net
   * https://norwayeast.monitoring.prod.windows.azure.net
   * https://norwaywest.monitoring.prod.windows.azure.net
   * https://brazilsoutheast.monitoring.prod.windows.azure.net
   * https://westus3.monitoring.prod.windows.azure.net
   * https://jioindiawest.monitoring.prod.windows.azure.net
   * https://jioindiacentral.monitoring.prod.windows.azure.net
   * https://swedensouth.monitoring.prod.windows.azure.net
   * https://swedencentral.monitoring.prod.windows.azure.net
   * https://qatarcentral.monitoring.prod.windows.azure.net
   * https://polandcentral.monitoring.prod.windows.azure.net

---
##Resource Type: diagnosticSettingsCategories
ICM Service: Azure Monitor Essentials
ICM Team: Sev 1 and 2
Team Email: auxmonhot@microsoft.com
Resource Endpoints: 
   * https://westus.monitoring.dev.windows.azure.net
   * https://eastus.monitoring.dev.windows.azure.net
   * https://eastus2euap.monitoring.dev.windows.azure.net
   * https://centraluseuap.monitoring.dev.windows.azure.net
   * https://westus.monitoring.prod.windows.azure.net
   * https://eastus.monitoring.prod.windows.azure.net
   * https://northeurope.monitoring.prod.windows.azure.net
   * https://westeurope.monitoring.prod.windows.azure.net
   * https://eastasia.monitoring.prod.windows.azure.net
   * https://southeastasia.monitoring.prod.windows.azure.net
   * https://japaneast.monitoring.prod.windows.azure.net
   * https://japanwest.monitoring.prod.windows.azure.net
   * https://northcentralus.monitoring.prod.windows.azure.net
   * https://southcentralus.monitoring.prod.windows.azure.net
   * https://eastus2.monitoring.prod.windows.azure.net
   * https://centralus.monitoring.prod.windows.azure.net
   * https://australiaeast.monitoring.prod.windows.azure.net
   * https://australiasoutheast.monitoring.prod.windows.azure.net
   * https://brazilsouth.monitoring.prod.windows.azure.net
   * https://uksouth.monitoring.prod.windows.azure.net
   * https://ukwest.monitoring.prod.windows.azure.net
   * https://southindia.monitoring.prod.windows.azure.net
   * https://centralindia.monitoring.prod.windows.azure.net
   * https://westindia.monitoring.prod.windows.azure.net
   * https://canadaeast.monitoring.prod.windows.azure.net
   * https://canadacentral.monitoring.prod.windows.azure.net
   * https://westcentralus.monitoring.prod.windows.azure.net
   * https://westus2.monitoring.prod.windows.azure.net
   * https://koreasouth.monitoring.prod.windows.azure.net
   * https://koreacentral.monitoring.prod.windows.azure.net
   * https://australiacentral.monitoring.prod.windows.azure.net
   * https://australiacentral2.monitoring.prod.windows.azure.net
   * https://eastus2euap.monitoring.prod.windows.azure.net
   * https://centraluseuap.monitoring.prod.windows.azure.net
   * https://francecentral.monitoring.prod.windows.azure.net
   * https://francesouth.monitoring.prod.windows.azure.net
   * https://global.monitoring.prod.windows.azure.net
   * https://southafricanorth.monitoring.prod.windows.azure.net
   * https://southafricawest.monitoring.prod.windows.azure.net
   * https://uaecentral.monitoring.prod.windows.azure.net
   * https://uaenorth.monitoring.prod.windows.azure.net
   * https://switzerlandnorth.monitoring.prod.windows.azure.net
   * https://switzerlandwest.monitoring.prod.windows.azure.net
   * https://germanynorth.monitoring.prod.windows.azure.net
   * https://germanywestcentral.monitoring.prod.windows.azure.net
   * https://norwayeast.monitoring.prod.windows.azure.net
   * https://norwaywest.monitoring.prod.windows.azure.net
   * https://brazilsoutheast.monitoring.prod.windows.azure.net
   * https://westus3.monitoring.prod.windows.azure.net
   * https://jioindiawest.monitoring.prod.windows.azure.net
   * https://jioindiacentral.monitoring.prod.windows.azure.net
   * https://swedensouth.monitoring.prod.windows.azure.net
   * https://swedencentral.monitoring.prod.windows.azure.net
   * https://qatarcentral.monitoring.prod.windows.azure.net
   * https://polandcentral.monitoring.prod.windows.azure.net

---
##Resource Type: extendedDiagnosticSettings
ICM Service: Azure Monitor Essentials
ICM Team: Sev 1 and 2
Team Email: auxmonhot@microsoft.com
Resource Endpoints: 
   * https://westus.monitoring.dev.windows.azure.net
   * https://eastus.monitoring.dev.windows.azure.net
   * https://eastus2euap.monitoring.dev.windows.azure.net
   * https://centraluseuap.monitoring.dev.windows.azure.net
   * https://westus.monitoring.prod.windows.azure.net
   * https://eastus.monitoring.prod.windows.azure.net
   * https://northeurope.monitoring.prod.windows.azure.net
   * https://westeurope.monitoring.prod.windows.azure.net
   * https://eastasia.monitoring.prod.windows.azure.net
   * https://southeastasia.monitoring.prod.windows.azure.net
   * https://japaneast.monitoring.prod.windows.azure.net
   * https://japanwest.monitoring.prod.windows.azure.net
   * https://northcentralus.monitoring.prod.windows.azure.net
   * https://southcentralus.monitoring.prod.windows.azure.net
   * https://eastus2.monitoring.prod.windows.azure.net
   * https://centralus.monitoring.prod.windows.azure.net
   * https://australiaeast.monitoring.prod.windows.azure.net
   * https://australiasoutheast.monitoring.prod.windows.azure.net
   * https://brazilsouth.monitoring.prod.windows.azure.net
   * https://uksouth.monitoring.prod.windows.azure.net
   * https://ukwest.monitoring.prod.windows.azure.net
   * https://southindia.monitoring.prod.windows.azure.net
   * https://centralindia.monitoring.prod.windows.azure.net
   * https://westindia.monitoring.prod.windows.azure.net
   * https://canadaeast.monitoring.prod.windows.azure.net
   * https://canadacentral.monitoring.prod.windows.azure.net
   * https://westcentralus.monitoring.prod.windows.azure.net
   * https://westus2.monitoring.prod.windows.azure.net
   * https://koreasouth.monitoring.prod.windows.azure.net
   * https://koreacentral.monitoring.prod.windows.azure.net
   * https://australiacentral.monitoring.prod.windows.azure.net
   * https://australiacentral2.monitoring.prod.windows.azure.net
   * https://francecentral.monitoring.prod.windows.azure.net
   * https://francesouth.monitoring.prod.windows.azure.net
   * https://eastus2euap.monitoring.prod.windows.azure.net
   * https://centraluseuap.monitoring.prod.windows.azure.net
   * https://southafricanorth.monitoring.prod.windows.azure.net
   * https://southafricawest.monitoring.prod.windows.azure.net
   * https://uaecentral.monitoring.prod.windows.azure.net
   * https://uaenorth.monitoring.prod.windows.azure.net
   * https://switzerlandnorth.monitoring.prod.windows.azure.net
   * https://switzerlandwest.monitoring.prod.windows.azure.net
   * https://germanynorth.monitoring.prod.windows.azure.net
   * https://germanywestcentral.monitoring.prod.windows.azure.net
   * https://norwayeast.monitoring.prod.windows.azure.net
   * https://norwaywest.monitoring.prod.windows.azure.net
   * https://brazilsoutheast.monitoring.prod.windows.azure.net
   * https://westus3.monitoring.prod.windows.azure.net
   * https://jioindiawest.monitoring.prod.windows.azure.net
   * https://jioindiacentral.monitoring.prod.windows.azure.net
   * https://swedensouth.monitoring.prod.windows.azure.net
   * https://swedencentral.monitoring.prod.windows.azure.net
   * https://qatarcentral.monitoring.prod.windows.azure.net
   * https://polandcentral.monitoring.prod.windows.azure.net

---
##Resource Type: metricDefinitions
ICM Service: Azure Monitor Essentials
ICM Team: Sev3 and 4 CRI - Metrics
Team Email: green@microsoft.com
Resource Endpoints: 
   * https://westus.monitoring.dev.windows.azure.net
   * https://eastus.monitoring.dev.windows.azure.net
   * https://eastus.mdmrp.tip.windows.azure.net
   * https://eastus2.mdmrp.tip.windows.azure.net
   * https://westus.mdmrp.tip.windows.azure.net
   * https://centralus.mdmrp.tip.windows.azure.net
   * https://northcentralus.mdmrp.tip.windows.azure.net
   * https://southcentralus.mdmrp.tip.windows.azure.net
   * https://northeurope.mdmrp.tip.windows.azure.net
   * https://westeurope.mdmrp.tip.windows.azure.net
   * https://eastasia.mdmrp.tip.windows.azure.net
   * https://southeastasia.mdmrp.tip.windows.azure.net
   * https://japaneast.mdmrp.tip.windows.azure.net
   * https://japanwest.mdmrp.tip.windows.azure.net
   * https://brazilsouth.mdmrp.tip.windows.azure.net
   * https://brazilsoutheast.mdmrp.tip.windows.azure.net
   * https://australiaeast.mdmrp.tip.windows.azure.net
   * https://australiasoutheast.mdmrp.tip.windows.azure.net
   * https://australiacentral.mdmrp.tip.windows.azure.net
   * https://australiacentral2.mdmrp.tip.windows.azure.net
   * https://centralindia.mdmrp.tip.windows.azure.net
   * https://southindia.mdmrp.tip.windows.azure.net
   * https://westindia.mdmrp.tip.windows.azure.net
   * https://canadacentral.mdmrp.tip.windows.azure.net
   * https://canadaeast.mdmrp.tip.windows.azure.net
   * https://westus2.mdmrp.tip.windows.azure.net
   * https://jioindiawest.mdmrp.tip.windows.azure.net
   * https://jioindiacentral.mdmrp.tip.windows.azure.net
   * https://qatarcentral.mdmrp.tip.windows.azure.net
   * https://polandcentral.mdmrp.tip.windows.azure.net
   * https://malaysiasouth.mdmrp.tip.windows.azure.net
   * https://swedencentral.mdmrp.tip.windows.azure.net
   * https://swedensouth.mdmrp.tip.windows.azure.net
   * https://westus3.mdmrp.tip.windows.azure.net
   * https://westcentralus.mdmrp.tip.windows.azure.net
   * https://koreasouth.mdmrp.tip.windows.azure.net
   * https://koreacentral.mdmrp.tip.windows.azure.net
   * https://uksouth.mdmrp.tip.windows.azure.net
   * https://ukwest.mdmrp.tip.windows.azure.net
   * https://francecentral.mdmrp.tip.windows.azure.net
   * https://francesouth.mdmrp.tip.windows.azure.net
   * https://southafricanorth.mdmrp.tip.windows.azure.net
   * https://southafricawest.mdmrp.tip.windows.azure.net
   * https://uaecentral.mdmrp.tip.windows.azure.net
   * https://uaenorth.mdmrp.tip.windows.azure.net
   * https://global.mdmrp.tip.windows.azure.net
   * https://eastus2euap.mdmrp.tip.windows.azure.net
   * https://centraluseuap.mdmrp.tip.windows.azure.net
   * https://switzerlandnorth.mdmrp.tip.windows.azure.net
   * https://switzerlandwest.mdmrp.tip.windows.azure.net
   * https://germanynorth.mdmrp.tip.windows.azure.net
   * https://germanywestcentral.mdmrp.tip.windows.azure.net
   * https://eastus.mdmrp.prod.windows.azure.net
   * https://westus.mdmrp.prod.windows.azure.net
   * https://westeurope.mdmrp.prod.windows.azure.net
   * https://eastasia.mdmrp.prod.windows.azure.net
   * https://southeastasia.mdmrp.prod.windows.azure.net
   * https://japaneast.mdmrp.prod.windows.azure.net
   * https://japanwest.mdmrp.prod.windows.azure.net
   * https://northcentralus.mdmrp.prod.windows.azure.net
   * https://southcentralus.mdmrp.prod.windows.azure.net
   * https://eastus2.mdmrp.prod.windows.azure.net
   * https://canadaeast.mdmrp.prod.windows.azure.net
   * https://canadacentral.mdmrp.prod.windows.azure.net
   * https://centralus.mdmrp.prod.windows.azure.net
   * https://australiaeast.mdmrp.prod.windows.azure.net
   * https://australiasoutheast.mdmrp.prod.windows.azure.net
   * https://australiacentral.mdmrp.prod.windows.azure.net
   * https://australiacentral2.mdmrp.prod.windows.azure.net
   * https://brazilsouth.mdmrp.prod.windows.azure.net
   * https://brazilsoutheast.mdmrp.prod.windows.azure.net
   * https://southindia.mdmrp.prod.windows.azure.net
   * https://centralindia.mdmrp.prod.windows.azure.net
   * https://westindia.mdmrp.prod.windows.azure.net
   * https://northeurope.mdmrp.prod.windows.azure.net
   * https://westus2.mdmrp.prod.windows.azure.net
   * https://jioindiawest.mdmrp.prod.windows.azure.net
   * https://jioindiacentral.mdmrp.prod.windows.azure.net
   * https://swedencentral.mdmrp.prod.windows.azure.net
   * https://swedensouth.mdmrp.prod.windows.azure.net
   * https://westus3.mdmrp.prod.windows.azure.net
   * https://westcentralus.mdmrp.prod.windows.azure.net
   * https://koreasouth.mdmrp.prod.windows.azure.net
   * https://koreacentral.mdmrp.prod.windows.azure.net
   * https://eastus2euap.mdmrp.prod.windows.azure.net
   * https://centraluseuap.mdmrp.prod.windows.azure.net
   * https://uksouth.mdmrp.prod.windows.azure.net
   * https://ukwest.mdmrp.prod.windows.azure.net
   * https://francecentral.mdmrp.prod.windows.azure.net
   * https://francesouth.mdmrp.prod.windows.azure.net
   * https://southafricanorth.mdmrp.prod.windows.azure.net
   * https://southafricawest.mdmrp.prod.windows.azure.net
   * https://uaecentral.mdmrp.prod.windows.azure.net
   * https://uaenorth.mdmrp.prod.windows.azure.net
   * https://qatarcentral.mdmrp.prod.windows.azure.net
   * https://polandcentral.mdmrp.prod.windows.azure.net
   * https://malaysiasouth.mdmrp.prod.windows.azure.net
   * https://switzerlandnorth.mdmrp.prod.windows.azure.net
   * https://switzerlandwest.mdmrp.prod.windows.azure.net
   * https://germanynorth.mdmrp.prod.windows.azure.net
   * https://germanywestcentral.mdmrp.prod.windows.azure.net
   * https://norwayeast.mdmrp.prod.windows.azure.net
   * https://norwaywest.mdmrp.prod.windows.azure.net
   * https://global.mdmrp.prod.windows.azure.net
   * https://westus.monitoring.prod.windows.azure.net
   * https://eastus.monitoring.prod.windows.azure.net
   * https://northeurope.monitoring.prod.windows.azure.net
   * https://westeurope.monitoring.prod.windows.azure.net
   * https://eastasia.monitoring.prod.windows.azure.net
   * https://southeastasia.monitoring.prod.windows.azure.net
   * https://japaneast.monitoring.prod.windows.azure.net
   * https://japanwest.monitoring.prod.windows.azure.net
   * https://northcentralus.monitoring.prod.windows.azure.net
   * https://southcentralus.monitoring.prod.windows.azure.net
   * https://eastus2.monitoring.prod.windows.azure.net
   * https://centralus.monitoring.prod.windows.azure.net
   * https://australiaeast.monitoring.prod.windows.azure.net
   * https://australiasoutheast.monitoring.prod.windows.azure.net
   * https://brazilsouth.monitoring.prod.windows.azure.net
   * https://uksouth.monitoring.prod.windows.azure.net
   * https://ukwest.monitoring.prod.windows.azure.net
   * https://southindia.monitoring.prod.windows.azure.net
   * https://centralindia.monitoring.prod.windows.azure.net
   * https://westindia.monitoring.prod.windows.azure.net
   * https://canadaeast.monitoring.prod.windows.azure.net
   * https://canadacentral.monitoring.prod.windows.azure.net
   * https://westcentralus.monitoring.prod.windows.azure.net
   * https://westus2.monitoring.prod.windows.azure.net
   * https://koreasouth.monitoring.prod.windows.azure.net
   * https://koreacentral.monitoring.prod.windows.azure.net
   * https://australiacentral.monitoring.prod.windows.azure.net
   * https://australiacentral2.monitoring.prod.windows.azure.net
   * https://francecentral.monitoring.prod.windows.azure.net
   * https://francesouth.monitoring.prod.windows.azure.net
   * https://global.monitoring.prod.windows.azure.net
   * https://eastus2euap.monitoring.prod.windows.azure.net
   * https://centraluseuap.monitoring.prod.windows.azure.net

---
##Resource Type: logDefinitions
ICM Service: Azure Monitor Essentials
ICM Team: Sev 1 and 2
Team Email: auxmonhot@microsoft.com
Resource Endpoints: 
   * https://westus.monitoring.dev.windows.azure.net
   * https://eastus.monitoring.dev.windows.azure.net
   * https://westus.monitoring.prod.windows.azure.net
   * https://eastus.monitoring.prod.windows.azure.net
   * https://northeurope.monitoring.prod.windows.azure.net
   * https://westeurope.monitoring.prod.windows.azure.net
   * https://eastasia.monitoring.prod.windows.azure.net
   * https://southeastasia.monitoring.prod.windows.azure.net
   * https://japaneast.monitoring.prod.windows.azure.net
   * https://japanwest.monitoring.prod.windows.azure.net
   * https://northcentralus.monitoring.prod.windows.azure.net
   * https://southcentralus.monitoring.prod.windows.azure.net
   * https://eastus2.monitoring.prod.windows.azure.net
   * https://centralus.monitoring.prod.windows.azure.net
   * https://australiaeast.monitoring.prod.windows.azure.net
   * https://australiasoutheast.monitoring.prod.windows.azure.net
   * https://brazilsouth.monitoring.prod.windows.azure.net
   * https://uksouth.monitoring.prod.windows.azure.net
   * https://ukwest.monitoring.prod.windows.azure.net
   * https://southindia.monitoring.prod.windows.azure.net
   * https://centralindia.monitoring.prod.windows.azure.net
   * https://westindia.monitoring.prod.windows.azure.net
   * https://canadaeast.monitoring.prod.windows.azure.net
   * https://canadacentral.monitoring.prod.windows.azure.net
   * https://westcentralus.monitoring.prod.windows.azure.net
   * https://westus2.monitoring.prod.windows.azure.net
   * https://koreasouth.monitoring.prod.windows.azure.net
   * https://koreacentral.monitoring.prod.windows.azure.net
   * https://australiacentral.monitoring.prod.windows.azure.net
   * https://australiacentral2.monitoring.prod.windows.azure.net
   * https://francecentral.monitoring.prod.windows.azure.net
   * https://francesouth.monitoring.prod.windows.azure.net
   * https://eastus2euap.monitoring.prod.windows.azure.net
   * https://centraluseuap.monitoring.prod.windows.azure.net

---
##Resource Type: eventCategories
ICM Service: Azure Monitor Essentials
ICM Team: Sev 1 and 2
Team Email: auxmonhot@microsoft.com
Resource Endpoints: 
   * https://event.prod.csm.windows.azure.net:444/

---
##Resource Type: metrics
ICM Service: Azure Monitor Essentials
ICM Team: Sev3 and 4 CRI - Metrics
Team Email: green@microsoft.com
Resource Endpoints: 
   * https://eastus.mdmrp.tip.windows.azure.net
   * https://eastus2.mdmrp.tip.windows.azure.net
   * https://westus.mdmrp.tip.windows.azure.net
   * https://centralus.mdmrp.tip.windows.azure.net
   * https://northcentralus.mdmrp.tip.windows.azure.net
   * https://southcentralus.mdmrp.tip.windows.azure.net
   * https://northeurope.mdmrp.tip.windows.azure.net
   * https://westeurope.mdmrp.tip.windows.azure.net
   * https://eastasia.mdmrp.tip.windows.azure.net
   * https://southeastasia.mdmrp.tip.windows.azure.net
   * https://japaneast.mdmrp.tip.windows.azure.net
   * https://japanwest.mdmrp.tip.windows.azure.net
   * https://brazilsouth.mdmrp.tip.windows.azure.net
   * https://brazilsoutheast.mdmrp.tip.windows.azure.net
   * https://australiaeast.mdmrp.tip.windows.azure.net
   * https://australiasoutheast.mdmrp.tip.windows.azure.net
   * https://australiacentral.mdmrp.tip.windows.azure.net
   * https://australiacentral2.mdmrp.tip.windows.azure.net
   * https://centralindia.mdmrp.tip.windows.azure.net
   * https://southindia.mdmrp.tip.windows.azure.net
   * https://westindia.mdmrp.tip.windows.azure.net
   * https://canadacentral.mdmrp.tip.windows.azure.net
   * https://canadaeast.mdmrp.tip.windows.azure.net
   * https://westus2.mdmrp.tip.windows.azure.net
   * https://jioindiawest.mdmrp.tip.windows.azure.net
   * https://jioindiacentral.mdmrp.tip.windows.azure.net
   * https://qatarcentral.mdmrp.tip.windows.azure.net
   * https://polandcentral.mdmrp.tip.windows.azure.net
   * https://malaysiasouth.mdmrp.tip.windows.azure.net
   * https://swedencentral.mdmrp.tip.windows.azure.net
   * https://swedensouth.mdmrp.tip.windows.azure.net
   * https://westus3.mdmrp.tip.windows.azure.net
   * https://westcentralus.mdmrp.tip.windows.azure.net
   * https://koreasouth.mdmrp.tip.windows.azure.net
   * https://koreacentral.mdmrp.tip.windows.azure.net
   * https://eastus2euap.mdmrp.tip.windows.azure.net
   * https://centraluseuap.mdmrp.tip.windows.azure.net
   * https://uksouth.mdmrp.tip.windows.azure.net
   * https://ukwest.mdmrp.tip.windows.azure.net
   * https://francecentral.mdmrp.tip.windows.azure.net
   * https://francesouth.mdmrp.tip.windows.azure.net
   * https://southafricanorth.mdmrp.tip.windows.azure.net
   * https://southafricawest.mdmrp.tip.windows.azure.net
   * https://uaecentral.mdmrp.tip.windows.azure.net
   * https://uaenorth.mdmrp.tip.windows.azure.net
   * https://switzerlandnorth.mdmrp.tip.windows.azure.net
   * https://switzerlandwest.mdmrp.tip.windows.azure.net
   * https://germanynorth.mdmrp.tip.windows.azure.net
   * https://germanywestcentral.mdmrp.tip.windows.azure.net
   * https://global.mdmrp.tip.windows.azure.net
   * https://eastus.mdmrp.prod.windows.azure.net
   * https://westus.mdmrp.prod.windows.azure.net
   * https://westeurope.mdmrp.prod.windows.azure.net
   * https://eastasia.mdmrp.prod.windows.azure.net
   * https://southeastasia.mdmrp.prod.windows.azure.net
   * https://japaneast.mdmrp.prod.windows.azure.net
   * https://japanwest.mdmrp.prod.windows.azure.net
   * https://northcentralus.mdmrp.prod.windows.azure.net
   * https://southcentralus.mdmrp.prod.windows.azure.net
   * https://eastus2.mdmrp.prod.windows.azure.net
   * https://canadaeast.mdmrp.prod.windows.azure.net
   * https://canadacentral.mdmrp.prod.windows.azure.net
   * https://centralus.mdmrp.prod.windows.azure.net
   * https://australiaeast.mdmrp.prod.windows.azure.net
   * https://australiasoutheast.mdmrp.prod.windows.azure.net
   * https://australiacentral.mdmrp.prod.windows.azure.net
   * https://australiacentral2.mdmrp.prod.windows.azure.net
   * https://brazilsouth.mdmrp.prod.windows.azure.net
   * https://brazilsoutheast.mdmrp.prod.windows.azure.net
   * https://southindia.mdmrp.prod.windows.azure.net
   * https://centralindia.mdmrp.prod.windows.azure.net
   * https://westindia.mdmrp.prod.windows.azure.net
   * https://northeurope.mdmrp.prod.windows.azure.net
   * https://westus2.mdmrp.prod.windows.azure.net
   * https://jioindiawest.mdmrp.prod.windows.azure.net
   * https://jioindiacentral.mdmrp.prod.windows.azure.net
   * https://swedencentral.mdmrp.prod.windows.azure.net
   * https://swedensouth.mdmrp.prod.windows.azure.net
   * https://westus3.mdmrp.prod.windows.azure.net
   * https://westcentralus.mdmrp.prod.windows.azure.net
   * https://koreasouth.mdmrp.prod.windows.azure.net
   * https://koreacentral.mdmrp.prod.windows.azure.net
   * https://eastus2euap.mdmrp.prod.windows.azure.net
   * https://centraluseuap.mdmrp.prod.windows.azure.net
   * https://uksouth.mdmrp.prod.windows.azure.net
   * https://ukwest.mdmrp.prod.windows.azure.net
   * https://francecentral.mdmrp.prod.windows.azure.net
   * https://francesouth.mdmrp.prod.windows.azure.net
   * https://southafricanorth.mdmrp.prod.windows.azure.net
   * https://southafricawest.mdmrp.prod.windows.azure.net
   * https://uaecentral.mdmrp.prod.windows.azure.net
   * https://uaenorth.mdmrp.prod.windows.azure.net
   * https://qatarcentral.mdmrp.prod.windows.azure.net
   * https://polandcentral.mdmrp.prod.windows.azure.net
   * https://malaysiasouth.mdmrp.prod.windows.azure.net
   * https://switzerlandnorth.mdmrp.prod.windows.azure.net
   * https://switzerlandwest.mdmrp.prod.windows.azure.net
   * https://germanynorth.mdmrp.prod.windows.azure.net
   * https://germanywestcentral.mdmrp.prod.windows.azure.net
   * https://norwayeast.mdmrp.prod.windows.azure.net
   * https://norwaywest.mdmrp.prod.windows.azure.net
   * https://global.mdmrp.prod.windows.azure.net

---
##Resource Type: metricbatch
ICM Service: Azure Monitor Essentials
ICM Team: Sev3 and 4 CRI - Metrics
Team Email: green@microsoft.com
Resource Endpoints: 
   * https://global.mdmrp.tip.windows.azure.net
   * https://eastus2euap.mdmrp.prod.windows.azure.net
   * https://global.mdmrp.prod.windows.azure.net

---
##Resource Type: metricNamespaces
ICM Service: Azure Monitor Essentials
ICM Team: Sev3 and 4 CRI - Metrics
Team Email: green@microsoft.com
Resource Endpoints: 
   * https://eastus.mdmrp.tip.windows.azure.net
   * https://eastus2.mdmrp.tip.windows.azure.net
   * https://westus.mdmrp.tip.windows.azure.net
   * https://centralus.mdmrp.tip.windows.azure.net
   * https://northcentralus.mdmrp.tip.windows.azure.net
   * https://southcentralus.mdmrp.tip.windows.azure.net
   * https://northeurope.mdmrp.tip.windows.azure.net
   * https://westeurope.mdmrp.tip.windows.azure.net
   * https://eastasia.mdmrp.tip.windows.azure.net
   * https://southeastasia.mdmrp.tip.windows.azure.net
   * https://japaneast.mdmrp.tip.windows.azure.net
   * https://japanwest.mdmrp.tip.windows.azure.net
   * https://brazilsouth.mdmrp.tip.windows.azure.net
   * https://brazilsoutheast.mdmrp.tip.windows.azure.net
   * https://australiaeast.mdmrp.tip.windows.azure.net
   * https://australiasoutheast.mdmrp.tip.windows.azure.net
   * https://australiacentral.mdmrp.tip.windows.azure.net
   * https://australiacentral2.mdmrp.tip.windows.azure.net
   * https://centralindia.mdmrp.tip.windows.azure.net
   * https://southindia.mdmrp.tip.windows.azure.net
   * https://westindia.mdmrp.tip.windows.azure.net
   * https://canadacentral.mdmrp.tip.windows.azure.net
   * https://canadaeast.mdmrp.tip.windows.azure.net
   * https://westus2.mdmrp.tip.windows.azure.net
   * https://jioindiawest.mdmrp.tip.windows.azure.net
   * https://jioindiacentral.mdmrp.tip.windows.azure.net
   * https://qatarcentral.mdmrp.tip.windows.azure.net
   * https://polandcentral.mdmrp.tip.windows.azure.net
   * https://malaysiasouth.mdmrp.tip.windows.azure.net
   * https://swedencentral.mdmrp.tip.windows.azure.net
   * https://swedensouth.mdmrp.tip.windows.azure.net
   * https://westus3.mdmrp.tip.windows.azure.net
   * https://westcentralus.mdmrp.tip.windows.azure.net
   * https://koreasouth.mdmrp.tip.windows.azure.net
   * https://koreacentral.mdmrp.tip.windows.azure.net
   * https://uksouth.mdmrp.tip.windows.azure.net
   * https://ukwest.mdmrp.tip.windows.azure.net
   * https://francecentral.mdmrp.tip.windows.azure.net
   * https://francesouth.mdmrp.tip.windows.azure.net
   * https://southafricanorth.mdmrp.tip.windows.azure.net
   * https://southafricawest.mdmrp.tip.windows.azure.net
   * https://uaecentral.mdmrp.tip.windows.azure.net
   * https://uaenorth.mdmrp.tip.windows.azure.net
   * https://switzerlandnorth.mdmrp.tip.windows.azure.net
   * https://switzerlandwest.mdmrp.tip.windows.azure.net
   * https://germanynorth.mdmrp.tip.windows.azure.net
   * https://germanywestcentral.mdmrp.tip.windows.azure.net
   * https://global.mdmrp.tip.windows.azure.net
   * https://eastus2euap.mdmrp.tip.windows.azure.net
   * https://centraluseuap.mdmrp.tip.windows.azure.net
   * https://eastus.mdmrp.prod.windows.azure.net
   * https://westus.mdmrp.prod.windows.azure.net
   * https://westeurope.mdmrp.prod.windows.azure.net
   * https://eastasia.mdmrp.prod.windows.azure.net
   * https://southeastasia.mdmrp.prod.windows.azure.net
   * https://japaneast.mdmrp.prod.windows.azure.net
   * https://japanwest.mdmrp.prod.windows.azure.net
   * https://northcentralus.mdmrp.prod.windows.azure.net
   * https://southcentralus.mdmrp.prod.windows.azure.net
   * https://eastus2.mdmrp.prod.windows.azure.net
   * https://canadaeast.mdmrp.prod.windows.azure.net
   * https://canadacentral.mdmrp.prod.windows.azure.net
   * https://centralus.mdmrp.prod.windows.azure.net
   * https://australiaeast.mdmrp.prod.windows.azure.net
   * https://australiasoutheast.mdmrp.prod.windows.azure.net
   * https://australiacentral.mdmrp.prod.windows.azure.net
   * https://australiacentral2.mdmrp.prod.windows.azure.net
   * https://brazilsouth.mdmrp.prod.windows.azure.net
   * https://brazilsoutheast.mdmrp.prod.windows.azure.net
   * https://southindia.mdmrp.prod.windows.azure.net
   * https://centralindia.mdmrp.prod.windows.azure.net
   * https://westindia.mdmrp.prod.windows.azure.net
   * https://northeurope.mdmrp.prod.windows.azure.net
   * https://westus2.mdmrp.prod.windows.azure.net
   * https://jioindiawest.mdmrp.prod.windows.azure.net
   * https://jioindiacentral.mdmrp.prod.windows.azure.net
   * https://swedencentral.mdmrp.prod.windows.azure.net
   * https://swedensouth.mdmrp.prod.windows.azure.net
   * https://westus3.mdmrp.prod.windows.azure.net
   * https://westcentralus.mdmrp.prod.windows.azure.net
   * https://koreasouth.mdmrp.prod.windows.azure.net
   * https://koreacentral.mdmrp.prod.windows.azure.net
   * https://eastus2euap.mdmrp.prod.windows.azure.net
   * https://centraluseuap.mdmrp.prod.windows.azure.net
   * https://uksouth.mdmrp.prod.windows.azure.net
   * https://ukwest.mdmrp.prod.windows.azure.net
   * https://francecentral.mdmrp.prod.windows.azure.net
   * https://francesouth.mdmrp.prod.windows.azure.net
   * https://southafricanorth.mdmrp.prod.windows.azure.net
   * https://southafricawest.mdmrp.prod.windows.azure.net
   * https://uaecentral.mdmrp.prod.windows.azure.net
   * https://uaenorth.mdmrp.prod.windows.azure.net
   * https://qatarcentral.mdmrp.prod.windows.azure.net
   * https://polandcentral.mdmrp.prod.windows.azure.net
   * https://malaysiasouth.mdmrp.prod.windows.azure.net
   * https://switzerlandnorth.mdmrp.prod.windows.azure.net
   * https://switzerlandwest.mdmrp.prod.windows.azure.net
   * https://germanynorth.mdmrp.prod.windows.azure.net
   * https://germanywestcentral.mdmrp.prod.windows.azure.net
   * https://norwayeast.mdmrp.prod.windows.azure.net
   * https://norwaywest.mdmrp.prod.windows.azure.net
   * https://global.mdmrp.prod.windows.azure.net

---
##Resource Type: notificationgroups
ICM Service: Azure Notification Service
ICM Team: Triage
Team Email: aznshot@microsoft.com
Resource Endpoints: 
   * https://agrpapi.azns.microsofticm.com/ActionGroupService/arm/

---
##Resource Type: notificationstatus
ICM Service: Azure Notification Service
ICM Team: Triage
Team Email: aznshot@microsoft.com
Resource Endpoints: 
   * https://agrpapi.azns.microsofticm.com/ActionGroupService/arm/
   * https://aznsapi.ppe.microsofticm.com/ActionGroupService/arm/

---
##Resource Type: createnotifications
ICM Service: Azure Notification Service
ICM Team: Triage
Team Email: aznshot@microsoft.com
Resource Endpoints: 
   * https://agrpapi.azns.microsofticm.com/ActionGroupService/arm/
   * https://aznsapi.ppe.microsofticm.com/ActionGroupService/arm/

---
##Resource Type: tenantactiongroups
ICM Service: Azure Notification Service
ICM Team: Triage
Team Email: aznshot@microsoft.com
Resource Endpoints: 
   * https://agrpapi.azns.microsofticm.com/ActionGroupService/arm/

---
##Resource Type: actiongroups
ICM Service: Azure Notification Service
ICM Team: Triage
Team Email: aznshot@microsoft.com
Resource Endpoints: 
   * https://agrpapi.azns.microsofticm.com/ActionGroupService/arm/
   * https://aznsapi.ppe.microsofticm.com/ActionGroupService/arm/
   * https://agrp.swedenc.azns.azure.com/ActionGroupService/arm/
   * https://agrp.germanywc.azns.azure.com/ActionGroupService/arm/
   * https://agrp.useast2euap.azns.azure.com/ActionGroupService/arm/
   * https://agrp.uscentraleuap.azns.azure.com/ActionGroupService/arm/
   * https://agrp.usnorth.azns.azure.com/ActionGroupService/arm/
   * https://agrp.ussouth.azns.azure.com/ActionGroupService/arm/

---
##Resource Type: activityLogAlerts
ICM Service: Azure Metric Alerts
ICM Team: LSI
Team Email: azuremetricalerts@microsoft.com
Resource Endpoints: 
   * https://ala-test.alertsrp.trafficmanager.net
   * https://ala-prod.alertsrp.trafficmanager.net
   * https://ala-prod.alertsrp.trafficmanager.net
   * https://ala-pgms.alertsrp.pgms.trafficmanager.net

---
##Resource Type: metricbaselines
ICM Service: Azure Metric Alerts
ICM Team: LSI
Team Email: azuremetricalerts@microsoft.com
Resource Endpoints: 
   * https://ama-prod.alertsrp.trafficmanager.net/api/arm/
   * https://ama-westeurope-prod.alertsrp.trafficmanager.net/api/arm/
   * https://ama-northeurope-prod.alertsrp.trafficmanager.net/api/arm/
   * https://ama-pgms.alertsrp.pgms.trafficmanager.net/api/arm/
   * https://ama-test.alertsrp.trafficmanager.net/api/arm/

---
##Resource Type: workbooks
ICM Service: Workbooks &amp; Experiences
ICM Team: Azure Workbooks and Solutions UX
Team Email: azmonworkbooks@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://eastus2euap.cds.monitor.azure.com/locations/eastus2euap/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/locations/westcentralus/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: workbooktemplates
ICM Service: Workbooks &amp; Experiences
ICM Team: Azure Workbooks and Solutions UX
Team Email: azmonworkbooks@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://ukwest.cds.monitor.azure.com/locations/ukwest/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/
   * https://australiacentral2.cds.monitor.azure.com/locations/australiacentral2/
   * https://germanywestcentral.cds.monitor.azure.com/locations/germanywestcentral/
   * https://switzerlandwest.cds.monitor.azure.com/locations/switzerlandwest/
   * https://uaecentral.cds.monitor.azure.com/locations/uaecentral/
   * https://japanwest.cds.monitor.azure.com/locations/japanwest/
   * https://brazilsoutheast.cds.monitor.azure.com/locations/brazilsoutheast/
   * https://uaenorth.cds.monitor.azure.com/locations/uaenorth/
   * https://australiacentral.cds.monitor.azure.com/locations/australiacentral/
   * https://francesouth.cds.monitor.azure.com/locations/francesouth/
   * https://southindia.cds.monitor.azure.com/locations/southindia/
   * https://westcentralus.cds.monitor.azure.com/locations/westcentralus/
   * https://westus3.cds.monitor.azure.com/locations/westus3/
   * https://koreasouth.cds.monitor.azure.com/locations/koreasouth/
   * https://canadaeast.cds.monitor.azure.com/locations/canadaeast/
   * https://swedencentral.cds.monitor.azure.com/locations/swedencentral/
   * https://swedensouth.cds.monitor.azure.com/locations/swedensouth/
   * https://jioindiacentral.cds.monitor.azure.com/locations/jioindiacentral/
   * https://jioindiawest.cds.monitor.azure.com/locations/jioindiawest/
   * https://qatarcentral.cds.monitor.azure.com/locations/qatarcentral/
   * https://southafricawest.cds.monitor.azure.com/locations/southafricawest/
   * https://centraluseuap.cds.monitor.azure.com/locations/centraluseuap/
   * https://germanynorth.cds.monitor.azure.com/locations/germanynorth/
   * https://polandcentral.cds.monitor.azure.com/locations/polandcentral/
   * https://israelcentral.cds.monitor.azure.com
   * https://israelnorthwest.cds.monitor.azure.com
   * https://italynorth.cds.monitor.azure.com
   * https://malaysiasouth.cds.monitor.azure.com
   * https://mexicocentral.cds.monitor.azure.com
   * https://taiwannorth.cds.monitor.azure.com
   * https://taiwannorthwest.cds.monitor.azure.com

---
##Resource Type: guestDiagnosticSettings
ICM Service: Azure Monitor Control Service (AMCS)
ICM Team: Triage
Team Email: MonExtensionTeam@microsoft.com
Resource Endpoints: 
   * https://westus.monitoring.dev.windows.azure.net
   * https://eastus.monitoring.dev.windows.azure.net

---
##Resource Type: guestDiagnosticSettingsAssociation
ICM Service: Azure Monitor Control Service (AMCS)
ICM Team: Triage
Team Email: MonExtensionTeam@microsoft.com
Resource Endpoints: 
   * https://westus.monitoring.dev.windows.azure.net
   * https://eastus.monitoring.dev.windows.azure.net

---
##Resource Type: myWorkbooks
ICM Service: Workbooks &amp; Experiences
ICM Team: Azure Workbooks and Solutions UX
Team Email: azmonworkbooks@microsoft.com
Resource Endpoints: 
   * https://westcentralus.cds.aimon.monitor.azure.com/locations/westcentralus/
   * https://cds.applicationinsights.io
   * https://cds.applicationinsights.io
   * https://westeurope.cds.monitor.azure.com/locations/westeurope/
   * https://southcentralus.cds.monitor.azure.com/locations/southcentralus/
   * https://eastus.cds.monitor.azure.com/locations/eastus/
   * https://northeurope.cds.monitor.azure.com/locations/northeurope/
   * https://southeastasia.cds.monitor.azure.com/locations/southeastasia/
   * https://westus2.cds.monitor.azure.com/locations/westus2/
   * https://uksouth.cds.monitor.azure.com/locations/uksouth/
   * https://canadacentral.cds.monitor.azure.com/locations/canadacentral/
   * https://centralindia.cds.monitor.azure.com/locations/centralindia/
   * https://japaneast.cds.monitor.azure.com/locations/japaneast/
   * https://australiaeast.cds.monitor.azure.com/locations/australiaeast/
   * https://koreacentral.cds.monitor.azure.com/locations/koreacentral/
   * https://francecentral.cds.monitor.azure.com/locations/francecentral/
   * https://centralus.cds.monitor.azure.com/locations/centralus/
   * https://eastus2.cds.monitor.azure.com/locations/eastus2/
   * https://eastasia.cds.monitor.azure.com/locations/eastasia/
   * https://westus.cds.monitor.azure.com/locations/westus/
   * https://southafricanorth.cds.monitor.azure.com/locations/southafricanorth/
   * https://northcentralus.cds.monitor.azure.com/locations/northcentralus/
   * https://brazilsouth.cds.monitor.azure.com/locations/brazilsouth/
   * https://switzerlandnorth.cds.monitor.azure.com/locations/switzerlandnorth/
   * https://norwayeast.cds.monitor.azure.com/locations/norwayeast/
   * https://norwaywest.cds.monitor.azure.com/locations/norwaywest/
   * https://australiasoutheast.cds.monitor.azure.com/locations/australiasoutheast/

---
##Resource Type: logs
ICM Service: Azure Log Analytics
ICM Team: Draft (API)-OMS
Team Email: aiapi@microsoft.com
Resource Endpoints: 
   * https://internal.api.loganalytics.io/
   * https://internal.api.loganalytics.io/
   * https://internal.api.loganalytics.io/
   * https://internal.api.loganalytics.io/

---
##Resource Type: transactions
ICM Service: Application Insights
ICM Team: Distributed Tracing
Team Email: norris_ux@microsoft.com
Resource Endpoints: 
   * https://indexerquery.canary.prod.applicationinsights.trafficmanager.net/arm/api/
   * https://dtindexer-query.aimon.applicationinsights.trafficmanager.net/arm/api/
   * https://dtindexer-query.prod.applicationinsights.trafficmanager.net/arm/api/

---
##Resource Type: topology
ICM Service: Application Insights
ICM Team: Distributed Tracing
Team Email: norris_ux@microsoft.com
Resource Endpoints: 
   * https://indexerquery.canary.prod.applicationinsights.trafficmanager.net/arm/api/
   * https://dtindexer-query.aimon.applicationinsights.trafficmanager.net/arm/api/
   * https://dtindexer-query.prod.applicationinsights.trafficmanager.net/arm/api/

---
##Resource Type: generateLiveToken
ICM Service: Application Insights
ICM Team: Live Metrics
Team Email: quickpulse@microsoft.com
Resource Endpoints: 
   * https://quickpulse.aimon.applicationinsights.io/QuickPulseService.svc/gettoken/
   * https://live.applicationinsights.azure.com/QuickPulseService.svc/gettoken/

---
##Resource Type: generateDiagnosticServiceReadOnlyToken
ICM Service: Service Profiler
ICM Team: AIProfiler
Team Email: aiprofilerdev@microsoft.com
Resource Endpoints: 
   * https://gateway.azureserviceprofiler.net/

---
##Resource Type: generateDiagnosticServiceReadWriteToken
ICM Service: Service Profiler
ICM Team: AIProfiler
Team Email: aiprofilerdev@microsoft.com
Resource Endpoints: 
   * https://gateway.azureserviceprofiler.net/

---
##Resource Type: components/generateDiagnosticServiceReadOnlyToken
ICM Service: Service Profiler
ICM Team: AIProfiler
Team Email: aiprofilerdev@microsoft.com
Resource Endpoints: 
   * https://gateway.azureserviceprofiler.net/

---
##Resource Type: components/generateDiagnosticServiceReadWriteToken
ICM Service: Service Profiler
ICM Team: AIProfiler
Team Email: aiprofilerdev@microsoft.com
Resource Endpoints: 
   * https://gateway.azureserviceprofiler.net/

---
##Resource Type: monitoredObjects
ICM Service: Azure Monitor Control Service (AMCS)
ICM Team: Triage
Team Email: amcsdev@microsoft.com
Resource Endpoints: 
   * https://global.frontend.control.monitor.azure.com/

---
##Resource Type: dataCollectionRules
ICM Service: Azure Monitor Control Service (AMCS)
ICM Team: Triage
Team Email: amcsdev@microsoft.com
Resource Endpoints: 
   * https://australiasoutheast.frontend.control.monitor.azure.com/
   * https://canadacentral.frontend.control.monitor.azure.com/
   * https://polandcentral.frontend.control.monitor.azure.com/
   * https://southafricawest.frontend.control.monitor.azure.com/
   * https://germanynorth.frontend.control.monitor.azure.com/
   * https://japaneast.frontend.control.monitor.azure.com/
   * https://australiaeast.frontend.control.monitor.azure.com/
   * https://centralindia.frontend.control.monitor.azure.com/
   * https://germanywestcentral.frontend.control.monitor.azure.com/
   * https://northcentralus.frontend.control.monitor.azure.com/
   * https://southcentralus.frontend.control.monitor.azure.com/
   * https://eastus.frontend.control.monitor.azure.com/
   * https://centralus.frontend.control.monitor.azure.com/
   * https://westeurope.frontend.control.monitor.azure.com/
   * https://westus2.frontend.control.monitor.azure.com/
   * https://southeastasia.frontend.control.monitor.azure.com/
   * https://eastus2.frontend.control.monitor.azure.com/
   * https://uksouth.frontend.control.monitor.azure.com/
   * https://northeurope.frontend.control.monitor.azure.com/
   * https://westus.frontend.control.monitor.azure.com/
   * https://australiacentral.frontend.control.monitor.azure.com/
   * https://westcentralus.frontend.control.monitor.azure.com/
   * https://eastasia.frontend.control.monitor.azure.com/
   * https://ukwest.frontend.control.monitor.azure.com/
   * https://koreacentral.frontend.control.monitor.azure.com/
   * https://francecentral.frontend.control.monitor.azure.com/
   * https://southafricanorth.frontend.control.monitor.azure.com/
   * https://switzerlandnorth.frontend.control.monitor.azure.com/
   * https://australiacentral2.frontend.control.monitor.azure.com/
   * https://brazilsoutheast.frontend.control.monitor.azure.com/
   * https://canadaeast.frontend.control.monitor.azure.com/
   * https://francesouth.frontend.control.monitor.azure.com/
   * https://koreasouth.frontend.control.monitor.azure.com/
   * https://norwaywest.frontend.control.monitor.azure.com/
   * https://uaenorth.frontend.control.monitor.azure.com/
   * https://japanwest.frontend.control.monitor.azure.com/
   * https://norwayeast.frontend.control.monitor.azure.com/
   * https://switzerlandwest.frontend.control.monitor.azure.com/
   * https://brazilsouth.frontend.control.monitor.azure.com/
   * https://jioindiacentral.frontend.control.monitor.azure.com/
   * https://jioindiawest.frontend.control.monitor.azure.com/
   * https://swedensouth.frontend.control.monitor.azure.com/
   * https://swedencentral.frontend.control.monitor.azure.com/
   * https://southindia.frontend.control.monitor.azure.com/
   * https://eastus2euap.frontend.canary.control.monitor.azure.com/
   * https://eastus2euap.frontend.canary.control.monitor.azure.com/
   * https://centraluseuap.frontend.canary.control.monitor.azure.com/
   * https://centraluseuap.frontend.canary.control.monitor.azure.com/
   * https://uaecentral.frontend.control.monitor.azure.com/
   * https://westus3.frontend.control.monitor.azure.com/
   * https://westindia.frontend.control.monitor.azure.com/
   * https://qatarcentral.frontend.control.monitor.azure.com/

---
##Resource Type: dataCollectionRuleAssociations
ICM Service: Azure Monitor Control Service (AMCS)
ICM Team: Triage
Team Email: amcsdev@microsoft.com
Resource Endpoints: 
   * https://global.frontend.control.monitor.azure.com/
   * https://australiasoutheast.frontend.control.monitor.azure.com/
   * https://canadacentral.frontend.control.monitor.azure.com/
   * https://polandcentral.frontend.control.monitor.azure.com/
   * https://southafricawest.frontend.control.monitor.azure.com/
   * https://japaneast.frontend.control.monitor.azure.com/
   * https://australiaeast.frontend.control.monitor.azure.com/
   * https://centralindia.frontend.control.monitor.azure.com/
   * https://germanywestcentral.frontend.control.monitor.azure.com/
   * https://northcentralus.frontend.control.monitor.azure.com/
   * https://southcentralus.frontend.control.monitor.azure.com/
   * https://eastus.frontend.control.monitor.azure.com/
   * https://centralus.frontend.control.monitor.azure.com/
   * https://westeurope.frontend.control.monitor.azure.com/
   * https://westus2.frontend.control.monitor.azure.com/
   * https://southeastasia.frontend.control.monitor.azure.com/
   * https://eastus2.frontend.control.monitor.azure.com/
   * https://uksouth.frontend.control.monitor.azure.com/
   * https://northeurope.frontend.control.monitor.azure.com/
   * https://westus.frontend.control.monitor.azure.com/
   * https://australiacentral.frontend.control.monitor.azure.com/
   * https://westcentralus.frontend.control.monitor.azure.com/
   * https://eastasia.frontend.control.monitor.azure.com/
   * https://ukwest.frontend.control.monitor.azure.com/
   * https://koreacentral.frontend.control.monitor.azure.com/
   * https://francecentral.frontend.control.monitor.azure.com/
   * https://southafricanorth.frontend.control.monitor.azure.com/
   * https://switzerlandnorth.frontend.control.monitor.azure.com/
   * https://brazilsouth.frontend.control.monitor.azure.com/
   * https://australiacentral2.frontend.control.monitor.azure.com/
   * https://brazilsoutheast.frontend.control.monitor.azure.com/
   * https://canadaeast.frontend.control.monitor.azure.com/
   * https://francesouth.frontend.control.monitor.azure.com/
   * https://koreasouth.frontend.control.monitor.azure.com/
   * https://norwaywest.frontend.control.monitor.azure.com/
   * https://uaenorth.frontend.control.monitor.azure.com/
   * https://japanwest.frontend.control.monitor.azure.com/
   * https://norwayeast.frontend.control.monitor.azure.com/
   * https://switzerlandwest.frontend.control.monitor.azure.com/
   * https://jioindiacentral.frontend.control.monitor.azure.com/
   * https://jioindiawest.frontend.control.monitor.azure.com/
   * https://swedensouth.frontend.control.monitor.azure.com/
   * https://swedencentral.frontend.control.monitor.azure.com/
   * https://germanynorth.frontend.control.monitor.azure.com/
   * https://southindia.frontend.control.monitor.azure.com/
   * https://uaecentral.frontend.control.monitor.azure.com/
   * https://westus3.frontend.control.monitor.azure.com/
   * https://westindia.frontend.control.monitor.azure.com/
   * https://qatarcentral.frontend.control.monitor.azure.com/
   * https://eastus2euap.frontend.canary.control.monitor.azure.com/
   * https://eastus2euap.frontend.canary.control.monitor.azure.com/
   * https://centraluseuap.frontend.canary.control.monitor.azure.com/
   * https://centraluseuap.frontend.canary.control.monitor.azure.com/

---
##Resource Type: dataCollectionEndpoints
ICM Service: Azure Monitor Control Service (AMCS)
ICM Team: Triage
Team Email: amcsdev@microsoft.com
Resource Endpoints: 
   * https://australiasoutheast.frontend.control.monitor.azure.com/
   * https://canadacentral.frontend.control.monitor.azure.com/
   * https://polandcentral.frontend.control.monitor.azure.com/
   * https://southafricawest.frontend.control.monitor.azure.com/
   * https://japaneast.frontend.control.monitor.azure.com/
   * https://australiaeast.frontend.control.monitor.azure.com/
   * https://centralindia.frontend.control.monitor.azure.com/
   * https://germanywestcentral.frontend.control.monitor.azure.com/
   * https://northcentralus.frontend.control.monitor.azure.com/
   * https://southcentralus.frontend.control.monitor.azure.com/
   * https://eastus.frontend.control.monitor.azure.com/
   * https://centralus.frontend.control.monitor.azure.com/
   * https://westeurope.frontend.control.monitor.azure.com/
   * https://westus2.frontend.control.monitor.azure.com/
   * https://southeastasia.frontend.control.monitor.azure.com/
   * https://eastus2.frontend.control.monitor.azure.com/
   * https://uksouth.frontend.control.monitor.azure.com/
   * https://northeurope.frontend.control.monitor.azure.com/
   * https://westus.frontend.control.monitor.azure.com/
   * https://australiacentral.frontend.control.monitor.azure.com/
   * https://westcentralus.frontend.control.monitor.azure.com/
   * https://eastasia.frontend.control.monitor.azure.com/
   * https://ukwest.frontend.control.monitor.azure.com/
   * https://koreacentral.frontend.control.monitor.azure.com/
   * https://francecentral.frontend.control.monitor.azure.com/
   * https://southafricanorth.frontend.control.monitor.azure.com/
   * https://switzerlandnorth.frontend.control.monitor.azure.com/
   * https://brazilsouth.frontend.control.monitor.azure.com/
   * https://australiacentral2.frontend.control.monitor.azure.com/
   * https://brazilsoutheast.frontend.control.monitor.azure.com/
   * https://canadaeast.frontend.control.monitor.azure.com/
   * https://francesouth.frontend.control.monitor.azure.com/
   * https://koreasouth.frontend.control.monitor.azure.com/
   * https://norwaywest.frontend.control.monitor.azure.com/
   * https://uaenorth.frontend.control.monitor.azure.com/
   * https://japanwest.frontend.control.monitor.azure.com/
   * https://norwayeast.frontend.control.monitor.azure.com/
   * https://switzerlandwest.frontend.control.monitor.azure.com/
   * https://jioindiacentral.frontend.control.monitor.azure.com/
   * https://jioindiawest.frontend.control.monitor.azure.com/
   * https://swedensouth.frontend.control.monitor.azure.com/
   * https://swedencentral.frontend.control.monitor.azure.com/
   * https://germanynorth.frontend.control.monitor.azure.com/
   * https://southindia.frontend.control.monitor.azure.com/
   * https://uaecentral.frontend.control.monitor.azure.com/
   * https://westus3.frontend.control.monitor.azure.com/
   * https://westindia.frontend.control.monitor.azure.com/
   * https://qatarcentral.frontend.control.monitor.azure.com/
   * https://eastus2euap.frontend.canary.control.monitor.azure.com/
   * https://eastus2euap.frontend.canary.control.monitor.azure.com/
   * https://centraluseuap.frontend.canary.control.monitor.azure.com/
   * https://centraluseuap.frontend.canary.control.monitor.azure.com/

---
##Resource Type: dataCollectionEndpoints/scopedPrivateLinkProxies
ICM Service: Azure Monitor Control Service (AMCS)
ICM Team: Triage
Team Email: amcsdev@microsoft.com
Resource Endpoints: 
   * https://australiasoutheast.frontend.control.monitor.azure.com/
   * https://canadacentral.frontend.control.monitor.azure.com/
   * https://polandcentral.frontend.control.monitor.azure.com/
   * https://southafricawest.frontend.control.monitor.azure.com/
   * https://japaneast.frontend.control.monitor.azure.com/
   * https://australiaeast.frontend.control.monitor.azure.com/
   * https://centralindia.frontend.control.monitor.azure.com/
   * https://germanywestcentral.frontend.control.monitor.azure.com/
   * https://northcentralus.frontend.control.monitor.azure.com/
   * https://southcentralus.frontend.control.monitor.azure.com/
   * https://eastus.frontend.control.monitor.azure.com/
   * https://centralus.frontend.control.monitor.azure.com/
   * https://westeurope.frontend.control.monitor.azure.com/
   * https://westus2.frontend.control.monitor.azure.com/
   * https://southeastasia.frontend.control.monitor.azure.com/
   * https://eastus2.frontend.control.monitor.azure.com/
   * https://uksouth.frontend.control.monitor.azure.com/
   * https://northeurope.frontend.control.monitor.azure.com/
   * https://westus.frontend.control.monitor.azure.com/
   * https://australiacentral.frontend.control.monitor.azure.com/
   * https://westcentralus.frontend.control.monitor.azure.com/
   * https://eastasia.frontend.control.monitor.azure.com/
   * https://ukwest.frontend.control.monitor.azure.com/
   * https://koreacentral.frontend.control.monitor.azure.com/
   * https://francecentral.frontend.control.monitor.azure.com/
   * https://southafricanorth.frontend.control.monitor.azure.com/
   * https://switzerlandnorth.frontend.control.monitor.azure.com/
   * https://brazilsouth.frontend.control.monitor.azure.com/
   * https://australiacentral2.frontend.control.monitor.azure.com/
   * https://brazilsoutheast.frontend.control.monitor.azure.com/
   * https://canadaeast.frontend.control.monitor.azure.com/
   * https://francesouth.frontend.control.monitor.azure.com/
   * https://koreasouth.frontend.control.monitor.azure.com/
   * https://norwaywest.frontend.control.monitor.azure.com/
   * https://uaenorth.frontend.control.monitor.azure.com/
   * https://japanwest.frontend.control.monitor.azure.com/
   * https://norwayeast.frontend.control.monitor.azure.com/
   * https://switzerlandwest.frontend.control.monitor.azure.com/
   * https://jioindiacentral.frontend.control.monitor.azure.com/
   * https://jioindiawest.frontend.control.monitor.azure.com/
   * https://swedensouth.frontend.control.monitor.azure.com/
   * https://swedencentral.frontend.control.monitor.azure.com/
   * https://germanynorth.frontend.control.monitor.azure.com/
   * https://southindia.frontend.control.monitor.azure.com/
   * https://westindia.frontend.control.monitor.azure.com/
   * https://eastus2euap.frontend.canary.control.monitor.azure.com/
   * https://centraluseuap.frontend.canary.control.monitor.azure.com/
   * https://uaecentral.frontend.control.monitor.azure.com/
   * https://westus3.frontend.control.monitor.azure.com/
   * https://qatarcentral.frontend.control.monitor.azure.com/

---
##Resource Type: actiongroups/networkSecurityPerimeterAssociationProxies
ICM Service: Azure Notification Service
ICM Team: Triage
Team Email: aznshot@microsoft.com
Resource Endpoints: 
   * https://eastus2euap.reto.canary.control.monitor.azure.com/
   * https://eastus2euap.reto.canary.control.monitor.azure.com/
   * https://northcentralus.reto.control.monitor.azure.com/

---
##Resource Type: actiongroups/networkSecurityPerimeterConfigurations
ICM Service: Azure Notification Service
ICM Team: Triage
Team Email: aznshot@microsoft.com
Resource Endpoints: 
   * https://eastus2euap.reto.canary.control.monitor.azure.com/
   * https://eastus2euap.reto.canary.control.monitor.azure.com/
   * https://northcentralus.reto.control.monitor.azure.com/

---
##Resource Type: dataCollectionEndpoints/networkSecurityPerimeterAssociationProxies
ICM Service: Azure Monitor Control Service (AMCS)
ICM Team: Triage
Team Email: amcsdev@microsoft.com
Resource Endpoints: 
   * https://eastus2euap.reto.canary.control.monitor.azure.com/
   * https://eastus2euap.reto.canary.control.monitor.azure.com/
   * https://northcentralus.reto.control.monitor.azure.com/

---
##Resource Type: dataCollectionEndpoints/networkSecurityPerimeterConfigurations
ICM Service: Azure Monitor Control Service (AMCS)
ICM Team: Triage
Team Email: amcsdev@microsoft.com
Resource Endpoints: 
   * https://eastus2euap.reto.canary.control.monitor.azure.com/
   * https://eastus2euap.reto.canary.control.monitor.azure.com/
   * https://northcentralus.reto.control.monitor.azure.com/

---
##Resource Type: privateLinkScopes
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://cds.applicationinsights.io/
   * https://cds.aimon.applicationinsights.io/

---
##Resource Type: privateLinkScopes/privateEndpointConnections
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://cds.applicationinsights.io/
   * https://cds.aimon.applicationinsights.io/

---
##Resource Type: privateLinkScopes/privateEndpointConnectionProxies
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://cds.applicationinsights.io/
   * https://cds.aimon.applicationinsights.io/

---
##Resource Type: privateLinkScopes/scopedResources
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://cds.applicationinsights.io/
   * https://cds.aimon.applicationinsights.io/

---
##Resource Type: components/linkedstorageaccounts
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://cds.applicationinsights.io/
   * https://cds.aimon.applicationinsights.io/

---
##Resource Type: privateLinkScopeOperationStatuses
ICM Service: Application Insights
ICM Team: Control Plane (CDS)
Team Email: TeamSword@microsoft.com
Resource Endpoints: 
   * https://cds.applicationinsights.io/
   * https://cds.aimon.applicationinsights.io/

---
##Resource Type: locations/notifyNetworkSecurityPerimeterUpdatesAvailable
ICM Service: Azure Monitor Control Service (AMCS)
ICM Team: Triage
Team Email: amcsdev@microsoft.com
Resource Endpoints: 
   * https://northcentralus.reto.control.monitor.azure.com/
   * https://eastus2euap.reto.canary.control.monitor.azure.com/

---

