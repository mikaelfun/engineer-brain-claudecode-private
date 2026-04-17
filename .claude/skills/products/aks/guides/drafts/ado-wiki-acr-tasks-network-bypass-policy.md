---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/TSG/ACR Tasks Network Bypass Policy"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Tasks%20Network%20Bypass%20Policy"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ACR Tasks Network Bypass Policy

## Introduction

As part of ACR's effort to address the Tasks network isolation bypass vulnerability, a new feature flag `networkRuleBypassAllowedForTasks` was introduced.

### Timeline

- **Phase 1 (May 16th, 2025)**: New registry setting available. Functions similarly to existing network isolation for Tasks but tailored for ACR Tasks using SAMI tokens. When explicitly configured, takes precedence over legacy setting.
- **Phase 2 (Starting June 1st, 2025)**: If not explicitly set, network bypass for Tasks denied by default. Customers relying on bypass without setting the new flag will get 403 Forbidden errors.

## Customer Scenarios

### Scenario 1: Customer opts to use Agent Pool

1. Review [Use Dedicated Pool to Run Tasks](https://learn.microsoft.com/en-us/azure/container-registry/tasks-agent-pools)
2. Provision dedicated agent pool:
   ```bash
   az acr agentpool create --name <agent-pool-name> --registry <registry-name> --vnet <vnet-name>
   ```
3. Run tasks in the agent pool:
   ```bash
   az acr build --registry <registry-name> --agent-pool <agent-pool-name> --image <image:tag> --file Dockerfile <path>
   ```

### Scenario 2: Customer opts to enable new network bypass policy

1. Enable the new policy:
   ```bash
   az acr update --name <registry-name> --set networkRuleBypassAllowedForTasks=true
   ```
2. Verify Tasks can bypass network restrictions by running `az acr build`, `az acr run`, or `az acr task run`.

### Scenario 3: No action taken (default behavior)

- Phase 1: Existing settings continue to work.
- Phase 2 (after June 1st, 2025): Network bypass denied by default → 403 errors.

## Alternate Scenarios

### Using az acr purge locally

Customers can download ACR CLI binary from [Azure ACR CLI GitHub](https://github.com/azure/acr-cli) and execute purge commands locally without relying on ACR Tasks.

### Self-hosted environments

Run `docker build` and `docker push` on own agents/machines with direct ACR access, eliminating need for ACR Tasks and network bypass.

## CSS Engineer Guidance

Customers experiencing 403 errors after June 1st, 2025 should:
1. Evaluate requirements and enable `networkRuleBypassAllowedForTasks=true` if needed
2. Alternatively, use ACR Agent Pool feature

## Escalation

- ACR support Teams channel: [acr-sup](https://teams.microsoft.com/l/channel/19%3A587a166080b64df99c2375a0b22c91b1%40thread.skype/General?groupId=3854ec50-7444-40d8-94a4-5989ec49b470&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)
- IcM template: [Create IcM](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=R2i2O1)
- ACR PG/PM: Gavin King (King.Gavin@microsoft.com)
