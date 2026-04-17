---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Pass-Through Authentication/Azure AD Pass-Through Authentication (PTA) - How to get the version of the agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Pass-Through%20Authentication%2FAzure%20AD%20Pass-Through%20Authentication%20(PTA)%20-%20How%20to%20get%20the%20version%20of%20the%20agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-hybauth
- SCIM Identity
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

In course of the troubleshooting it's important to ensure that the customer uses the latest version of the agent, as it contains new features, performance enchantments, bug fixes compared to the previous agents versions.

Please find more information about the release history of the agent in [Microsoft Entra Pass-through Authentication agent: Version release history](https://learn.microsoft.com/entra/identity/hybrid/connect/reference-connect-pta-version-history).

## ASC

In ASC you can check some details about the agent, but it does not show the agents's version currently (This feature is coming). Please see this [article](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/446950/Azure-AD-Pass-Through-Authentication-(PTA)-ASC).

##On the agent server

Use the following PS command to determine the version of the agent:

`[System.Diagnostics.FileVersionInfo]::GetVersionInfo("C:\Program Files\Microsoft Azure AD Connect Authentication Agent\AzureADConnectAuthenticationAgentService.exe").FileVersion`

##Kusto

To setup Kusto for "PTA", please see this [article](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183973/Azure-AD-Pass-Through-Authentication-(PTA)?anchor=dgrep-logs).

Please find some sample queries below. We assume that the connector(s) bootstrapped at least once in the last 30 mins. If you see the same connector more than once in the output that means the connector was updated or moved to a different connector group in the 30 mins time window.

Get the version of one specific connector: 

```
BootstrapRootOperationEvent
| where env_time > ago(30m) and connectorId == "REPLACE_WITH_CONNECTORID" and agentFeature == "Passthrough Authentication"
| summarize by connectorId, connectorVersion, signalingListenerEndpointConnectorGroup
```

Get the version of all the connectors in a specific connector group: 

```
BootstrapRootOperationEvent
| where env_time > ago(30m) and signalingListenerEndpointConnectorGroup == "REPLACE_WITH_CONNECTORGROUPID" and agentFeature == "Passthrough Authentication"
| summarize by connectorId, connectorVersion, signalingListenerEndpointConnectorGroup
```

Get the version of all the connectors in the tenant:

```
BootstrapRootOperationEvent
| where env_time > ago(30m) and subscriptionId == "REPLACE_WITH_TENANTID" and agentFeature == "Passthrough Authentication"
| summarize by connectorId, connectorVersion, signalingListenerEndpointConnectorGroup
```

If you have any feedback on this article or you need assistance, please contact us over [the PTA and Seamless SSO, Staged Rollout Teams channel](https://teams.microsoft.com/l/channel/19%3a33d2ca295e334b869b43ad3fc8c6eb04%40thread.skype/PTA%2520and%2520Seamless%2520SSO%252C%2520Staged%2520Rollout?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) or send  a [request / feedback](https://forms.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR36COL1ZDnJAnLWpaiURTuNUOFBNNFcwNUJDU1hQNkVDQzNON0VSMzY1Ti4u) to the Hybrid Authentication Experiences Community.
