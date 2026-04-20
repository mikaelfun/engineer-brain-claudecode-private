# AVD AVD Host Pool 与缩放 - scaling-plan - Quick Reference

**Entries**: 8 | **21V**: all applicable
**Keywords**: autoscale, by-design, configuration, host-pool, off-peak, personal, rbac, region, scaling-plan, schedule, session-host, throttling, vm-start-stop
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Error: ScalingPlan service address cannot be resolved when creating or assigning... | Scaling plan was created in an unsupported region | Create scaling plan in a supported region | 🟢 8.0 | ADO Wiki |
| 2 📋 | Error 'Failed to assign host pool. Check the type of the host pool.' when assign... | Customer attempts to associate a scaling plan to a personal host pool; only pool... | Assign the scaling plan to a pooled host pool instead of a personal host pool | 🟢 8.0 | ADO Wiki |
| 3 📋 | Error 'Host Pool cannot be assigned more than one Scaling Plan. Unassign the cur... | Customer attempts to associate more than one scaling plan to the same host pool | Unassign the current scaling plan first, or create a separate scaling plan for a... | 🟢 8.0 | ADO Wiki |
| 4 📋 | Error 'You cannot associate more than one schedule to a weekday' when adding a s... | Customer attempts to create a schedule for a day that already has an existing sc... | Remove the existing schedule for that weekday before adding a new one; cannot as... | 🟢 8.0 | ADO Wiki |
| 5 📋 | Error 'The value must be after/before <XYZ>' when configuring scaling plan sched... | Customer specifies non-contiguous or overlapping times for Ramp-up, Peak, Ramp-d... | Fix scaling plan so schedule times are contiguous and non-overlapping | 🟢 8.0 | ADO Wiki |
| 6 📋 | Error 'No schedules defined for one or more days of a week' during scaling plan ... | Customer did not specify a schedule for one or more days of the week | Scaling plan must include an associated schedule for at least one day of the wee... | 🟢 8.0 | ADO Wiki |
| 7 📋 | One session host always remains running even when scaling plan is configured to ... | By design: if an active, disconnected, or pending session exists on a VM, Autosc... | This is expected behavior documented in the public FAQ (https://docs.microsoft.c... | 🟢 8.0 | ADO Wiki |
| 8 📋 | VMs fail to start or stop during autoscale operations | Multiple possible causes: incorrect scaling plan configuration, missing RBAC per... | 1) Verify scaling plan configuration is correct; 2) Confirm RBAC permissions for... | 🔵 7.0 | ADO Wiki |

## Quick Triage Path

1. Check: Scaling plan was created in an unsupported region `[Source: ADO Wiki]`
2. Check: Customer attempts to associate a scaling plan to a personal ... `[Source: ADO Wiki]`
3. Check: Customer attempts to associate more than one scaling plan to... `[Source: ADO Wiki]`
4. Check: Customer attempts to create a schedule for a day that alread... `[Source: ADO Wiki]`
5. Check: Customer specifies non-contiguous or overlapping times for R... `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-host-pool-scaling-scaling-plan.md#troubleshooting-flow)