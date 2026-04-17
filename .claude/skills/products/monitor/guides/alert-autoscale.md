# Monitor alert-autoscale

**Entries**: 6 | **21V**: ALL | **Sources**: 1
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Application performance degradation or unexpected autoscale events suspected ... | Profiler runs approximately 2 minutes per hour and adds 5-15% CPU overhead du... | Verify if performance issue timing correlates with Profiler execution using H... | 8.5 | ADO Wiki |
| 2 | Autoscale is not taking any scale actions (scale out or scale in) when expected. | The Autoscale Setting is disabled (Enabled = false). No evaluations or scale ... | Check the Autoscale Setting configuration in ASC under Properties tab. Verify... | 6.0 | ADO Wiki |
| 3 | Autoscale is not taking scale actions during a specific timeframe, even thoug... | The active Autoscale Profile recurrence schedule does not cover the expected ... | Review Autoscale Profile(s) in ASC Profiles tab. Verify: (1) profile recurren... | 6.0 | ADO Wiki |
| 4 | Autoscale evaluation shows MetricFailures or unable to retrieve metrics, and ... | Autoscale was unable to retrieve the target metrics during evaluation. The de... | Use Metrics How-To Guide in ASC to check if the metric has data for the same ... | 6.0 | ADO Wiki |
| 5 | All Scale In (decrease) conditions are triggered but Autoscale does not scale... | Anti-flapping logic is engaged. Autoscale runs capacity projections for each ... | Analyze Autoscale trace logs (JobTraces by ActivityId). After Scale In Estima... | 6.0 | ADO Wiki |
| 6 | Autoscale logged that it took a scale action but the actual instance count di... | The Autoscale service submitted the scale request to ARM, but the Resource Pr... | Verify instance count unchanged by checking trace logs from next ActivityId a... | 6.0 | ADO Wiki |
