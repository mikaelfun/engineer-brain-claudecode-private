---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Copilot TSGs for Review/Create Custom Tables with Schema Tab and Lineage in Data Map"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Copilot%20TSGs%20for%20Review/Create%20Custom%20Tables%20with%20Schema%20Tab%20and%20Lineage%20in%20Data%20Map"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Create Custom Tables with Schema Tab and Lineage in Data Map

Author: Wilson Wang

## Overview

To create custom tables along with Schema tab (with columns) and Lineage in Microsoft Purview Data Map, follow these end-to-end API sequences:

1. Create custom table type definition and table instances
2. Create custom column type definition and column instances
3. Define and create the schema relationship (attach columns to tables)
4. Establish lineage between custom tables

## API Steps

### 1. Create Table Type Definition

```
POST https://[account name].purview.azure.com/catalog/api/atlas/v2/types/typedefs
```

Body must include:
- `category: "ENTITY"`, `superTypes: ["DataSet"]`
- `options.schemaElementsAttribute: "columns"`
- `relationshipAttributeDefs` with `ownedRef` constraint and `relationshipTypeName`

### 2. Create Column Type Definition

```
POST https://[account name].purview.azure.com/catalog/api/atlas/v2/types/typedefs
```

- `superTypes: ["DataSet"]`
- Attribute: `datatype` (string)
- Relationship back to table with `cardinality: "SINGLE"`

### 3. Create Schema Relationship Type

```
POST https://[account name].purview.azure.com/catalog/api/atlas/v2/types/typedefs
```

- `relationshipCategory: "COMPOSITION"`
- endDef1: table (container, SET), endDef2: column (SINGLE)

### 4. Create Table Asset

```
POST https://[account name].purview.azure.com/catalog/api/atlas/v2/entity
```

### 5. Create Column Asset

```
POST https://[account name].purview.azure.com/catalog/api/atlas/v2/entity
```

### 6. Attach Column to Table (Schema Relationship)

```
POST https://[account name].purview.azure.com/catalog/api/atlas/v2/relationship/
```

### 7. Establish Lineage Between Tables

```
POST https://[account name].purview.azure.com/datamap/api/atlas/v2/relationship
```

Use `typeName: "direct_lineage_dataset_dataset"`

## Common Pitfalls

- Ensure `qualifiedName` values are unique in your tenant
- Run type definitions (steps 1-3) before creating assets (steps 4-5)
- Use **catalog** API for assets and schema relationship; use **datamap** API for lineage
- If using private endpoints, verify network/DNS resolution to Purview endpoints
- For bulk creation, script retries and idempotency checks (409 on duplicate qualifiedNames)

## References

- [Custom types API](https://learn.microsoft.com/en-us/purview/data-gov-api-custom-types)
- [Create lineage relationships](https://learn.microsoft.com/en-us/purview/data-gov-api-create-lineage-relationships)
