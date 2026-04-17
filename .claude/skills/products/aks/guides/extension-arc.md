# AKS Azure Arc -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 2
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Unable to download helm charts in Azure Arc. | The issue is with spec. | Check the YAML file where you have mentioned to download the... | [B] 6.5 | [ContentIdea#150494](https://support.microsoft.com/kb/4619254) |
| 2 | Onboarding of Rancher Kubernetes Engine cluster to Azure Arc is failing with bel... | storage.googleapis.com is used to download kubectl release i... | From Azure CLI version 2.68.0 onwards, CLI is downloading th... | [B] 6.5 | [ContentIdea#201260](https://support.microsoft.com/kb/5058634) |

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/extension-arc.md)
