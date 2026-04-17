# Monitor 指标告警规则

**Entries**: 18 | **21V**: ALL | **Sources**: 2
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | VM metric alert triggered but portal metric chart shows value did not exceed ... | 1) Time granularity in portal metric chart is too large, causing peak values ... | 1) Set metric chart time granularity to 1 minute when comparing with alert ru... | 9.0 | OneNote |
| 2 | Metric alert fires falsely or misses firing; metric value differs between red... | Red-Black mismatch in Geneva Metrics: metric data is not identical on both in... | In ASC evaluation logs, add the second instance (-red or -black suffix) to th... | 8.5 | ADO Wiki |
| 3 | Metric alert fired when it should not have (false alert); metric value at eva... | Late arriving metric data: metric ingestion latency exceeded the 3-minute buf... | Check MetricDelay Jarvis dashboard (https://jarvis-west.dc.ad.msft.net/dashbo... | 8.5 | ADO Wiki |
| 4 | Metric alert remains in fired state and does not resolve automatically when t... | Metric time series still meets condition within 3 consecutive evaluation peri... | Metric alert resolves when condition not met for 3 consecutive evaluations (e... | 8.5 | ADO Wiki |
| 5 | Availability test alert fires unexpectedly (false positive); customer believe... | Mismatch between Azure Portal metric chart settings and alert rule configurat... | 1) In Azure Portal, open the fired alert and review "Why did this alert fire?... | 8.5 | ADO Wiki |
| 6 | Metric alert fired as false alert; metric chart shows different value than ev... | Time granularity in the metric chart does not match the alert rule's period/e... | Ensure the metric chart's Time Granularity field matches the alert rule's per... | 8.5 | ADO Wiki |
| 7 | Metric alert fires unexpectedly or stays in fired state constantly; evaluatio... | Resource Provider has FillGapsWithZero=false (ValueOnNull property), causing ... | Check the ValueOnNull property in the alert rule's monitor configuration via ... | 8.5 | ADO Wiki |
| 8 | Metric alert fired as false alert; plotting metric now shows different values... | Red-Black mismatch — a transient issue in backend metric storage systems wher... | Use the MetricDelay dashboard to identify Red-Black mismatch (see How to iden... | 8.5 | ADO Wiki |
| 9 | Metric alert fired with incorrect metric values; evaluation log shows one val... | Late arriving data — metric ingestion latency exceeds the 3-minute wait windo... | Verify late arriving data using the MetricDelay dashboard. Provide customer R... | 8.5 | ADO Wiki |
| 10 | Metric alert didn't resolve when it should have - metric value is below thres... | Metric alerts require 3 consecutive healthy evaluations to resolve. If any ev... | Verify in ASC Execution History that 3 consecutive healthy evaluations have o... | 8.5 | ADO Wiki |
| 11 | Metric alert didn't fire but evaluation shows threshold violated — alert is a... | Metric alerts are stateful. If the alert fired previously and was never resol... | Check 'Last Fired' in ASC. Review extended metric chart since last fired time... | 8.5 | ADO Wiki |
| 12 | Metric alert missed — evaluation data shows different values than metric char... | Resource provider has FillGapsWithZero=false configuration, causing Azure Mon... | Check evaluation logs for 'SkipOnNoDataException' message. The FillGapsWithZe... | 8.5 | ADO Wiki |
| 13 | Metric alert missed — metric chart now shows values meeting threshold but eva... | Red-Black mismatch: a transient issue in one of the backend systems responsib... | Follow 'How to identify Red-Black mismatch causing false or missed metric ale... | 8.5 | ADO Wiki |
| 14 | Metric alert missed — evaluation log shows metric value not meeting threshold... | Late arriving data: metric ingestion latency exceeds the 3-minute wait time b... | Verify using the MetricDelay dashboard. Provide customer communication templa... | 8.5 | ADO Wiki |
| 15 | Query-based metric alert (PromQL criteria) didn't resolve when expected | Auto-resolve is set to false on the alert rule, making it stateless — the ale... | Check alert rule properties in ASC for 'auto-resolve' and 'time for resolutio... | 8.5 | ADO Wiki |
| 16 | Query-based metric alert (PromQL) didn't resolve — expression still returns v... | The alert condition is still being met. The PromQL expression continues to re... | Validate the expression in ASC or Managed Grafana. The condition must be in u... | 8.5 | ADO Wiki |
| 17 | Metric alert did not resolve - metric below threshold but alert still in fire... | Metric alerts require 3 consecutive healthy evaluations to resolve. If any ev... | Verify in ASC Execution History that 3 consecutive healthy evaluations occurr... | 8.5 | ADO Wiki |
| 18 | Customer reports they did not receive an expected alert notification when the... | Two possible causes: (a) the alert rule did not fire because the failure thre... | 1) In ASC, navigate to the metric alert associated with the availability test... | 8.5 | ADO Wiki |

> This topic has fusion troubleshooting guide with detailed workflow
> [Full troubleshooting workflow](details/alert-metric.md)
