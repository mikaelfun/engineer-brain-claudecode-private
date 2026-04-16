# [AKS] Understanding Percentile in Container Insights

**Source:** MCVKB/VM+SCIM/18.27  
**Type:** Educational Reference  
**Product:** AKS / Azure Monitor Container Insights  
**Date:** 2021-09-11

## Overview

When reviewing AKS performance data in Azure Portal → Container Insights, the metric selector shows: **Min / Avg / 50th / 90th / 95th / Max**. This guide explains what these mean.

## Percentile Definition

A **percentile** is a value below which a given percentage of data points fall.

| Metric | Meaning |
|--------|---------|
| **Min** | Lowest observed value |
| **Avg** | Arithmetic mean of all values |
| **50th** (Median) | 50% of samples are below this value |
| **90th** | 90% of samples are below this value; top 10% exceed it |
| **95th** | 95% of samples are below this value; top 5% exceed it |
| **Max** | Highest observed value |

## Example

Array of 20 values: `2, 2.1, 2.5, 3, 3.4, 3.4, 4, 4, 4, 4, 5, 5, 5, 5.9, 5.91, 6.8, 8, 10, 60, 98`

| Metric | Value | Explanation |
|--------|-------|-------------|
| Min | 2 | Smallest |
| Avg | 12.1 | Sum/count |
| 50th | 4 | 10th of 20 items |
| 90th | 10 | 18th of 20 items |
| 95th | 60 | 19th of 20 items |
| Max | 98 | Largest |

> **Why Avg alone is misleading:** Avg=12.1, but 95% of data ≤60. One outlier (98) skews the average significantly. Use 90th/95th for capacity planning.

## Use Case in Container Insights

When checking **CPU/memory usage** of AKS nodes or containers:
- **90th percentile** = 90% of the time, usage is below this threshold
- Useful for sizing: provision resources to handle the 90th or 95th percentile to avoid OOM/throttle during peak load while not over-provisioning for rare spikes

## Reference

- Container Insights analysis: https://docs.azure.cn/en-us/azure-monitor/containers/container-insights-analyze
- Wikipedia Percentile: https://en.wikipedia.org/wiki/Percentile
