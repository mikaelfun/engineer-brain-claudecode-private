---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/Training/[Trainer only] ARM foundations training outline"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2FTraining%2F%5BTrainer%20only%5D%20ARM%20foundations%20training%20outline"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

> Note to trainer: There are no slides for this content, the delivery is done with VS code as it requires modifying the content on screen dynamically, plus Portal, Kusto and other tools needed to cover specific topics.

> This training is encouraged not only for the ARM vertical, but for any engineer joining the PaaS developer POD.

> Estimated duration for this training is 6 to 8 hours.

## ARM intro
- Cover what ARM is at a very high level (5 minute explanation or less).

## Resource ids
- Explain how each resource in Azure has its own unique identifier. Cover that management groups came later and they are not part of the resource ids (but they have their own ids).
- How to find the resource id in Portal (properties blade in resource view, browser URI in resource view).

## APIs
- How to go from resource id to API (adding ARM endpoint in front).
- HTTP methods used by Azure (include PUT vs PATCH usages).

### API versions
- Why we use API versions (Give sample of how applications would break if we didn't).
- How API versions are used in ARM REST APIs and how they are always required.
- How to find API version if you do not have it (Pass any value, response will provide valid API versions, this can be shown in Postman on the prep for lab 1).
- Remove it from screen to facilitate rest of the demo, but clarify it's always required.

### GET call
- With a resource id, ask the audience what the GET call for that resource would return.
- Start removing segments from the URL and keep asking the audience/explaining what each URI would return (APIs in ARM are modular).

### Lab 1
#### Prep for lab 1
- Ask audience to install Postman.
- Show audience how to "steal" an auth token from Portal, and where to set it in Postman. Also cover briefly that the "right" away to authenticate Postman is to create a service principal for it (don't go into details, this is covered in Dev POD basics, Postman session).

#### Execution of lab 1
- Ask audience to use any resource in Portal (they can create a storage account if they don't have any resource), get the resource id, plus the auth token trick, and do a GET call on that resource from Postman.

### Lab 2
- Ask the audience to list all resources in a RG (have them research online how to do it).

### Swaggers and Azure REST API reference
- Explain what a swagger is and why they are useful. Show [[GH] REST API Specifications repo](https://github.com/Azure/azure-rest-api-specs) and how a swagger looks like.
- Explain how those swaggers are processed into useful documentation to generate the [[LEARN] Azure REST API reference](https://learn.microsoft.com/en-us/rest/api/azure/). Show the doc pages for a couple of APIs and scroll through the content (URI, parameters, request body, response body, expected responses, etc.).

### Lab 3
- Using the REST API reference only, ask the audience to create a storage account from Postman. Stay available to address questions/blockers.
- Once the storage account is created, ask the audience to do a GET call on the resource they just created.

### Optional/Read-Only properties and Async calls

- Based on the last GET audience made, point out how the properties they used for PUT are less than the properties returned on GET. Cover how there are properties that are read-only, but also properties that are optional that take a default value if not specified on creation.
- PUT for Storage Accounts returns 202. Use this to explain that some calls are async, and how a 202 is not a success nor a failure. Explain async call flow and also cover how we use the `Location` header returned in the response to query on the operation status.

### API pagination
- Explain what API pagination is and the use of `nextLink` in Azure API responses.

### REST APIs and troubleshooting.
- Explain REST API is commonly used for troubleshooting.
- Explain debug switches for other clients (-debug, --debug, Fiddler?).

### Batch calls
- Explain that only Portal uses it.
- Explain how it works and how a call within the batch might have a different status code than the batch call itself. Call out paying attention to this when reviewing a trace.

## ARM templates
- Cover briefly what ARM templates are and some of their advantages/use cases.

### Schemas and Azure resource reference
- Explain what is a JSON schema. Show [[GH] ARM schemas repo](https://github.com/Azure/azure-resource-manager-schemas) and how a schema looks like.
- Explain how those swaggers are processed into useful documentation to generate the [[LEARN] Azure resource reference](https://learn.microsoft.com/en-us/azure/templates/).
- Cover briefly what Bicep is (explain it is processed into regular JSON ARM templates).

### Lab 4
- Ask the audience to take the [[LEARN] ARM template training](https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/template-tutorial-create-first-template?tabs=azure-powershell). Steps 1 through 6 and then 9 and 10.

### Lab 5
- Ask the audience to create an automation account using only the ARM template reference (Azure resource reference).

> While audience is working on Lab 5, trainer goes to portal and creates a storage account from the wizard.

### Nested and linked templates
- Explain the concept of deployment, and how deployments are resources.
- Since they are resources, they can be created in a template. Cover linked templates and nested templates showing the documentation and samples given there.

### Deployment modes
- Explain the Incremental and Complete deployment modes.

### ARM architecture
- Explain architecture and tables.
- Explain the flow of calls from/in Incoming/Outgoing.
- Explain web/worker roles (web = calls from API; worker = jobs (including deployments)).

### Correlation id (using the previous deployment created for the storage account)
- Explain what the correlation id is (callout to the response header in API, and debug traces from other tools having it).
- Show the template for the storage account deployment, then the calls in HttpIncomingRequests.
- Show and explain HttpOutgoingRequests and Deployments table using same correlation id.
- Cover EventServiceEntries table (trainer can drop the correlation id and just search for some errors from any subscription in the last hour to demonstrate what kind of data we get from EventServiceEntries).

### Troubleshooting
- Cover how an engineer can query Kusto even if there is no correlation id, use all the data you get from the case.

#### Throttling
- Explain what throttling is.
- Cover how to tell apart RP vs ARM throttling (referencing Incoming vs Outgoing tables and http status 429), no need to demo this.

#### Latency
- Cover `durationInMiliseconds` column in Incoming vs Outgoing.
- How to tell apart delays caused by ARM vs delays caused by RP (Incoming has the total duration/Outgoing has the duration the RP took. Difference between those to indicates the source).
