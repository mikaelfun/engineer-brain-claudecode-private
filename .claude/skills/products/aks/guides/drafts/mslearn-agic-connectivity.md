---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/load-bal-ingress-c/troubleshoot-app-gateway-ingress-controller-connectivity-issues"
importDate: "2026-04-21"
type: guide-draft
---

# Troubleshoot Application Gateway Ingress Controller (AGIC) Connectivity

Multi-step diagnostic guide for AGIC connectivity issues on AKS.

## Common Symptoms
- Ingress without IP address assigned (AGIC not functioning)
- HTTP timeout (DNS/Ingress/App OK but AGIC is the problem)

## Step 1: Verify Application Functionality
`kubectl port-forward svc/<service> 9090:<port>` then `curl -v http://localhost:9090` to confirm app works independent of ingress.

## Step 2: Inspect Ingress Settings
`kubectl describe ingress <name>` - check events for errors like "Application Gateway is in stopped state", verify rules and address assignment.

## Step 3: Inspect Ingress Pod Logs
`kubectl logs -n kube-system -l=app=ingress-appgw` (add-on) or `kubectl logs <pod>` for errors/warnings.

## Step 4: Check Application Gateway Operational State
- Add-on: `az aks show --name <aks> --resource-group <rg> --query addonProfiles.ingressApplicationGateway`
- `az network application-gateway show --name <gw> --resource-group <rg> --query operationalState`
- Expected: "Running". If not, restart the Application Gateway.

## Step 5: Compare Backend IPs
Compare `az network application-gateway show ... --query backendAddressPools` with `kubectl describe endpoints <service> | grep Addresses`. Mismatches indicate AGIC sync issues.

## Fix: Start/Restart Application Gateway
`az network application-gateway start --name <gw> --resource-group <rg>`
