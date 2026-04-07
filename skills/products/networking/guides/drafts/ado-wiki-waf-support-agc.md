---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/Features/Feature WAF support in Application Gateway for containers"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Features/Feature%20WAF%20support%20in%20Application%20Gateway%20for%20containers"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Web Application Firewall (WAF) in Application Gateway for Containers

## Overview

Web Application Firewall (WAF) provides centralized protection for web applications from common exploits and vulnerabilities.

All WAF functionality exists inside of a WAF policy. Multiple policies can be created, and they can be associated with an Application Gateway for Containers Frontend, with individual listeners, or with path-based routing rules within Gateway or Ingress YAML configuration.

### ARM Resource

A new resource `Microsoft.ServiceNetworking/trafficControllers/securityPolicies` reflects a WAF reference.

### Kubernetes WebApplicationFirewallPolicy

A new custom resource `WebApplicationFirewallPolicy` may be created with the following target references:
- ApplicationLoadBalancer
- Gateway
- Gateway/Listener
- HTTPRoute

## Constraints and Limitations

- Default Ruleset (DRS) 2.1 is the only supported managed ruleset on AGC WAF. Core Ruleset (OWASP) 3.0, 3.1, or 3.2 are not supported on AGC WAF.
- Both Bot Manager ruleset 1.0 and 1.1 are supported. Bot manager ruleset 0.1 is not supported.

## Known Issues

- JS Challenge action is not supported. When the Bot Manager Ruleset is used, actions set to JS Challenge will not work and must be set to Block, Log or Allow.
- WAF Logging and metrics may not be available during early preview phases.
- If an AGC parent resource is deleted, all child security policy resources will be removed but the deletion of the parent resource may fail. Child resource security policy references must be removed before deletion.
- When an existing WAF policy resource is edited to move the target up the hierarchy (e.g., from Path to Gateway level), a brief period may be observed during which the WAF policy is not applied.

## Support

During Private Preview, CSS does not support AGC + WAF so customers should not be opening support requests for it.

## Log Sources

- HTTP request logs: existing Application Gateway WAF logs
- Control Plane: NFVRP/FrontendEvent and NRP/FrontendOperationEtwEvent
