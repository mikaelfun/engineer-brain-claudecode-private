# AVD 性能 — 排查工作流

**来源草稿**: ado-wiki-resource-performance.md
**Kusto 引用**: (无)
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Resource performance on Endpoint Analytics
> 来源: ado-wiki-resource-performance.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Resource performance report helps IT monitor end user performance of the Cloud PC device in their environment based on compute resources, CPU and RAM.
The report helps IT admins to understand the overall score, trends over time, provides insights and remediations to improve performance, provides granularity at SKU (CPC Model) and device level while providing insights on the apps that cause the device to underperform.
This report is available on the MEM portal for customers with Cloud PC licenses in their tenant.
**Getting started guide:**
   - Enroll your device to Endpoint analytics Quickstart - Enroll Intune devices
   - Set your baseline: Endpoint analytics settings
   - There are four pages in Resource perf report on Endpoint analytics:
a. Landing page: Resource performance
b. Model performance page
c. Device performance page
d. Device history page
**Scoring:** The **Resource score** is a number between 0 and 100. This score is a weighted average of CPU spike time and RAM spike time scores. A score of 100 means that you are doing really well and 0 means that you are doing poorly on end user experience.

## Scenario 2: A. Landing page: Resource performance Score
> 来源: ado-wiki-resource-performance.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. The Resource score provides an overall score of your tenant
2. Baseline helps you understand if you are meeting goals and you can set your baseline to Organizational median or set your own organizational baseline
3. Resource score is an aggregation of CPU spike time score and RAM Spike time score
4. CPU spike time and RAM spike time scores are provided individually compared against baselines to understand underlying concerns, either from CPU or RAM
5. Daily metric trend (30 days) helps you get a trend of your CPU and RAM spike percentage (%) over time. This allows the admin to reduce noise over a day and see the performance over time
6. Insights and Recommendations provide insights on the number of devices that are above the average spike time % on RAM and CPU. In addition, it will also allow admins to take upgrade actions for devices.

## Scenario 3: B. Model performance page
> 来源: ado-wiki-resource-performance.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Review the CPU and RAM spike time percentage and scores by cloud PC model type (SKU) in your organization.
1. Filter by **device count** to see how many devices you have by the SKU types
2. Filter by **CPU, RAM spike time %** or scores to see if a particular SKU type in your organization is facing issues or CPU and RAM scores are low across all SKUs

## Scenario 4: D. Device history
> 来源: ado-wiki-resource-performance.md | 适用: \u901a\u7528 \u2705

### 排查步骤
When you click on a particular device you will get granular information on the device:
1. Resource Score for that device
2. CPU and RAM spike time history over time
3. Top 5 process impacting CPU and RAM spike times
