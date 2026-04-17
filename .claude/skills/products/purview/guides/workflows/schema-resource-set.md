# Purview Schema 与资源集 — 排查工作流

**来源草稿**: `ado-wiki-check-ars-enabled.md`, `ado-wiki-custom-tables-schema-lineage.md`
**Kusto 引用**: 无
**场景数**: 12
**生成日期**: 2026-04-07

---

## Scenario 1: Kusto Query
> 来源: ado-wiki-check-ars-enabled.md | 适用: 未标注

### 排查步骤
Use the below query on `babylon.eastus2.kusto.windows.net` / `babylonMdsLogs`:

```kql
PipelineManagerLogEvent  
| where CatalogId == "<catalog-id>"
| where Message contains "ARS Setting"
| project TIMESTAMP, Message  
| order by TIMESTAMP desc
```

`[来源: ado-wiki-check-ars-enabled.md]`

---

## Scenario 2: Interpretation
> 来源: ado-wiki-check-ars-enabled.md | 适用: 未标注

### 排查步骤
In the Message column, it will either say:
- **"ARS Setting Default"** → ARS is **disabled**
- **"ARS Setting Advanced"** → ARS is **enabled**

`[来源: ado-wiki-check-ars-enabled.md]`

---

## Scenario 3: Overview
> 来源: ado-wiki-custom-tables-schema-lineage.md | 适用: 未标注

### 排查步骤
To create custom tables along with Schema tab (with columns) and Lineage in Microsoft Purview Data Map, follow these end-to-end API sequences:

1. Create custom table type definition and table instances
2. Create custom column type definition and column instances
3. Define and create the schema relationship (attach columns to tables)
4. Establish lineage between custom tables

`[来源: ado-wiki-custom-tables-schema-lineage.md]`

---

## Scenario 4: 1. Create Table Type Definition
> 来源: ado-wiki-custom-tables-schema-lineage.md | 适用: 未标注

### 排查步骤
```
POST https://[account name].purview.azure.com/catalog/api/atlas/v2/types/typedefs
```

Body must include:
- `category: "ENTITY"`, `superTypes: ["DataSet"]`
- `options.schemaElementsAttribute: "columns"`
- `relationshipAttributeDefs` with `ownedRef` constraint and `relationshipTypeName`

`[来源: ado-wiki-custom-tables-schema-lineage.md]`

---

## Scenario 5: 2. Create Column Type Definition
> 来源: ado-wiki-custom-tables-schema-lineage.md | 适用: 未标注

### 排查步骤
```
POST https://[account name].purview.azure.com/catalog/api/atlas/v2/types/typedefs
```

- `superTypes: ["DataSet"]`
- Attribute: `datatype` (string)
- Relationship back to table with `cardinality: "SINGLE"`

`[来源: ado-wiki-custom-tables-schema-lineage.md]`

---

## Scenario 6: 3. Create Schema Relationship Type
> 来源: ado-wiki-custom-tables-schema-lineage.md | 适用: 未标注

### 排查步骤
```
POST https://[account name].purview.azure.com/catalog/api/atlas/v2/types/typedefs
```

- `relationshipCategory: "COMPOSITION"`
- endDef1: table (container, SET), endDef2: column (SINGLE)

`[来源: ado-wiki-custom-tables-schema-lineage.md]`

---

## Scenario 7: 4. Create Table Asset
> 来源: ado-wiki-custom-tables-schema-lineage.md | 适用: 未标注

### 排查步骤
```
POST https://[account name].purview.azure.com/catalog/api/atlas/v2/entity
```

`[来源: ado-wiki-custom-tables-schema-lineage.md]`

---

## Scenario 8: 5. Create Column Asset
> 来源: ado-wiki-custom-tables-schema-lineage.md | 适用: 未标注

### 排查步骤
```
POST https://[account name].purview.azure.com/catalog/api/atlas/v2/entity
```

`[来源: ado-wiki-custom-tables-schema-lineage.md]`

---

## Scenario 9: 6. Attach Column to Table (Schema Relationship)
> 来源: ado-wiki-custom-tables-schema-lineage.md | 适用: 未标注

### 排查步骤
```
POST https://[account name].purview.azure.com/catalog/api/atlas/v2/relationship/
```

`[来源: ado-wiki-custom-tables-schema-lineage.md]`

---

## Scenario 10: 7. Establish Lineage Between Tables
> 来源: ado-wiki-custom-tables-schema-lineage.md | 适用: 未标注

### 排查步骤
```
POST https://[account name].purview.azure.com/datamap/api/atlas/v2/relationship
```

Use `typeName: "direct_lineage_dataset_dataset"`

`[来源: ado-wiki-custom-tables-schema-lineage.md]`

---

## Scenario 11: Common Pitfalls
> 来源: ado-wiki-custom-tables-schema-lineage.md | 适用: 未标注

### 排查步骤
- Ensure `qualifiedName` values are unique in your tenant
- Run type definitions (steps 1-3) before creating assets (steps 4-5)
- Use **catalog** API for assets and schema relationship; use **datamap** API for lineage
- If using private endpoints, verify network/DNS resolution to Purview endpoints
- For bulk creation, script retries and idempotency checks (409 on duplicate qualifiedNames)

`[来源: ado-wiki-custom-tables-schema-lineage.md]`

---

## Scenario 12: References
> 来源: ado-wiki-custom-tables-schema-lineage.md | 适用: 未标注

### 排查步骤
- [Custom types API](https://learn.microsoft.com/en-us/purview/data-gov-api-custom-types)
- [Create lineage relationships](https://learn.microsoft.com/en-us/purview/data-gov-api-create-lineage-relationships)

`[来源: ado-wiki-custom-tables-schema-lineage.md]`

---
