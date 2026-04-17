# AKS 通用排查 — agentic-cli -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Agentic CLI for AKS error: The combined size of system_prompt and user_prompt ex... | GPT-4 model has a smaller context window (4096 tokens). The ... | Switch to a model with a larger context window (e.g., GPT-4o... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAgentic%20CLI%20for%20AKS) |
| 2 | Agentic CLI error: litellm.NotFoundError: AzureException NotFoundError - The API... | Azure OpenAI deployment name is different from the model nam... | Create a new Azure OpenAI deployment where the deployment na... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAgentic%20CLI%20for%20AKS) |
| 3 | Agentic CLI error: litellm.llms.azure.common_utils.AzureOpenAIError: Error code ... | Default temperature parameter value (1E-8) is not supported ... | Set environment variable TEMPERATURE=1: export TEMPERATURE=1 | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAgentic%20CLI%20for%20AKS) |

## Quick Troubleshooting Path

1. Check: Switch to a model with a larger context window (e `[source: ado-wiki]`
2. Check: Create a new Azure OpenAI deployment where the deployment name matches the model name exactly (e `[source: ado-wiki]`
3. Check: Set environment variable TEMPERATURE=1: export TEMPERATURE=1 `[source: ado-wiki]`
