---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Security and Identity/Cilium L7 Network Policies"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FCilium%20L7%20Network%20Policies"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Cilium Layer 7 Network Policies

If you're troubleshooting Layer 7 (L7) network policy issues in an Azure Kubernetes Service (AKS) cluster using Managed Cilium offering, follow these structured steps to diagnose and resolve the problem.

Envoy, which is used for Layer 7 Policy enforcement will run as a separate daemonset in ACNS offering. It will be part of `acns-security-agent` pod which also hosts the SDP Proxy container. Before you proceed with debugging any issues tied to Layer 7 policy enforcement, it is critical you make sure the Envoy(Cilium-Proxy) container in `acns-security-agent` pod is up and running.

## Check to see if L7 Network Policies are enabled on cluster

Currently in ASC, it is only displaying enum values for the feature:
- Unspecified=0
- Invalid=1
- None=2 (no L7 network policies can be applied)
- L7=3 (all types of L7 network policies, including FQDN)
- FQDN=4 (only FQDN network policies)

## Verify if the L7 Policy is Applied

1. Check if the policy exists and is correctly defined:

```bash
kubectl get ciliumnetworkpolicy -A
kubectl describe ciliumnetworkpolicy <policy-name> -n <namespace>
```

- Ensure the policy includes correct HTTP/gRPC/Kafka rules, methods, paths, or topics.
- CNPs are namespace scoped resources.

2. Check which pods the policy applies to:
- Confirm endpointSelector matches intended pods.
- If no matching pods are listed, the policy is not being applied.

## Use Hubble to Inspect Traffic and Policy Enforcement

### Check real-time network flows

```bash
hubble observe --verdict DROPPED
```

- If traffic is missing, it might be blocked at L3/L4 instead of L7.

### Filter for specific protocols

```bash
hubble observe --protocol http
hubble observe --protocol kafka
hubble observe --pod <pod-name> --protocol http
```

- If a request is allowed: FORWARDED; if blocked: DROPPED.

### Check for policy misconfigurations

```bash
hubble observe --from-pod <pod-name> -f
```

Ref: https://docs.cilium.io/en/stable/observability/hubble/hubble-cli/

## Examine Cilium Agent Logs for Errors

```bash
kubectl logs -n kube-system daemonset/cilium | grep <policy-name>
```

- Look for policy parse errors or warnings.
- If policy not appearing in logs, there may be a syntax issue.

## Inspect Envoy Proxy Logs and Metrics

```bash
kubectl logs -n <acns-security-agent> --container cilium-envoy
```

- Look for 403 Forbidden or connection errors.
- TLS handshake failures: check if traffic is encrypted (Cilium cannot inspect encrypted traffic by default).

## Debugging Protocol-Specific Issues

### HTTP Issues
- Confirm allowed methods and paths: `hubble observe --protocol http`
- Check for missing method/path in policy
- Common failure signs:
  - 403 Forbidden: Policy denied the request
  - DROPPED (HTTP PUT /path): Method not allowed

### gRPC Issues
- gRPC calls appear as HTTP/2 POST requests
- Verify the path in the policy matches /Service/Method
- Common errors:
  - PERMISSION_DENIED: Policy blocked it
  - UNAVAILABLE: Could be L3/L4 issue
- Use fully qualified gRPC service names in policy
- If mTLS is used, L7 rules won't work

### Kafka Issues
- Check: `hubble observe --protocol kafka --verdict DROPPED`
- Common errors:
  - TOPIC_AUTHORIZATION_FAILED: Topic not allowed by policy
- Ensure topic names match exactly
- Kafka encryption (TLS/SASL) can bypass Cilium L7 filtering - use L4 rules instead

## Check Performance and Resource Issues

```bash
kubectl top pods -n kube-system | grep acns-security-agent
```

- If CPU is high, suggest migrating to higher SKUs for worker nodes.

## Final Steps

- Traffic missing from Hubble logs: may be blocked at L3/L4
- Policy seems ignored: double-check endpointSelector
- Requests are slow: scale up Cilium or reduce policy complexity

## References

- [Documentation](https://learn.microsoft.com/en-us/azure/aks/azure-cni-powered-by-cilium?source=recommendations#network-policy-enforcement)
