---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/Support Boundaries"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Azure%20Monitor/Support%20Boundaries"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
---
Azure Monitor provides a number of platforms for other Azure products to leverage and as a result there are a wide range of areas where the responsibility for support is unclear between CSS PODS.  This article aims to identify the boundaries of support between Azure Monitor and other groups within CSS.

## Why do we need this?
The Azure Monitor team has expertise in troubleshooting the various platforms but does not have the appropriate expertise in the manner in which those platforms are utilized by other Azure technologies.  Ensuring the customer receives support from the appropriate expert at the appropriate time is extremely important.

# Activity Logs
---
:::template /.templates/SupportBoundaries-ActivityLogs.md
:::

# Agents
---

:::template /.templates/SupportBoundaries-Agents.md
:::

# Alerts and Action Groups
---
See article [Alerts Support Boundaries](/Alerts/Support-Boundaries.md) for more details.

Note that Alerts support boundaries are a work in progress and further boundaries will be added at future dates. 

# Application Insights
---
See article [Application Insights Support Boundaries](/Application-Insights/Support-Boundaries.md) for more details.

# Autoscale
---
:::template /.templates/SupportBoundaries-Autoscale.md 
:::

# Carbon Optimization
---
:::template /.templates/SupportBoundaries-CarbonOptimization.md
:::

# Billing
---
:::template /.templates/SupportBoundaries-Billing.md
:::

# Change Analysis
---
See article [Change Analysis Support Boundaries](/Change-Analysis/Support-Boundaries.md) for more details.

# Data Collection Rules (DCRs)
---
:::template /.templates/SupportBoundaries-DataCollectionRules.md
:::

# Log Analytics
---

See article [Support Boundaries](/Log-Analytics/Support-Boundaries) on the Log Analytics wiki.

[Support Boundaries]

# Metrics
---
:::template /.templates/SupportBoundaries-Metrics.md
:::

# Resource Health and Service Health
---
:::template /.templates/SupportBoundaries-ResourceAndServiceHealth.md
:::

# Resource Logs and Diagnostic Settings
---
:::template /.templates/SupportBoundaries-DiagnosticSettings.md
:::

# Insights (aka Azure Monitor Insights, Resource Insights)
---
:::template /.templates/SupportBoundaries-Insights.md
:::

# Workbooks
---
:::template /.templates/SupportBoundaries-Workbooks.md
:::

# Azure Resource Manager (ARM) Templates
---
:::template /.templates/SupportBoundaries-ARM.md
:::

# Azure Resource Manager (ARM) Bicep
---
:::template /.templates/SupportBoundaries-Bicep.md
:::

# Terraform
---
:::template /.templates/SupportBoundaries-Terraform.md
:::

# Azure Policy
---
:::template /.templates/SupportBoundaries-Policy.md
:::

# Custom Solutions, Code and Scripting
---
:::template /.templates/SupportBoundaries-CustomSolutions.md
:::

# Partner Solutions
---
:::template /.templates/SupportBoundaries-PartnerSolutions.md
:::

# Managed Grafana
---
See article [Azure Managed Grafana Support Boundaries](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1521047/Support-Boundaries) for more details.

# Managed Prometheus
---
:::template /.templates/SupportBoundaries-ManagedPrometheus.md
:::

# Monitor Pipeline
---
**The Azure Monitor team is responsible for the following:**

1. Issues related to enabling\configuring Edge Pipeline
2. Issues related to data collection scenarios (VM insights,Container Insights). 
3. Issues related to transformation. 
4. Issues related to DCR\DCE
5. Issues related to Exporter

 - Support Topic: Azure Monitor Pipeline

**The AKS team is responsible for the following:**

1. Issues related to AKS 
 - Support Topic: Kubernetes service(AKS) 

**The Azure Arc Enabled Kubernetes team is responsible for the following:**
1. issues related to Arc for Kubernetes

- Support topic: Azure Arc enabled Kubernetes

# Services Hub Health Assessments and Health Checks
---
:::template /.templates/SupportBoundaries-ServicesHub.md
:::
