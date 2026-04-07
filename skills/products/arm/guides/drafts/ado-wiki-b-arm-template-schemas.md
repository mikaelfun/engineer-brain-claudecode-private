---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/ARM Templates, Bicep & Deployments/ARM template schemas"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FArchitecture%2FARM%20Templates%2C%20Bicep%20%26%20Deployments%2FARM%20template%20schemas"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## JSON schemas
Schemas are not something that was built for ARM templates specifically, they belong to JSON.

JSON structure is predefined by brackets, braces, commas, properties and values, but the **schema** is optional. It determines what properties a JSON file can have, what the type is for each property and what values are allowed on those properties. A JSON file can be built with or without a schema, but a JSON that references a schema forces a specific structure of properties and values on that file.

A schema is defined in JSON with the following property:

```json
{
   "$schema":"yourSchemaUrl.json"
   ...
```

A schema is also a JSON file, that describes the structure of properties and values of other JSON files that reference it.

A file editor with schema support, uses the schema to validate the file, throw warnings and flag errors when the properties defined in the template are not compatible with what the schema describes.

To learn more about JSON schemas, visit [JSON Schema - Getting Started](https://json-schema.org/learn).

## Schemas in ARM templates

An ARM template is nothing more than a JSON file. A schema for an ARM template is nothing more than a regular schema. From functionality perspective, ARM templates do not reinvent the wheel when it comes to schema, but they take full advantage of its technical functionality.

ARM templates have a very defined structure, which makes them processable by the ARM template engine. This structure covers the top level properties like the parameters, variables, resources array and outputs, but extends to the specific structure of each resource type and its corresponding API versions.

The [[GH] ARM template schema repository](https://github.com/Azure/azure-resource-manager-schemas) contains all the generic ARM template schema structure, and all resource type specific schemas for resource specific validation.

Through schemas, ARM template authoring can be validated from client side, providing real time feedback to users while they define their resources and configurations. ARM template schemas, also allow the engine to understand what kind of template is being passed for processing, since the supported JSON structure varies depending on the deployment scope (tenant, management group, subscription or resource group).
