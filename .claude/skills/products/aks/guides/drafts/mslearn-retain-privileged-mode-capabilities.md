# Retain Privileged Mode While Adding Capabilities

**Source**: [Microsoft Learn - Retain privileged mode](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/retain-privileged-mode-add-capabilities)

## Overview

Guidance on retaining privileged mode while adding capabilities in AKS using the Azure Policy Add-on.

## Key Points

- Node access always requires a certain level of privilege
- Default policies flag these access levels
- Even without full node access, policies detect access to the file system
- Must create exceptions or fine-tune policies based on requirements

## Policy Considerations

- Individual capabilities can be specified in pod security context without marking pod as privileged
- Other policies still apply even if "privileged" policy is not triggered
- Built-in policy definitions: [Azure Kubernetes built-in policy definitions](https://learn.microsoft.com/en-us/azure/governance/policy/samples/built-in-policies#kubernetes)
- Daemonset containers requiring host filesystem access (copy agent files, scripts) will trigger filesystem policies

## Recommendation

Review container requirements against all applicable policy definitions, not just the "privileged" policy. Create targeted exemptions as needed.
