---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Foundational and Specialist Troubleshooting/Autoscale Performance Recommendations"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FAutoscale%20Performance%20Recommendations"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Autoscale Performance Recommendations

[[_TOC_]]

## Overview

This wiki details why CE&S (formerly CSS) should **not** make autoscale performance recommendations. Currently this impacts **Application Gateway v2** technologies but the underlying principles apply to any future autoscaling technology.

## Official Recommendations

### Premier and Unified Customers
Check with Account team for available proactive hours; leverage a CSA if possible. Else, CSAM may have other resources or Professional resources.

### Professional Customers
Refer to [Microsoft Consulting Services](https://www.microsoft.com/en-us/msservices) for additional assistance in proactive infrastructure planning.

## Why CE&S Should NOT Make These Recommendations

1. **Recommendations are personalized to the application and environment** — no single calculator applies
2. **The number of variables is large and calculations are complex** — must account for: RPS, workload type/consistency, application optimization, network utilization, resource utilization
3. **Attempts lead to poor customer satisfaction** — engineers cannot predict all scenarios from a silo of information

### Key Variables to Understand

- How many requests per second or per minute?
- How many users? What type of traffic?
- Is traffic resource-intensive on frontend? On backend?
- Will the network be the bottleneck?

## When a Customer Asks for Autoscale Sizing

**Do not provide specific min/max instance counts.** Instead:
1. Refer **Premier/Unified** customers to their CSA via CSAM/IM+
2. Refer **Professional** customers to [Microsoft Consulting Services](https://www.microsoft.com/en-us/msservices)
3. The **Application Developer** should be the primary resource from the customer side — they have inner knowledge of requirements

## Why a Generic Calculator Cannot Be Built

- A web page + SQL backend + SharePoint (100 front ends doing workflow tasks) scales very differently than the same setup serving static content
- FTP server in the datapath adds bandwidth-driven scaling vs CPU-driven scaling
- 10 users at 15% CPU usage does NOT linearly scale — bottlenecks shift between CPU, memory, network at different scales
- IoT device sending 250,000 small UDP requests/sec requires far fewer instances than 250,000 large HTTP requests/sec

## Resources to Engage

| Resource | How to Access |
|---|---|
| Cloud Solution Architect (CSA) | Via CSAM / IM+ |
| Microsoft Consulting Services | https://www.microsoft.com/en-us/msservices |
| Application Developer (customer side) | Direct customer engagement |
