---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C Troubleshooting/TSG - Troubleshooting AFD <> B2C 504 errors"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2C%2FAzure%20AD%20B2C%20Troubleshooting%2FTSG%20-%20Troubleshooting%20AFD%20%3C%3E%20B2C%20504%20errors"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---  
Tags:  
- cw.Entra  
- cw.EntraID  
- cw.comm-extidmgt  
- Azure AD B2C  
---

[[_TOC_]]

##Concepts
![image.png](/.attachments/image-063c1995-f0fb-4b25-ad28-c1464f8ab1db.png)

When a customer has Azure Front Door, the request from the end user is resolved by DNS and sent to AFD. From AFD, rules are established to redirect the request to the B2C tenant. Even though the B2C tenant is the final destination, from a networking perspective it's mandatory that the packet is sent to the AAD Gateway and it's this component who is responsible to deliver it to the tenant entity. The gateway is ALWAYS present in the networking path when communicating with the B2C tenant (all requests go through gateway regardless of AFD being configured or not).

In conclusion, when we are seeing http 504 errors we need  to consider the AFD perspective and the AAD Gateway perspective.
A 504 error may appear in the following scenarios:
- Scenario 1 : B2C tenant does not respond
- Scenario 2 : B2C responds but too slowly and AFD doesn't wait for the response
- Scenario 3 : AFD doesn't seem to deliver the traffic to the AAD Gateway

## How to trace a request from AFD to B2C?
- **Step 1**: \
Ask customer to  find in AFD logs in their portal a reference id for three of four events where there was 504 error targetted at B2C tenant and its timestamp.\
The reference id should look like this "20250715T073451Z-17c498999fd8pxn9hC1FRAdhxc00000003ag000000003s8t".

- **Step2**: \
Find this request in the AAD Gateway logs.\
From ASC:\
&nbsp;&nbsp;&nbsp;&nbsp;- Go to tenant and enter Kusto Web UX\
&nbsp;&nbsp;&nbsp;&nbsp;- Add the cluster: aadgwwst\
&nbsp;&nbsp;&nbsp;&nbsp;- Run the query: 
> let start = datetime(2025-xx-xx xx:xx); \
let end = datetime(2025-xx-xx xx:xx);\
AllRequestSummaryEvents \
| where env_time between (start .. end) \
| where AFDCorrelationId == '<insert AFD reference id>' \
| project env_time,AFDCorrelationId, StatusCode, GatewayRequestId, IncomingUrl


SAMPLE OUTPUT of the query above:
| env_time | AFDCorrelationId | StatusCode  | GatewayRequestId | IncomingUrl |
|--|--|--|--|--|
| 2025-07-14 06:39:01.3978513 | 20250714T063901Z-17686c98b99q4nm5hC1OSLemm40000000d5g0000000001sp | 200.0 | 6exxxxxx-xxx-xxxx-xxxx-xxxxxx4374a6 | /9b4xxxxx-xxxx-xxxx-xxxx-xxxxxd1e0aa/B2C_1A_SIGNIN/SelfAsserted?tx=*&p=* |

 
##Scenario 1 - B2C tenant does not respond

After running the query above, if the StatusCode _is_ 504, something is wrong with the tenant. When this happens, the issue may be transient. If the issue is persistent and reproducible at any time please raise an ICM for the CPIM team. 

If the StatusCode _is not_ 504, [check scenario 2](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/2190784/?wikiVersion=GBmaster&_a=edit&pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20B2C/TSG%20%252D%20Troubleshooting%20AFD%20%3C%3E%20B2C%20504%20errors&anchor=scenario-2---b2c-responds-but-too-slowly-and-afd-doesn%27t-wait-for-the-response).\
If you DO NOT get results back, [check scenario 3](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/2190784/?wikiVersion=GBmaster&_a=edit&pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20B2C/TSG%20%252D%20Troubleshooting%20AFD%20%3C%3E%20B2C%20504%20errors&anchor=scenario-3---afd-doesn%27t-seem-to-deliver-the-traffic-to-the-aad-gateway).

##Scenario 2 - B2C responds but too slowly and AFD doesn't wait for the response
After running the query above, if the StatusCode _is not_ 504 there may be a latency issue. 
AFD has a setting called Origin response timeout which is 30 seconds by default. In a simple way, this setting means that Azure Front Door will wait for the backend to respond within 30 seconds. If the backend takes longer than 30 seconds to respond, then AFD will close the connection from their side alone logging a 504 and claiming a Origin Timeout issue. - [AFD Ref Doc](https://learn.microsoft.com/en-us/azure/frontdoor/troubleshoot-issues#symptom).
\
\
To determine if latency is the culprit we need to go check how long does the requests take and we can do so by levering the queries here <A  href="https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/993237/Azure-AD-B2C-Latency-Kusto-Queries">Azure AD B2C Latency Kusto Queries - Overview</A>.
\
\
From the kusto query in the section "How to trace a request from AFD to B2C" you will obtain the GatwayRequestId.\
The GatewayRequestId is the correlationId in the B2C logs. \
To study the latency we need to obtain the internalCorrelationId instead so we can use it in the queries in the article linked above. To do so just run the following query:
  
> let start = datetime(2025-xx-xx xx:xx); \
let end = datetime(2025-xx-xx xx:xx); \
AllIfxRequestEvent\
| where env_time between (start .. end) \
| where correlationId == '<insert correlationId/GatewayRequestId>' \
| project correlationId, internalCorrelationId

SAMPLE OUTPUT:
| correlationId | internalCorrelationId |
| --- | --- |
| 17xxxxx-xxxx-xxxx-xxxx-xxxxx0485b4 | 3adxxxxx-xxxx-xxxx-xxxx-xxxxx0f5fe |

After studying the latency, if the total time is over 30 seconds, direct the customer to the  [AFD Ref Doc](https://learn.microsoft.com/en-us/azure/frontdoor/troubleshoot-issues#symptom) where this situation is explained. The easiest solution is to increase the Origin timeout period setting to a higher amount of seconds.

##Scenario 3 - AFD doesn't seem to deliver the traffic to the AAD Gateway

If no records of the AFD reference Id pop up in the AAD Gateway logs, this is may be indication that the request didn't arrive to the AAD Gateway or the AAD Gateway dropped the packets. Create a collaboration to the Azure Networking team and request assistance in determining if there are any issues with the AFD. If the investigation with AFD does not come to any conclusion, request AAD Gateway team over ICM to assess if there are records of packet drops in the period of time where the issue occurs.

Although other problems in the infrastructure may occur, these are the only two point of contact we can leverage.

EDIT:
- When creating a collab to Azure Networking team use the SAP: Azure/Front Door Service/Connectivity , explain connectivity from AFD to backend is compromised. Provide evidence from the troublshooting done.

- It is possible that there are underlying infrastructure issues with AFD. Please alert the recipient team that we have witnessed similar events in the past. 
Ref ICM with AFD PG: [https://portal.microsofticm.com/imp/v5/incidents/details/657009093/summary](https://portal.microsofticm.com/imp/v5/incidents/details/657009093/summary "https://portal.microsofticm.com/imp/v5/incidents/details/657009093/summary")