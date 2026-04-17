# Identify Why Daily Cap Was Exceeded

> Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/log-analytics/billing/why-daily-cap-exceeded)

## Overview
Guide to using workspace Insights to identify root cause when daily cap is exceeded.

## Steps
1. Navigate to Log Analytics workspace → Monitoring → Insights
2. Set Time Range to **Last 24 hours**
3. Check **Ingestion Volume** vs **Daily Usage / Cap setting**
4. Review **Ingestion Anomalies** section for unusual patterns
5. Select **Usage** tab → drill into top-ingesting tables
6. Select specific table row to see **Ingestion Statistics by Resource**
7. Identify the specific resource causing high ingestion

## Diagnostic Flow
- Ingestion Volume > Daily Cap → investigate which table
- Top table identified (e.g. AVSSyslog, AzureDiagnostics) → drill into resource
- Specific resource identified → investigate why it generates excessive logs

## 21V Applicability
Applicable - Insights feature available in 21Vianet.
