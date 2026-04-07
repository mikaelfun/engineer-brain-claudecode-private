---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Sentinel Training/What is Sentinel"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FSentinel%20Training%2FWhat%20is%20Sentinel"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# What is Sentinel

Microsoft Sentinel is a cloud-native security information and event management (SIEM) platform that uses built-in AI to help analyze large volumes of data across an enterprise fast.

# Azure resources

The solution is consuming azure resources for supplying the business needs:

- Log Analytics workspaces - enables running queries on customer data
- Event hubs for asynchronic message processing
- Service buses for asynchronic message processing

# Services Access

We have 2 access points to the system:

### Public API access point (via ARM)
Sentinel is resource that must have resource provider
For callers not part of Sentinel solution

```
+-------------+         +-------+     +----------+         +----------+
|  API Call   +-------->+  ARM  | +-> | Resource | +-----> | Specific |
|             |         +-------+     | Provider |         | Service  |
+-------------+                       |   (API)  |         |          |
                                      +----------+         +------+---+
```

### Private (Internal) API Access point
For calls between internal Sentinel components

```
+-------------+         +-------------------+         +----------+
|  API Call   +-------- | Resource          |+----->  | Specific |
|             |         | Provider          |         | Service  |
+-------------+         | (Internal API)    |         |          |
                        +-------------------+         +------+---+
```

In general when executing an API call we rely on a backend database and not LA. This is true for the following types of requests:
- Alerts: data come from Graph Store (GS).
- Incidents: data might come from an internal Sentinel database or from Graph (under heavy development, can change).
- Entities: comes from GS.
- Threat Intelligence (TI) data: data comes from a backend cosmos DB and not from Log Analytics (LA).

Log Analytics (LA) is used as a reference when running KQL queries; for example in Analytic Rules or in the LA blade.

This is important to keep in mind because with bugs or outages data in LA can be out of sync.

# Alert gateway

Alerts Gateway (AG) is sentinel entry point of security alerts.

Sentinel is integrating with 1st and 3rd party security products that generates security alerts. In addition sentinel is provider of security alerts: Schedule and NRT.

Processing alerts steps:
* Validate Alert
* Filter alerts
* Enrich Alert
* Trim Alert if needed - to avoid being drop by LA due to size limit
* Send to output EH

AG is reading messages from the input EH. It process the alerts and writes the updated alerts to the output EH.

# Incidents

Also called Cases in Sentinel terminology.

With USX - UnifiedSecOps Sentinel becomes an alert provider and the incident creation is done by XDR. The incident than gets ingested in Sentinel and LA via the XDR connector.

# Analytics

Analytics management is responsible on managing the analytics rules in sentinel. Analytics rules are definition of Creating/Getting security alerts.

The query scheduling is managed by Sentinel. For each execution we first check how many events the query produces and then, if the condition is met, we run it again properly to collect all the details.

The query execution can be check in Draft (LA backend serving as a proxy for running any KQL query in LA/Kusto). However, because of the reason above, the specific queries that are executed are slightly different for optimization.

# Connectors

Connectors are used to connect data sources to Azure Sentinel Workspace in order to ingest data.

The ASI-Connectors application responsible for managing the different connector, verify the pre-requirements to each one and connecting the various connectors.

There are several types of data connectors, each type works differently.

1. Scuba-rule connectors - this type of connectors use Scuba to pull data into the LA workspace
   * Predefined scuba connector
   * API Pulling Codeless Connector
   * S3 Codeless connector
2. UI Only Connectors
   * Instructions (Syslog / CEF)
   * Azure Diagnostic Settings + Azure Policy (I.E. Azure Firewall, Azure SQL Service, Key vault)
   * UI with 3rd party client (I.E. Azure Activity, Defender 365)
   * UI with ARM templated
   * UI only Codeless Connector

There are several ways to create a connector:
1. Costume hard-coded connectors (V1):
   * hard-coded UI in the portal
   * hard-coded Rule in the ASI-Connectors
2. Schema based connectors (V2):
   * GenericUI (describe the UI in the portal)
   * API-Poller (describe the Rule)

## Components

* Connectors ARM API
* SCUBA Router
* Diagnostic Settings + Azure Policy connectors
* Log Analytics In-Mem - The old transformations pipeline of LA
* Log Analytics GT - The new transformations pipeline of LA
* OMS Agent (Deprecated) - The old Syslog/CEF agent. Linux only.
* AMA Agent (both Windows and Linux) - The new Syslog/CEF agent (in Linux).
* Shoe-Box - A common mechanism in Azure to ingest data into Log Analytics from various resources
* Log Stash / Azure Sentinel Plugin

# What is Scuba

SCUBA (aka SIPS Platform) provides a cloud scale ingestion, detection, enrichment, publishing, and investigation platform in support of near real time and warm path security analytics for both 1st party and 3rd party products and SOCs.

Key capabilities:
- **Ingestion:** Scuba ingests raw events from multiple sources at cloud scale with low latency
  - 1P: Internal Azure (SDS/Poller from Geneva)
  - 3P: ASC, Sentinel & Partners (MCAS, AIP, ASC for IoT etc)
    - In-mem Ingestor: from Log Analytics
    - Connectors for Azure Sentinel: Cloud and Product Log connectors
    - Generic: Configurable Bring-Your-Own Cloud and Product Connectors via REST APIs (Codeless connectors)
- **Filter/Transform/Enrichment:** Alerts Graph Store for Azure Sentinel
- **Routing:** V3 Exchange Router between Microsoft Security Products
- **Publishing:** To Kusto, IcM, Log Analytics

## SCUBA OMSGenericPublisher

The SCUBA OMSGenericPublisher consumes events from Sentinel Event Hubs and sends them to Log Analytics using the Log Analytics Ingestion API.

Two main flows:
- Main Flow: reads from Event Hub, publishes to LA workspace. Success rate ~99.5%.
- Retry Flow: handles failed events slowly, higher latency (minutes to hours). Messages retried multiple times before being dropped.

Error Types:
- **Retriable Errors**: Temporary issues (network issues, Service Unavailable, DNS Errors, Internal Server Error)
- **Non-Retriable Errors**: Permanent issues (Invalid Customer ID, Inactive Customer, Invalid Log Type, Entity Too Large, Forbidden)

# What is GraphStore (GS)

Subcomponent of Scuba. See section about Scuba.

# Alert and incident ingestion

Key points:
- XDR manages alerts and incidents based on alert providers
- Scuba manages ingestion of alerts/incidents from XDR
- Some alerts may not come directly from XDR (dedicated connectors)
- After ingestion: alerts go to workspace, Graph Store, automation engine
- Incidents sent to Case ingestor service (for Sentinel Incidents API)

# UEBA

User and Entity Behavior Analytics - detects anomalous behavior by profiling normal user conduct.

## Components
* Type tagger - filters/normalizes events
* Enricher - resolves entities, enriches events
* Statistical analyzer - profiles entities, calculates statistics
* Replicator - replicates statistics data
* Entity metadata syncer - periodic metadata refresh
* Watchlist syncer - periodic watchlist sync
* Scope task runner - periodic tasks (offboard after 90 days, re-sync entities)
* AAD syncer/AD syncer - sync entity changes from MDI/AAD
* Entity store ingestor - ingests to entities database and IdentityInfo table
* Management API - onboard/offboard customers
* Scuba Router - routes events based on routing rules

# Azure Resource Provider (ARM)

ARM provides a single endpoint for consistent CRUD operations.
- Each RP known to ARM via Manifest
- Built-in: Authentication, Authorization, RBAC, Traffic management, Throttling, Audit/Logging

## Resource Types
- **Tracked resource**: e.g., workspace under Microsoft.OperationalInsights
- **Extension resource**: e.g., alertRules under Microsoft.SecurityInsights extending a workspace
- **Nested resource**: e.g., comments of an incident

## API Versioning
- Naming: `{year}-{month}-01` (`-preview` if needed)
- Preview retirement: 3 months notice
- Stable retirement: 3 years notice
- New Preview every 3 months, new Stable every 6 months

## RBAC Roles
- Reader, Contributor, Owner (built-in)
- Custom roles per team

# Log Analytics (LA)

## Ingestion Flow
1. Four data sources: Agents, OBO/Shoebox, Data Collector API, Scuba/Security, Data Puller
2. ODS/GIG - ingestion gateway, routes between InMem and GT pipelines
3. InMem/GT - transformation (logical model <-> physical model)
4. Event Hubs
5. PSS - reads from EH, writes to Kusto clusters
6. KCM - determines tenant/workspace/schema placement in Kusto cluster

## Experience Flow
1. Portal - user interface for querying data
2. Draft - service enabling KQL queries on data, calls CMS for schema/transformation

## Control Plane
AMS/DAS - customer workspace metadata

# Microsoft Integrations

- Microsoft Defender XDR (Extended Detection & Response) - SCC portal: https://security.microsoft.com
- Microsoft USX (Unified Security Experience) - Sentinel + XDR + Exposure Management + AI in Defender portal
- Microsoft Entra - identity and network access (formerly AAD)
- Microsoft Sentinel - SIEM
- Microsoft Security Copilot - generative AI security
