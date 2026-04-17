---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/ARM Platform Core Concepts/ARM REST APIs"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20(ARM)%2FArchitecture%2FARM%20Platform%20Core%20Concepts%2FARM%20REST%20APIs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

## Introduction
All Azure clients communicate to Azure Resources Manager using REST API calls. These API calls consist of the HTTP method being used, the ARM endpoint, the scope the operation is being executed against, the action (for POST calls), and the API version used for the request.

Let's break down these components

## HTTP method
This is by no means an academic explanation of what the method is in an HTTP request, instead, this is an explanation of how the method is used in ARM API calls.

Being that ARM uses REST APIs, the HTTP method is used to indicate the action the client is executing against ARM.

ARM uses the following HTTP methods on their APIs:
- **GET:** To read.
- **PUT:** To create or replace.
- **PATCH:** To partially update.
- **DELETE:** To delete.
- **POST:** For additional actions specific to a resource (shutdown a VM, export a template, etc.).
- **HEAD:** Same as **GET**, but only reads the headers (no response body). This is optional for resource providers to implement, so this might not be supported depending on the resource type.

## ARM endpoint
This is the common endpoint to establish a connection to Azure Resource Manager. These endpoints only listen on port 443, so ensure the call is done using HTTPS as the protocol.

The endpoint may vary depending on the cloud the user is connecting to:

- **Public cloud:** https://management.azure.com.
- **Fairfax (Azure US gov cloud):** https://management.usgovcloudapi.net 
- **Mooncake (Azure China cloud):** https://management.chinacloudapi.cn.

## Scope
The scope indicates ARM against which management group, subscription, resource group or resource to execute a call against. The **scope**. If only the type is provided (managementGroups, subscriptions, resourceGroups or a resource type), but no resource name, the scope can be used to list (GET) the available entries for that resource type (For instance, listing the resource groups in a subscription).

Here are some examples of valid scope patterns:
- /providers/Microsoft.Management/managementGroups
- /providers/Microsoft.Management/managementGroups/{mgName}
- /providers/Microsoft.Management/managementGroups/{mgName}/providers/{RPNamespace}/{resourceType}
- /subscriptions
- /subscriptions/{subscriptionId}
- /subscriptions/{subscriptionId}/providers/{RPNamespace}/{resourceType}
- /subscriptions/{subscriptionId}/resourceGroups
- /subscriptions/{subscriptionId}/resourceGroups/{rgName}
- /subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/{RPNamespace}/{resourceType}
- /subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/{RPNamespace}/{resourceType}/{resourceName}
- /subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/{RPNamespace}/{resourceType}/{resourceName}/{resourceType2}
- /subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/{RPNamespace}/{resourceType}/{resourceName}/{resourceType2}/{resourceName2}
- /subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/{RPNamespace}/{resourceType}/{resourceName}/providers/{RPNamespace}{resourceType2}/{resourceName2}

Some of the patterns above refer to Child resource types and Extension resource types.

## Action
Some resource types offer specific actions to be executed, like restarting a VM, or exporting a template. Those actions require the use of the **POST** method, and the REST API call usually looks like this:

`POST {endpoint}/{resourceId}/{action}?api-version={apiVersionValue}`

## API version
API versions define the expected payload (either for request or response), that the API supports. RPs might release newer API versions to support additional features or deprecate all features (which might require adding or removing properties in the API payload).

The intent of API versions is to be able to release changes without breaking clients that are not ready to support those features.

API versions can also be used by the RPs to implement different backend behavior (execute a different code path) depending on the API version being used.

In Azure Resource Manager, the API versions can have different patterns, here are a few:
- {date}
- {date}-preview
- {date}-privatepreview
- {date}-alpha
