# AKS 镜像拉取失败 -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 2
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Kaito workspace INFERENCEREADY condition not true; inference pod starts but neve... | Image pull failure (private mode: invalid URL or pull secret... | For image pull errors with private images: validate image UR... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/AI%20Toolchain%20Operator%20%28Kaito%29) |
| 2 | KAITO model inference image not pulled; resource ready condition not True after ... | Inference images are very large (30-100GB); private image ac... | Verify image access mode and pull secrets; expect longer pul... | [Y] 4.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-ai-toolchain-operator-addon-issues) |

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/pod-image-pull-errors.md)
