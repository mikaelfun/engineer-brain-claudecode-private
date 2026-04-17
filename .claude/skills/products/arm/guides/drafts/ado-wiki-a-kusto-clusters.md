---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Observability/Kusto Clusters"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FObservability%2FKusto%20Clusters"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Kusto Clusters

## Overview
Kusto Clusters are the foundational compute and storage units behind Azure Data Explorer (ADX), designed for high-performance, distributed data analytics. In Azure Local or hybrid environments, Kusto Clusters can be used to power telemetry, diagnostics, and operational insights.

## Relevance to Readiness
- **Telemetry and diagnostics**: Enables scalable ingestion and querying of logs and metrics.
- **Disconnected operations**: Supports local data analysis when cloud connectivity is limited.
- **Infrastructure replication**: Ensures consistent observability across environments.
- **Security and compliance**: Facilitates controlled access to operational data.

## Key Concepts
- **Cluster Endpoint**: The URI used to connect to the Kusto service for queries and ingestion.
- **Databases**: Logical containers within a cluster that store structured telemetry data.
- **Retention Policies**: Define how long data is stored and when it is purged.
- **Query Language (KQL)**: A powerful syntax for querying large volumes of structured data.

## Internal Guidance
- Use the internal wiki to locate the correct Kusto endpoints for your environment.
- Ensure role-based access control (RBAC) is configured for secure access to clusters.
- Validate ingestion pipelines and retention policies during readiness testing.
- Document cluster configurations, endpoints, and database schemas for audit and troubleshooting.

## Internal Reference
https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/1665147/Kusto-Endpoints
