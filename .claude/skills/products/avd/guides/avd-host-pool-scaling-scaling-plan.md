# AVD AVD Host Pool 与缩放 - scaling-plan - Quick Reference

**Entries**: 4 | **21V**: all applicable
**Keywords**: autoscale, host-pool, personal, region, scaling-plan, schedule
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Error: ScalingPlan service address cannot be resolved when creating or assigning... | Scaling plan was created in an unsupported region | Create scaling plan in a supported region | 🔵 7.5 | ADO Wiki |
| 2 | Error 'Failed to assign host pool. Check the type of the host pool.' when assign... | Customer attempts to associate a scaling plan to a personal host pool; only pool... | Assign the scaling plan to a pooled host pool instead of a personal host pool | 🔵 7.5 | ADO Wiki |
| 3 | Error 'Host Pool cannot be assigned more than one Scaling Plan. Unassign the cur... | Customer attempts to associate more than one scaling plan to the same host pool | Unassign the current scaling plan first, or create a separate scaling plan for a... | 🔵 7.5 | ADO Wiki |
| 4 | Error 'You cannot associate more than one schedule to a weekday' when adding a s... | Customer attempts to create a schedule for a day that already has an existing sc... | Remove the existing schedule for that weekday before adding a new one; cannot as... | 🔵 7.5 | ADO Wiki |

## Quick Triage Path

1. Check: Scaling plan was created in an unsupported region `[Source: ADO Wiki]`
2. Check: Customer attempts to associate a scaling plan to a `[Source: ADO Wiki]`
3. Check: Customer attempts to associate more than one scali `[Source: ADO Wiki]`
4. Check: Customer attempts to create a schedule for a day t `[Source: ADO Wiki]`
