# AKS Mooncake 运维特殊处理 -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 2
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Container images from us.gcr.io not accessible in Azure China (Mooncake); AKS de... | Google Container Registry domains blocked or unreliable from... | Use Azure China proxy usgcr.azk8s.cn. Replace us.gcr.io/repo... | [G] 8.0 | [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn] |
| 2 | Customer asks about AKS Long Term Support (LTS) availability or pricing in Moonc... | From April 2025, all new AKS GA Kubernetes versions (startin... | Inform customer: 1) LTS is available for K8s 1.27, 1.28, 1.2... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/mooncake-operations.md)
