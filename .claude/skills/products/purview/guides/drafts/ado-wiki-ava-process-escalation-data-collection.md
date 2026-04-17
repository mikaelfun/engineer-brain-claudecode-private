---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Processes/Escalation/Ava/AVA Process"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FProcesses%2FEscalation%2FAva%2FAVA%20Process"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AVA/IcM Escalation Data Collection Guide

> Check for Known Issues and try to search keywords in AVA channel before opening a new Ava thread. If it is confirmed the same issue, and we have RCA/Solution already, just deliver the information to cx.

## Portal UI

- Issue Background (Whole Picture, Navigation thread, issue existed before or not) with screenshots
- Tenant ID, Region (note down if part of ongoing outage/bug/known issue)
- Affected user permissions
- The Error message
- Browser Trace (.HAR file)
- Your analysis from the .har file
- Reproduced in your environment or not reproducible
- Clear PG Ask

## Roles and Permissions

- Issue Background (Whole Picture, issue existed before or not) with screenshots
- Affected user permissions
- Browser Trace (.HAR file)
- Your analysis from the .har file
- Reproduced in your environment or not reproducible
- Clear PG Ask

## Data Sources

- Issue Background (Purview Networking, Source Networking, Source Registration Details, Scan Ruleset if not system rules, Issue existed before or not) with screenshots
- If networking is not public, collect their PE configurations.
- Affected user permissions
- The Error message
- Documented comparison of cx scenario with source documentation
- Test-Net Connections and Network Trace Package Capture (if using SHIR, from Machine hosting SHIR)
- Does DNS team need to be involved or not
- Browser Trace (.HAR file)
- Your analysis from the .har file
- Reproduced in your environment or not reproducible
- Clear PG Ask

## Scan/IR

- Issue Background (Purview Networking, Source Networking, Source Registration Details, Scan Ruleset if not system rules, Issue existed before or not). Combine the documentation with their configuration steps and provide screenshots.
- If networking is not public, collect their PE configurations.
- If ongoing Outage/Bug: Tenant ID, Region
- Affected user permissions
- The Error message
- Scan Run ID
- If applicable: SHIR Report ID with troubleshooting package turned on.
- Your analysis from the Scan and Report ID logs
- Reproduced in your environment or not reproducible
- Clear PG Ask

### If Source Configuration Issues (scan fails to connect)

See Data Sources Section + capture browser trace and provided analysis on .HAR file.

### If Scan Configuration Issues — compare cx scenario with source documentation

- Authentication Method, its credential permissions
- Integration Runtime Type, its documented steps of set up
- Other details depending on the source being scanned

### If Scan taking too long

- Completion time, assets discovered/ingested, source, scan configuration
- Number of SHIR Nodes & memory (if applicable)
- Other scans running in parallel or shortly after
- Download scan logs if available

## Data Map

- Issue Background (Asset FQN, overview, schema, lineage panes). Combine the documentation with their configuration steps and provide screenshots.
- If ongoing Outage/Bug: Tenant ID, Region
- Affected user permissions
- The Error message
- Browser Trace with your analysis on the .har file
- Reproduced in your environment or not reproducible
- Clear PG Ask

### Schema not captured

- Scan Rule Sets applied if not system rules
- Collect the schema customer expects to see that is present on their original source
- Search logs for the schema and provide those findings

### Lineage not captured

- From Scan: Check Data lineage user guide
- Is Lineage a supported feature for the data source
- Is it column/attribute level lineage vs asset-level automatic/manual lineage
- Does the lineage exist in sources
- From ADF: Follow ADF connection documentation
- From Synapse: Follow Synapse connection documentation

### Classifications not applied

- Are classifications supported for the data source
- System Classifications or Custom Classifications
- Scan Rule Sets applied if not system rules
- Did cx abide by the scan rule logic (schema or keyword correlation + 8 distinct values minimum)

### Sensitivity Labels not applied

- Are sensitivity labels supported for the data source

### Assets not being ingested

- Do they form part of a Resource Set
- Has 24 hours elapsed from last successful scan
- Search logs for the asset name

### Assets not updated

- Check asset scan breadcrumbs, compare scan config to the source
- Does asset still exist in the original data source
- Check if Asset has been moved prior to scan

## Unified Catalog

### Domains (Roles and Permissions)

- Permissions to create/manage Domains, Data Products, CDEs, access reviews
- Browser trace + HAR analysis
- Clear PG Ask

### Data Products

- Permissions to create/manage Domains, Data Products, data access requests
- If unable to manage Assets: permissions, error, browser trace, check "Dependencies" documentation
- Clear PG Ask

### Glossary Terms and OKRs

- Issue with adding/removing, importing/exporting, managing term policies
- Related terms or CDEs, OKR management
- Browser trace + HAR analysis
- Clear PG Ask

### Data Quality and Data Profiling

- Source Connection config, Purview Permissions, DQ Scan/Profiling Job config, Rules
- Error message of Failed Profiling Job/Data Quality Scan
- What are they scanning/profiling? Are these supported? FQN and asset type
- Ensure DQ Troubleshooting public documentation was investigated
- Clear PG Ask

### Schema blank or columns missing

- Was the schema imported from the DQ page? Was this refreshed?
- Was the column name changed? Rules use the column name as the key

### DEH Reports and Insights

- Controls, Reports in DQ Page, Actions, or Reports
- Classic Reports Type or Data Governance Report Type
- Self-Serve Analytics permissions
- Browser trace + HAR analysis
- Clear PG Ask

## Less Common Areas

### Workflow

- Granting access to DPs or publishing DPs/Glossary terms
- Required permissions, documented limitations
- Browser trace + HAR analysis

### Azure Audit

- Scope: compliance auditing vs Azure Audit Logs
- Audit enabled? Event hub enabled? Required permissions?
- Verify logged items within supported Azure Audit Logs list

### API

- Which API, purpose, documentation compliance
- Response/payload, script, certificate/token expiry, reproducibility

### Billing

- Which feature causing billing concern, amount charged, business impact
- Identify billing meter
- Verify charges vs historical through Billing Logs
