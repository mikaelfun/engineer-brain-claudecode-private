# Investigate Unexpected Cost Increases in Log Analytics

> Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/log-analytics/billing/identify-service-cause-unexpected-costs)

## Overview
Tutorial for investigating daily billing anomalies and identifying services causing unexpected costs.

## Steps
1. Navigate to Log Analytics workspace → View Cost → Cost Analysis
2. Open **Services** and **Daily costs** tabs
3. Set date range to Last 3 months for trend visibility
4. Group by **Meter category** to see per-service cost contribution
5. Select stacked bar on anomalous dates to identify the offending service

## Key Insight
Cost spikes are often caused by linked services (e.g., Azure Grafana, Sentinel, AKS) sending bursts of data, not by the Log Analytics workspace configuration itself. After identifying the service, investigate that service's data generation patterns.

## 21V Applicability
Applicable - Cost Analysis available in 21Vianet portal.
