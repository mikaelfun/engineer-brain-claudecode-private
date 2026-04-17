---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Escalations and procedures/MDC CRI Escalations procedure for CSS/Restricted CRIs - MTP Escalation & PG Teams"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Escalations%20and%20procedures/MDC%20CRI%20Escalations%20procedure%20for%20CSS/Restricted%20CRIs%20-%20MTP%20Escalation%20%26%20PG%20Teams"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Restricted CRIs - MTP Escalation & PG Teams

## Overview
Restricted CRIs are introduced due to compliance and data security requirements. They function like regular CRIs but include their own access control list (ACL) and a flag for Customer Support engagement.

## Key Concepts

### Definition
- Restricted CRIs have their own ACL and a CSS engagement flag
- Once created, their restricted status cannot be changed
- Visually identifiable by a 'restricted' label and longer incident number

### Rollout
- CSS continues to escalate using existing tools (ASC, Assist)
- Tools automatically transition CRIs to restricted CRIs
- Incidents created as live site/customer reporting in portal are NOT restricted CRIs

## Access Control

### Default Access
- Owning team and previous teams retain access
- Auto-invite rules grant access to specific teams
- Anyone who requests assistance or owns the support case is included

### Manual Access
- Non-invited users can request access via portal
- Request triggers email to team's DL
- Roles: Reader (view only), Contributor (modify but not ACL), Owner (full control)

### Executive Order Disallow List
- Individuals/teams on the disallow list receive "access denied" for restricted CRIs

## Searching Restricted CRIs

### Portal
- Legacy portal: create queries with specific fields (only accessible incidents visible)
- New portal: switch to see all restricted CRIs for searched teams

### Kusto
- Same default tables, but free-text fields are **redacted** (customer name, keywords, summary, custom fields)
- Automations relying on these fields must be updated
- Unredacted data access requires submission to ICM team (MSI applications only)

## Outages and Retrospectives
- Cannot be declared within restricted CRIs
- Must create a live site incident and link restricted CRIs to it
