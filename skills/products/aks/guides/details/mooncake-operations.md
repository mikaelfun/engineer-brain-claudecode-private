# AKS Mooncake 运维特殊处理 -- Comprehensive Troubleshooting Guide

**Entries**: 2 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: Google Container Registry domains blocked or unrel

### aks-216: Container images from us.gcr.io not accessible in Azure China (Mooncake); AKS de...

**Root Cause**: Google Container Registry domains blocked or unreliable from China network

**Solution**:
Use Azure China proxy usgcr.azk8s.cn. Replace us.gcr.io/repo/image:tag with usgcr.azk8s.cn/repo/image:tag

`[Score: [G] 8.0 | Source: [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn]]`

## Phase 2: From April 2025, all new AKS GA Kubernetes version

### aks-147: Customer asks about AKS Long Term Support (LTS) availability or pricing in Moonc...

**Root Cause**: From April 2025, all new AKS GA Kubernetes versions (starting 1.27+) are LTS-compatible. LTS requires Premium tier (~.5/day per cluster). LTS provides 1 additional year of CVE patches beyond community EOL.

**Solution**:
Inform customer: 1) LTS is available for K8s 1.27, 1.28, 1.29, 1.30 (1.31/1.32 coming); 2) Requires AKS Premium tier; 3) Only deployable via CLI (not portal as of Jun 2025); 4) Pricing: see azure.microsoft.com/pricing/details/kubernetes-service/; 5) Each LTS version gets 1 extra year of support with CVE fixes.

`[Score: [B] 7.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Container images from us.gcr.io not accessible in Azure China (Mooncake); AKS de... | Google Container Registry domains blocked or unreliable from... | Use Azure China proxy usgcr.azk8s.cn. Replace us.gcr.io/repo... | [G] 8.0 | [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn] |
| 2 | Customer asks about AKS Long Term Support (LTS) availability or pricing in Moonc... | From April 2025, all new AKS GA Kubernetes versions (startin... | Inform customer: 1) LTS is available for K8s 1.27, 1.28, 1.2... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
