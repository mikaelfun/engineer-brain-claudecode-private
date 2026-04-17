# AKS UDR 与路由 — service-principal -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster creation fails because service principal is not found or invalid. Va... | Service principal was just created and has not propagated ac... | Use existing SP that has propagated, wait 5-10 min after SP ... | [G] 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/missing-or-invalid-service-principal) |
| 2 | AKS cluster creation/upgrade fails with AADSTS7000222: BadRequest or InvalidClie... | Service principal client secret expired, incorrect credentia... | Check SP expiration via az aks show + az ad app credential l... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-badrequest-or-invalidclientsecret) |
| 3 | AKS cluster creation fails with InvalidParameter error. Covers multiple scenario... | One or more creation parameters are invalid — VM SKU unavail... | Check VM SKU availability in region, verify service principa... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/invalidparameter-error) |

## Quick Troubleshooting Path

1. Check: Use existing SP that has propagated, wait 5-10 min after SP creation, verify with az ad sp show, or  `[source: mslearn]`
2. Check: Check SP expiration via az aks show + az ad app credential list `[source: mslearn]`
3. Check: Check VM SKU availability in region, verify service principal validity, validate network resources ( `[source: mslearn]`
