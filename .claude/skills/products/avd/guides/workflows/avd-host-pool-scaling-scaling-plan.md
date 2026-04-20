# AVD Host Pool 与缩放 - scaling-plan — Troubleshooting Workflow

**Scenario Count**: 8
**Generated**: 2026-04-18

---

## Scenario 1: Error: ScalingPlan service address cannot be resolved when c...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Create scaling plan in a supported region

**Root Cause**: Scaling plan was created in an unsupported region

## Scenario 2: Error 'Failed to assign host pool. Check the type of the hos...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Assign the scaling plan to a pooled host pool instead of a personal host pool

**Root Cause**: Customer attempts to associate a scaling plan to a personal host pool; only pooled host pools are supported

## Scenario 3: Error 'Host Pool cannot be assigned more than one Scaling Pl...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Unassign the current scaling plan first, or create a separate scaling plan for additional requirements

**Root Cause**: Customer attempts to associate more than one scaling plan to the same host pool

## Scenario 4: Error 'You cannot associate more than one schedule to a week...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Remove the existing schedule for that weekday before adding a new one; cannot assign more than one schedule per weekday

**Root Cause**: Customer attempts to create a schedule for a day that already has an existing schedule assigned

## Scenario 5: Error 'The value must be after/before <XYZ>' when configurin...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Fix scaling plan so schedule times are contiguous and non-overlapping

**Root Cause**: Customer specifies non-contiguous or overlapping times for Ramp-up, Peak, Ramp-down, and Off-Peak hours

## Scenario 6: Error 'No schedules defined for one or more days of a week' ...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Scaling plan must include an associated schedule for at least one day of the week

**Root Cause**: Customer did not specify a schedule for one or more days of the week

## Scenario 7: One session host always remains running even when scaling pl...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- This is expected behavior documented in the public FAQ (https://docs.microsoft.com/en-us/azure/virtual-desktop/autoscale-faq). Educate customer that zero session hosts requires all sessions to be terminated first

**Root Cause**: By design: if an active, disconnected, or pending session exists on a VM, Autoscaling will always consolidate to the fewest hosts possible but will never reach zero while a session is present

## Scenario 8: VMs fail to start or stop during autoscale operations
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1) Verify scaling plan configuration is correct; 2) Confirm RBAC permissions for autoscale service on subscription; 3) Check for maintenance tags on VMs excluding them from scaling; 4) Review RDOperation Kusto logs for RDScaling failures

**Root Cause**: Multiple possible causes: incorrect scaling plan configuration, missing RBAC permissions on subscription, service-side issues, or VMs excluded via maintenance tagging
