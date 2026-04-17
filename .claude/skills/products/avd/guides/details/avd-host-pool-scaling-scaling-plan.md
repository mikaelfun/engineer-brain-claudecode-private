# AVD AVD Host Pool 与缩放 - scaling-plan - Issue Details

**Entries**: 4 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. Error: ScalingPlan service address cannot be resolved when creating or assigning a scaling plan
- **ID**: `avd-ado-wiki-0870`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Scaling plan was created in an unsupported region
- **Solution**: Create scaling plan in a supported region
- **Tags**: autoscale, scaling-plan, region

### 2. Error 'Failed to assign host pool. Check the type of the host pool.' when assigning scaling plan
- **ID**: `avd-ado-wiki-0873`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Customer attempts to associate a scaling plan to a personal host pool; only pooled host pools are supported
- **Solution**: Assign the scaling plan to a pooled host pool instead of a personal host pool
- **Tags**: autoscale, scaling-plan, host-pool, personal

### 3. Error 'Host Pool cannot be assigned more than one Scaling Plan. Unassign the current plan before ass...
- **ID**: `avd-ado-wiki-0874`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Customer attempts to associate more than one scaling plan to the same host pool
- **Solution**: Unassign the current scaling plan first, or create a separate scaling plan for additional requirements
- **Tags**: autoscale, scaling-plan, host-pool

### 4. Error 'You cannot associate more than one schedule to a weekday' when adding a schedule to a scaling...
- **ID**: `avd-ado-wiki-0875`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Customer attempts to create a schedule for a day that already has an existing schedule assigned
- **Solution**: Remove the existing schedule for that weekday before adding a new one; cannot assign more than one schedule per weekday
- **Tags**: autoscale, scaling-plan, schedule
