---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Architecture/How control plane effects work"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FArchitecture%2FHow%20control%20plane%20effects%20work"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## GET operations
### Resource GET
This is an API call to get a specific resource information. This will be used when the **name** and **type** conditions are provided in the policy definition (only in the details section of a definition). Example API call:
> `GET https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/{providerNamespace}/{resourceType}/{resourceName}`

### Collection GET
A collection GET call allows getting an **array of resources** in a single response, instead of doing one resource GET per each one of the resources in the assignment scope.

Policy can do different types of Collection GET calls depending on the scope of the policy.

- Collection GET on Resource Group: Used when the policy assignment scope is a resource group.
> `GET https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/{providerNamespace}/{resourceType}`

- Collection GET on Subscription: Used when the policy assignment scope is a subscription or a management group.
> `GET https://management.azure.com/subscriptions/{subscriptionId}/providers/{providerNamespace}/{resourceType}`

### AINE/DINE details section GET
For **AINE/DINE** details, if no name property is provided in the AINE/DINE policy details section, a collection GET is triggered. A resource GET will be triggered if the **name** property is provided. 

There are three places where Policy would trigger those GET requests.

#### Child resources
If the resource type in **then.details**, is a child of the resource evaluated on the **if section**, the collection GET or resource GET is done using the **if section** evaluated resource as the parent.

For example, a policy that checks if a VM named testvm has a specific extension (determining that based on an existence condition), would trigger the following collection GET API call:
> `GET https://management.azure.com/subscriptions/{subscriptionId}/resourcegroups/{resourceGroup}/providers/Microsoft.Compute/virtualMachines/testvm/extensions`

Or, if a **name** property is provided, a resource GET is executed instead for the child extension:
> `GET https://management.azure.com/subscriptions/{subscriptionId}/resourcegroups/{resourceGroup}/providers/Microsoft.Compute/virtualMachines/testvm/extensions/vmextension`

#### Extension resources
If the resource type in **then.details**, has **routingType** *extension* (See [[ADO] Resource routing types](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623758)) on the resource provider manifest, the collection GET or resource GET is done using the **if** evaluated resource as the first part of the url.

For example, a policy that checks if an EventHub namespace named *myEH* has any diagnosticSettings enabled, would trigger the following collection GET API call for the extension resources:
> `GET https://management.azure.com/subscriptions/{subscriptionId}/resourcegroups/{resourceGroup}/providers/Microsoft.EventHub/namespaces/myEH/providers/Microsoft.Insights/diagnosticSettings`

Or, if a **name** property is provided, a resource GET for the extension resource is executed instead:
> `GET https://management.azure.com/subscriptions/{subscriptionId}/resourcegroups/{resourceGroup}/providers/Microsoft.EventHub/namespaces/myEH/providers/Microsoft.Insights/diagnosticSettings/myDiagnostics`

#### Resources that are not child nor extension resources
If the resource type in **then.details**, is not a child resource of the **if** evaluated resource, nor has **routingType** *extension*, policy will use the **existenceScope** property to perform the collection GET or resource GET.

> Reminder: When not provided, the **existenceScope** value defaults to *resourceGroup*.

For example, a policy that checks that for a given VM, there is a networkSecurityGroup on the same resource group, would trigger the following collection GET API call:
> `GET https://management.azure.com/subscriptions/{subscriptionId}/resourcegroups/{resourceGroup}/providers/Microsoft.Network/networkSecurityGroups`

Or, if a **name** property is provided, a resource GET is executed instead:
> `GET https://management.azure.com/subscriptions/{subscriptionId}/resourcegroups/{resourceGroup}/providers/Microsoft.Network/networkSecurityGroups/myNSG`

As you can see, in both the collection GET and resource GET samples above, there is no reference to the scanned **if section** resource.

## On Greenfield:
Greenfield evaluation occurs during a **PATCH** or **PUT** request, on the scope where the policy is assigned. When a policy is recently assigned, users might have to wait up to 30 minutes for greenfield evaluation to occur. See [[ARCH] Greenfield vs Brownfield - Greenfield](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623660/Greenfield-vs-Brownfield?anchor=greenfield) for additional details.

For **PATCH** requests (partial updates), Policy will GET the current payload for that resource, merge the incoming payload changes, and evaluate the result of that against the policy conditions.

For **PUT** requests, full resource payload is expected, so Policy only evaluates the incoming request payload.

### Audit
If the conditions are met, an entry is recorded in the Activity Log. A **brownfield** scan is also triggered for the specific resource.

### Deny
The operation is denied with a code 403 if the conditions of the policy definition are met. A **brownfield** scan is also triggered for the specific resource.

### Append
If the conditions are met, the append details are merged with the incoming payload, and sent to the Resource Provider. A **brownfield** scan is also triggered for the specific resource.

### Modify
If the conditions are met, the modify settings are applied on the incoming payload, and then sent to the Resource Provider. A **brownfield** scan is also triggered for the specific resource.

### AuditIfNotExists
#### If section of the policy
If the **if section** conditions are met, a reevaluation is scheduled 10 minutes after the initial evaluation to determine if the **then.details** conditions are met.

#### AINE details section of the policy 
10 minutes after the PUT/PATCH operation (unless `evaluationDelay` property specifies a custom time window), a GET is triggered for the AINE details resource/resources. If not a single one of the **then.details** section scanned resources meets the criteria, an entry is recorded in the Activity Log. An AINE **brownfield** scan is also triggered for the specific **if section** scanned resource.

> Do not confuse **AuditIfNotExists** with "Audit if exists". **AINE** can not audit a resource based on the existence of another resource, only on the **absence** of another resource that has certain conditions.

### DeployIfNotExists
#### If section of the policy
If the **if section** conditions are met, a reevaluation is scheduled 10 minutes after the initial evaluation to determine if the **then.details** conditions are met. 

#### DINE details section of the policy 
10 minutes after the PUT/PATCH operation (unless `evaluationDelay` property specifies a custom time window), a GET is triggered for the DINE details resource/resources. If not a single one of the **then.details** section scanned resources meets the criteria, an entry is recorded in the Activity Log, and a deployment is created with the template section of the policy (This is also called automatic remediation). The deployment name starts with *"PolicyDeployment_"* and it uses the managed identity of the assignment for deployment (the evaluation uses the initial caller's identity). Once the deployment finishes, a DINE **brownfield** scan (Resource GET) is triggered for the specific **if section** scanned resource.

### Manual
Manual policies do not have a greenfield implementation.

### DenyAction
The call is analyzed in ARM for applicability (resource applicability + denyAction effect properties). For any applicable call/resource a GET call can be issued to the RP to retrieve the resource properties. For any resource that meets the conditions in the definition, the operation will be denied.

DenyAction considerations:
- A call is only issued to the RP if the properties the definition evaluates are not present in the ARM cache (non top level properties or proxy resource payload).
- If a GET call is issued, the api-version used will be the same one from the incoming DELETE call (unless the api-version for the resource type is not available, as in a RG DELETE scenario. In that case, the GET call will use the latest api-version available in manifest).
- If a resource is missing from ARM cache, Policy will let the operation go through. However, ARM does not forward DELETE calls to the RPs.
- If the GET call to the RP returns 404, Policy will let the incoming ARM call being evaluated go through. Any other response code failures will result in evaluation failure which will block the operation.
- If Policy needs to execute a GET call to retrieve the resource content (see first bullet point), **{resourceType}/read** permissions are required on the identity that initiated the incoming ARM call being evaluated.

## On Brownfield:
A full brownfield scan is triggered automatically when an assignment is created (it might 15-30 minutes to complete) and then, a full daily scan is executed on the assignment scope. Additional brownfield scans might occur for created/updated resources as indicated in the Greenfield section above.

### Audit
A GET is triggered on assignment scope, each resource that meets the definition conditions is flagged as non-compliant.

### Deny
A GET is triggered on assignment scope, each resource that meets the definition conditions is flagged as non-compliant.

### Append 
A GET is triggered on assignment scope, each resource that meets the definition conditions is flagged as non-compliant. There are no changes applied on the resource.

### Modify 
A GET is triggered on assignment scope, each resource that meets the definition conditions is flagged as non-compliant. There are no changes applied on the resource.

Customer has the option to create a manual remediation task, which creates a PATCH request to each one of the non-compliant resources, to update the tags according to the policy definition modify details. Then a modify **brownfield** scan (Resource GET) is triggered on the remediated resources to reflect the new compliance state.

### AuditIfNotExists
A GET is triggered on assignment scope. For each one of the resources that meets the policy **if section** conditions, a resource GET or collection GET is triggered for the **then.details** resource/resources. If not a single one of the existence **then.details** scanned resources meets the criteria, the **if section** scanned resource, is set as non-compliant.

> Do not confuse **AuditIfNotExists** with "Audit if exists". **AINE** cannot audit a resource based on the existence of another resource, only on the **absence** of another resource that has certain conditions.

### DeployIfNotExists
A GET is triggered on assignment scope. For each one of the resources that meets the policy **if section** conditions, a resource GET or collection GET is triggered for the **then.details** resource/resources. If not a single one of the existence **then.details** scanned resources meets the criteria, the **if section** scanned resource, is set as non-compliant.

Customer has the option to create a manual remediation task, which creates a deployment with the template section of the policy (This is also called manual remediation). The deployment name starts with *"PolicyDeployment_"*. Once the deployment finishes, a DINE **brownfield** scan (Resource GET) is triggered on the **if section** scanned resource.

### Manual
On manual effect, brownfield execution only covers applicability. The resources that meet the policy criteria are considered for policy compliance, but compliance is not determined by the brownfield scan.

Compliance for manual policies is determined by the default value provided on the definition, unless an attestation is provided for the resource. See [[ARCH] Manual attestation policies](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623662) for more information.

### DenyAction
A GET is triggered on assignment scope, each resource that meets the definition conditions is flagged as **Protected**. There are no changes applied on the resource.
