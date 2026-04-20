# AVD AVD Host Pool 与缩放 - scaling-plan - Comprehensive Troubleshooting Guide

**Entries**: 8 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Error: ScalingPlan service address cannot be resolved when creating or... | Scaling plan was created in an unsupported region | Create scaling plan in a supported region |
| Error 'Failed to assign host pool. Check the type of the host pool.' w... | Customer attempts to associate a scaling plan to a personal host pool;... | Assign the scaling plan to a pooled host pool instead of a personal ho... |
| Error 'Host Pool cannot be assigned more than one Scaling Plan. Unassi... | Customer attempts to associate more than one scaling plan to the same ... | Unassign the current scaling plan first, or create a separate scaling ... |
| Error 'You cannot associate more than one schedule to a weekday' when ... | Customer attempts to create a schedule for a day that already has an e... | Remove the existing schedule for that weekday before adding a new one;... |
| Error 'The value must be after/before <XYZ>' when configuring scaling ... | Customer specifies non-contiguous or overlapping times for Ramp-up, Pe... | Fix scaling plan so schedule times are contiguous and non-overlapping |
| Error 'No schedules defined for one or more days of a week' during sca... | Customer did not specify a schedule for one or more days of the week | Scaling plan must include an associated schedule for at least one day ... |
| One session host always remains running even when scaling plan is conf... | By design: if an active, disconnected, or pending session exists on a ... | This is expected behavior documented in the public FAQ (https://docs.m... |
| VMs fail to start or stop during autoscale operations | Multiple possible causes: incorrect scaling plan configuration, missin... | 1) Verify scaling plan configuration is correct; 2) Confirm RBAC permi... |

### Phase 2: Detailed Investigation

#### Entry 1: Error: ScalingPlan service address cannot be resolved when c...
> Source: ADO Wiki | ID: avd-ado-wiki-0870 | Score: 8.0

**Symptom**: Error: ScalingPlan service address cannot be resolved when creating or assigning a scaling plan

**Root Cause**: Scaling plan was created in an unsupported region

**Solution**: Create scaling plan in a supported region

> 21V Mooncake: Applicable

#### Entry 2: Error 'Failed to assign host pool. Check the type of the hos...
> Source: ADO Wiki | ID: avd-ado-wiki-0873 | Score: 8.0

**Symptom**: Error 'Failed to assign host pool. Check the type of the host pool.' when assigning scaling plan

**Root Cause**: Customer attempts to associate a scaling plan to a personal host pool; only pooled host pools are supported

**Solution**: Assign the scaling plan to a pooled host pool instead of a personal host pool

> 21V Mooncake: Applicable

#### Entry 3: Error 'Host Pool cannot be assigned more than one Scaling Pl...
> Source: ADO Wiki | ID: avd-ado-wiki-0874 | Score: 8.0

**Symptom**: Error 'Host Pool cannot be assigned more than one Scaling Plan. Unassign the current plan before assigning a new one.'

**Root Cause**: Customer attempts to associate more than one scaling plan to the same host pool

**Solution**: Unassign the current scaling plan first, or create a separate scaling plan for additional requirements

> 21V Mooncake: Applicable

#### Entry 4: Error 'You cannot associate more than one schedule to a week...
> Source: ADO Wiki | ID: avd-ado-wiki-0875 | Score: 8.0

**Symptom**: Error 'You cannot associate more than one schedule to a weekday' when adding a schedule to a scaling plan

**Root Cause**: Customer attempts to create a schedule for a day that already has an existing schedule assigned

**Solution**: Remove the existing schedule for that weekday before adding a new one; cannot assign more than one schedule per weekday

> 21V Mooncake: Applicable

#### Entry 5: Error 'The value must be after/before <XYZ>' when configurin...
> Source: ADO Wiki | ID: avd-ado-wiki-0871 | Score: 8.0

**Symptom**: Error 'The value must be after/before <XYZ>' when configuring scaling plan schedule times (e.g. Ramp-up at 10AM, Peak at 9AM)

**Root Cause**: Customer specifies non-contiguous or overlapping times for Ramp-up, Peak, Ramp-down, and Off-Peak hours

**Solution**: Fix scaling plan so schedule times are contiguous and non-overlapping

> 21V Mooncake: Applicable

#### Entry 6: Error 'No schedules defined for one or more days of a week' ...
> Source: ADO Wiki | ID: avd-ado-wiki-0872 | Score: 8.0

**Symptom**: Error 'No schedules defined for one or more days of a week' during scaling plan creation or update

**Root Cause**: Customer did not specify a schedule for one or more days of the week

**Solution**: Scaling plan must include an associated schedule for at least one day of the week

> 21V Mooncake: Applicable

#### Entry 7: One session host always remains running even when scaling pl...
> Source: ADO Wiki | ID: avd-ado-wiki-0877 | Score: 8.0

**Symptom**: One session host always remains running even when scaling plan is configured to shut down all VMs during off-peak/ramp-down hours

**Root Cause**: By design: if an active, disconnected, or pending session exists on a VM, Autoscaling will always consolidate to the fewest hosts possible but will never reach zero while a session is present

**Solution**: This is expected behavior documented in the public FAQ (https://docs.microsoft.com/en-us/azure/virtual-desktop/autoscale-faq). Educate customer that zero session hosts requires all sessions to be terminated first

> 21V Mooncake: Applicable

#### Entry 8: VMs fail to start or stop during autoscale operations
> Source: ADO Wiki | ID: avd-ado-wiki-0876 | Score: 7.0

**Symptom**: VMs fail to start or stop during autoscale operations

**Root Cause**: Multiple possible causes: incorrect scaling plan configuration, missing RBAC permissions on subscription, service-side issues, or VMs excluded via maintenance tagging

**Solution**: 1) Verify scaling plan configuration is correct; 2) Confirm RBAC permissions for autoscale service on subscription; 3) Check for maintenance tags on VMs excluding them from scaling; 4) Review RDOperation Kusto logs for RDScaling failures

> 21V Mooncake: Applicable

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
