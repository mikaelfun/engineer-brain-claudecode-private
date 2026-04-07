---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Automated Deployments"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAutomated%20Deployments"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Automated Deployments (DevHub RP)

## Service Overview and Architecture

The DevHub RP and the Automated Deployments portal experience is an ARM RP backed service living in the AKS SVC cluster. The DevHub service provides:

1. Connecting to Azure Users GitHub/Azure DevOps Accounts (currently only same tenant ADO accounts)
2. Creating a Pull Request against a users GitHub/Azure DevOps repository containing Dockerfiles/Kubernetes Manifests/GitHub Workflows
3. Providing a preview of the Dockerfiles/Kubernetes Manifests/GitHub that will be in the Pull Request

**The DevHub service does not currently make requests to the AKS RP.**

Repository: https://dev.azure.com/msazure/CloudNativeCompute/_git/aks-dev-hub

## ASI Pages

### Operations by SubscriptionId
When creating an ICM, populate the `subscriptionId` field correctly - it adds a link in ICM discussion to the ASI page. Filter `HasErrors` to `true` to find failed operations. Click `OperationId` for detailed operation information.

## Logging (Request Flow)

```
HttpOutgoingRequests -> DevHubNginxIngressActivity -> IncomingRequestTrace -> DevHubSyncContextActivity -> OutgoingRequestTrace
```

### Key Kusto Tables

**ARM Logs** - Outgoing requests from ARM to DevHub:
```kusto
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpOutgoingRequests")
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where targetResourceProvider contains "Microsoft.DevHub"
| project-reorder PreciseTimeStamp, TaskName, correlationId, clientRequestId, httpStatusCode, contentLength, durationInMilliseconds, targetUri, operationName
```

**RPIngress NGINX Logs**:
```kusto
RpIngressActivity
| where TIMESTAMP > ago(1d)
| where ingress startswith "devhub"
| where path !contains "health"
| project-reorder PreciseTimeStamp, msg, level, path, clientRequestID, statusCode, durationInSeconds
```

**Incoming Request Trace**:
```kusto
IncomingRequestTrace
| where TIMESTAMP > ago(1d)
| where msg contains "DevHubHTTPGatewayRequest"
| project-reorder PreciseTimeStamp, msg, level, path, clientRequestID, StatusCode
```

**DevHub RP Logs**:
```kusto
DevHubSyncContextActivity
| where TIMESTAMP > ago(1d)
| project-reorder PreciseTimeStamp, msg, level, routeName, clientRequestID, operationID
```

**Outgoing Request Trace**:
```kusto
OutgoingRequestTrace
| where TIMESTAMP > ago(5d)
| where msg contains "DevHubHttpRequest"
| project-reorder PreciseTimeStamp, msg, level, path, clientRequestID, StatusCode
```

## Potential Issues

### GitHub Service Issues
If latency increases in DevHub Outgoing Logs tab within ASI, check [GitHub Service Status Page](https://www.githubstatus.com/).

### GitHub Authentication Issues (OAuth App Secret)
If increase in errors for `GitHubOAuthCallback`/`GetGitHubOAuthDefault` routes:
1. Check DevHub Deployer Logs for `secret replacement` issues around `devhub-github-appkey`
2. Check DevHub startup logs for failures to decrypt the app secret
3. If everything looks good, app secret might have been revoked - reach out to AKS Atlanta teams channel

### Azure DevOps Service Issues
We use a thin wrapper around the ADO REST API (api version 7.1). If 5XX errors in DevHub Outgoing Logs, check [Azure DevOps Service Status Page](https://status.dev.azure.com/).

### ADO Authentication Issues
- `failed to get ADO OAuth token`: Failure to get token from `/oauth2/v2.0/token` endpoint. Could be: bad client assertion, wrong code_verifier, expired auth code, or FPA misconfiguration
- Bad redirect URI: Check [FPA configuration](https://msazure.visualstudio.com/One/_git/AAD-FirstPartyApps?path=/Customers/Configs/AppReg/60171198-7cdf-40df-9e03-ebf2ab7a8917/AppReg.Parameters.Production.json)
- Scope mismatch: Validate scopes match between callback and authorization request (set in adooauth.go). Preauthorized scopes: `vso.profile`, `vso.code_write`, `vso.build_execute`

### Is this a new issue?
Check [DevHub Release Pipeline](https://dev.azure.com/msazure/CloudNativeCompute/_release?definitionId=1404) to correlate with new deployments.

## Escalation Path

- **Email**: aks-devx@microsoft.com
- **ICM Path**: Azure Kubernetes Service\RP
- **PM Owner**: Quentin Petraroia

## References

- [Public Docs](https://learn.microsoft.com/en-us/azure/aks/automated-deployments)
