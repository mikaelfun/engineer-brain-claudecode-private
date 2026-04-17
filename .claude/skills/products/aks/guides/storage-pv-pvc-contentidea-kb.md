# AKS PV/PVC 与卷管理 — contentidea-kb -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | The customer encountered connectivity and permission issues with an Azure ARC-en... | Portal Not Using the Right Token: When the customer tries to... | The 599 error was transient and it is due to customer's prox... | [B] 6.5 | [ContentIdea#197360](https://support.microsoft.com/kb/5049031) |
| 2 | When attempting to onboard an OpenShift cluster to Azure Arc, the kube-aad proxy... | The error is caused by missing SCC permissions | To resolve this issue, grant the necessary permissions and r... | [B] 6.5 | [ContentIdea#199403](https://support.microsoft.com/kb/5053550) |
| 3 | Unable to deploy persistent volume claim by using a custom storage class. | - | - Need to explicitly add the storage path id parameter and r... | [B] 6.5 | [ContentIdea#201816](https://support.microsoft.com/kb/5059403) |

## Quick Troubleshooting Path

1. Check: The 599 error was transient and it is due to customer's proxy settings bocking the url `[source: contentidea-kb]`
2. Check: To resolve this issue,
grant the necessary permissions and restart the kube-aad proxy pod by followi `[source: contentidea-kb]`
3. Check: - Need to explicitly
add the storage path id parameter and remove it from container parameter then
t `[source: contentidea-kb]`
