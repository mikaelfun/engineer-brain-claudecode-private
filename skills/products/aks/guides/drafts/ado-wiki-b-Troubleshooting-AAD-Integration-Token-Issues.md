---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Security and Identity/AAD/Troubleshooting AAD Integration Token Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FAAD%2FTroubleshooting%20AAD%20Integration%20Token%20Issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting Token Issues in AAD-Integrated Clusters

## Summary

When a cluster is AAD-integrated, the authentication flow goes from a basic set of credentials (the generic `masterclient` access token) to an OAuth based login flow with multiple steps. This can make troubleshooting cluster authentication and access issues tricky as the guard pod and other control plane components are involved in confirming the user's identity and access.

## Reported and Observed Symptoms

- Little to no information in the `guard` pods logs (`guard` runs in the cluster control plane).
- `guard` pod logs will look similar to the image below even after attempts at login.
  - The log of importance in that output is: `I0712 18:21:50.504007       1 handler.go:30] Received token review request for azure/azure`
  - If you do not see a line that looks like this it means the request never reached the guard pod.

### Environment Details

- AKS cluster is AAD integrated using either the managed or legacy AAD integration methods.

## Troubleshooting Steps

The first step in troubleshooting is to get the debug log traces from the device login. After logging in with `az aks get-credentials`, use the following before issuing a get nodes command with `kubectl`:

```bash
export AZURE_GO_SDK_LOG_LEVEL=DEBUG

# then run
kubectl get nodes kubectl --v=8 get pods 2>&1 | tee /tmp/get-token.out | grep devicelogin
```

This will trigger the device login but log the trace to a file in the root /tmp directory as `get-token.out`

This file will show the trace operation for the device login.

The thing to look for initially in this file is the response status. A successful attempt should show a 200.

A bad response will show a non-200 status, which indicates an issue with the login attempt.

## Where to go from here

At this point you may need to involve AAD Identity and provide the output of that get-token.out to them which will give them a correlation ID to trace the login attempt on the back end. It is good to have this info for them when you open the collab.

If logs show blocked by conditional access policy and the culprit was the user agent for kubectl being returned as unknown by the platform:
- One workaround is to go into the conditional access policy that blocked the attempt and allowlist the server app. This is the only one that needs allowlisting and will resolve the issue.

If it is not a conditional access issue, open a collab to the identity team to investigate the trace.
