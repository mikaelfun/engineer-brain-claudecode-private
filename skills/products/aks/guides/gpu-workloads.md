# AKS GPU 工作负载 -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 2
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS VirtualMachines (Mixed SKU) agent pool creation or update fails with VM size... | VMs agent pool with mixed SKU requires all VM sizes to be co... | Use VM sizes that are compatible within the same agent pool.... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FMixed%20SKU%20Nodepools) |
| 2 | KAITO workspace not created after enabling AI Toolchain Operator add-on; validat... | Wrong values in KAITO workspace custom resource specificatio... | Check gpu-provisioner and workspace pod logs; ensure GPU VM ... | [Y] 4.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-ai-toolchain-operator-addon-issues) |
