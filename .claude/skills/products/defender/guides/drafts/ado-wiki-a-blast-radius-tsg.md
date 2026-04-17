---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Microsoft Sentinel Graph (MSG)/[TSG] - Blast Radius"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/Microsoft%20Sentinel%20Graph%20(MSG)/%5BTSG%5D%20-%20Blast%20Radius"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<!-- Optional: Link to PG original TSG doc -->
Link to Product Group (PG) [TSG - MSG Defender Scenarios (Public Preview)](https://microsoft.sharepoint.com/:w:/t/SecurityPlatform/EZN35RN93v5OghveFFwoEjABzKTMqS9cbCQbSLQUygeb2g?e=PmZsXQ)

[[_TOC_]]

<!-- �Required: Main title of the document -->
# TSG for Microsoft Security Graph and Blast Radius

<!-- �Required: Training sessions resources and links-->
## Training sessions
|Date (DD/MM/YYYY)|Session Recording|Presenter|
|--|--|--|
| 25/09/2025 |[Microsoft Sentinel Graph](https://platform.qa.com/resource/microsoft-sentinel-graph-1854/?context_id=14133&context_resource=lp)| Manoj Raheja |

#### Required Kusto Access
| Cluster Path | Database | Permissions |
|--|--|--|
| https://babylon.eastus2.kusto.windows.net | babylonMdsLogs | [TM-AzurePurviewCSS](https://coreidentity.microsoft.com/manage/entitlement/entitlement/tmazurepurvi-xzw2) |

# Introduction�
Microsoft Sentinel graph is a unified graph analytics capability within Microsoft Sentinel which powers built-in graph-based experiences across security, compliance, identity, and the Microsoft Security ecosystem - empowering security teams to model, analyze, and visualize complex relationships across their digital estate.��

Unlike traditional tabular data approaches, Sentinel graph enables defenders and AI agents to reason over interconnected assets, identities, activities, and threat intelligence�unlocking deeper insights and accelerating response to evolving cyber threats across prebreach and post breach. Graphs natively represent the real-world such as web of users, devices, cloud resources, data flows, activities, and attacker actions. By representing these relationships as nodes and edges, security teams can answer questions that are slow or impossible with tables, such as what could happen if a specific user account is compromised? Or what is the blast radius of a compromised document?� �Sentinel graph offers interconnected security graphs to help you at every stage of defense. The graph capabilities are being extended with new scenarios throughout Defender and Purview, providing graph-based defense strategies across all stages, from pre-breach to post-breach and across assets, activities, and threat intelligence.

---
# Blast Radius in Incident graph
Instead of manually correlating logs or running complex queries to understand the scope of an incident, the incident graph in the Microsoft Defender portal is now extended with blast radius capability. This allows SOC teams to quickly anticipate the attacker�s potential next steps, and prepare an effective response, highlighting the top targets reachable through the compromised credentials. This helps teams prioritize which systems to contain and remediate first, reducing the time to respond and limiting business impact.

---
# Hunting graph
Threat hunting often requires connecting disparate pieces of data to�uncover�hidden paths that attackers exploit to reach your crown jewels.�With the new�hunting�graph, analysts can visually traverse the complex web of relationships between users, devices, and other entities to reveal privileged access paths to critical assets.�This graph-powered exploration transforms threat hunting into a proactive mission, enabling�SOC�teams to surface vulnerabilities and intercept attacks before they gain momentum.�This approach shifts security operations from reactive alert handling to proactive threat discovery, allowing teams to�identify�vulnerabilities and stop attacks before they escalate.

---
# Common Issues and Solutions
---
## Onboarding Issues

### Issue - Tenant does not have the pre-requisites for onboarding to Microsoft Sentinel data lake

**Symptoms:** Onboarding banner does not appear, or onboarding shows an error.

**Possible Causes:**
 - Tenant does not have a Microsoft Sentinel primary workspace connected to Microsoft Defender portal.
 - Microsoft Sentinel primary workspace is not in the same region as tenant�s home region.

**Troubleshooting steps:** 
 - Confirm that Sentinel primary workspace is connected to Defender portal and is in the same region as tenant�s home region.
[Onboarding to Microsoft Sentinel data lake - Prerequisites](https://learn.microsoft.com/en-us/azure/sentinel/datalake/sentinel-lake-onboarding#prerequisites)

### Issue - User missing permissions needed for onboarding to Sentinel Graph

**Symptoms:** Onboarding banner does not appear, or onboarding shows a permission error

**Possible Causes:**

- User does not belong to one of the required roles
- User is not Azure subscription owner for billing setup
- Users do not have read access to all workspaces

**Troubleshooting steps:** 
- Confirm the roles assigned to the logged in user Reference
[Onboarding to Microsoft Sentinel data lake - Prerequisites](https://learn.microsoft.com/en-us/azure/sentinel/datalake/sentinel-lake-onboarding#prerequisites)

### Issue - Graph onboarding takes much longer than expected

**Symptoms:** User continues to see �We are setting up your new Sentinel Data Lake and graph� message even after 24 hours since onboarding was started

**Possible Causes:**
- Lake onboarding failed due to an error
- Issues with ingestion of data to Sentinel Data Lake
- Issues with building graph from data in Sentinel Data Lake

**Troubleshooting steps:**
* Confirm Lake onboarding status shows as completed successfully. If Lake Onboarding encountered failure, check the pre-requisites needed for successful completion.
* Confirm it has been 24 hours since onboarding was initiated

**Next steps:**
- Create an IcM/CRI.

---
## Permission Issues

### Issue - User does not have necessary permissions to view data from graph

**Symptoms:** Predefined scenario queries don�t return any data

**Possible Causes:** 
User does not have one of the permissions needed to access Microsoft Security Exposure Management (MSEM) data.

**Troubleshooting steps:**
- Check the roles and permissions of the user.
- Check network trace for any calls failing with access denied errors.

Reference Links:

- [Microsoft Security Exposure Management | Prerequisites and support](https://learn.microsoft.com/en-us/security-exposure-management/prerequisites)
- [https://learn.microsoft.com/en-us/defender-xdr/manage-rbac#permissions-prerequisites](https://learn.microsoft.com/en-us/defender-xdr/manage-rbac#permissions-prerequisites)
- [ Microsoft Defender XDR | Role-Based Access Control (RBAC)](https://learn.microsoft.com/en-us/defender-xdr/manage-rbac#permissions-prerequisites)

### Issue - User can only see partial information from graph

**Symptoms:**
- Users can see only partial information in the Advanced Hunting predefined scenario graphs
- Users can see only subsets of paths when viewing the blast radius from Incident graph

**Possible Causes:** 
- Entities are configured with device group scopes and if user lacks permission to view entities along the graph path, the entire path will be hidden from the user.

**Troubleshooting steps:**
- Check if device groups are configured and access is limited to specific user groups
- Check if user is member of user groups with access to entities in the device group

Reference Links:
- [Microsoft Defender for Endpoint | Create and manage device groups](https://learn.microsoft.com/en-us/defender-endpoint/machine-groups)

---
## Data Issues

### Issue - Predefined scenario queries return no result

**Symptoms:** No graph is rendered after running the predefined scenario query

**Possible Causes:**
- No Defender products are deployed in the organization
- No paths exist based on the entities selected for the query or the filters applied to the query.

**Troubleshooting steps:**
- Confirm Defender products are deployed in the organization
- Check to see if there is a notification indicating there is no path based on the entity selected
- Clear all query filters and re-run the query
- Select different entities to re-run the query
- Run other predefined scenario queries.

**Reference Links:**
- [Setup guides for Microsoft Defender XDR - Microsoft Defender XDR | Microsoft Learn](https://learn.microsoft.com/en-us/defender-xdr/deploy-configure-m365-defender)
- [Overview of critical asset management in Microsoft Security Exposure Management - Microsoft Security Exposure Management | Microsoft Learn](https://learn.microsoft.com/en-us/security-exposure-management/critical-asset-management)

### Issue - Graph data freshness

**Symptoms:** Graph does not reflect the recently performed changes

**Possible Causes:**
- It takes time for the changes to be ingested and processed within the graph. The changes may take up to 24 hours to propagate and fully reflect in the graph.

**Troubleshooting steps:**
- Confirm if the data not reflecting correctly has been added/modified in less than 24 hours

**Next steps:**
- Create am IcM/CRI.

### Issue - Discrepancy in the Hunting predefined scenario graph

**Symptoms:** Discrepancy in the information associated with nodes and edges in the predefined scenario graph when compared to information available upon expanding the nodes in the graph.

**Possible Causes:**
- Information is not consistently reflected in the entire system.

Troubleshooting steps:
- Report a bug to MSEM team with the following information:
  - Tenant Id, domain
  - Entity with the discrepancy
     
### Issue - Graph to support Blast radius query is not available in the tenant

**Symptoms:** �View blast radius� menu item is greyed out and not clickable

**Possible Causes:**
- The tenant is not onboarded successfully to Sentinel Lake and Graph.

**Troubleshooting steps:**
- Check the onboarding state of the tenant
- Contact user with necessary pre-requisites to onboard the tenant to Sentinel Lake and graph

### Issue - Blast Radius is not available for some entities in the Incident graph

**Symptoms:** Selecting an entity shows �No blast radius found�

**Possible Causes:**
- There are no paths to targets within 5 hops based on the information currently available in the graph

**Troubleshooting steps:**
- Check other entities in the incident with �View blast radius� menu available
- Check other incidents if current incident does not have any entity with blast radius available
- Check if user has the reader permission to MSEM data
    
### Issue - Blast Radius option is not available for grouped entities in Incident graph

**Symptoms:** Clicking on grouped entities does not show the �View blast radius� menu option

**Possible Causes:**
- This is expected behavior for grouped nodes in Incident graph
Troubleshooting steps:
- Ungroup similar nodes by toggling �Group similar nodes�
- Select the ungrouped nodes and check for �View blast radius� menu

---
## Performance Issues

### Issue - Predefined scenario query takes too long

**Symptoms:**
- Query takes long time before returning the result and graph getting rendered based on the result
- Query times out and returns no result after long time (~8 minutes)

**Possible Causes:**
- Very large graph causing query performance degradation
- Query with filters is complex and results in high query execution time

**Troubleshooting steps:**
- Remove filters to the predefined scenario query
- Try scenario query with a different entity
- Try other predefined scenario queries

**Next steps:**
- Create an IcM/CRI.

---
# Advanced Troubleshooting Techniques

## Service TSGs

### Graph API Service

[Graph Interactive Tier Service TSGs | Microsoft Purview Team Docs](https://eng.ms/docs/microsoft-security/cloud-ecosystem-security/microsoft-sentinel-graph-msg/security-platform-ecosystem/security-platform-purview/microsoft-sentinel-graph-msg-team-docs/teams/msgapiservice/troubleshoot/graphinteractivetierservice/intro)

[Get Graph Scenario Failure | Microsoft Purview Team Docs](https://eng.ms/docs/microsoft-security/cloud-ecosystem-security/microsoft-sentinel-graph-msg/security-platform-ecosystem/security-platform-purview/microsoft-sentinel-graph-msg-team-docs/teams/msgapiservice/troubleshoot/graphinteractivetierservice/graphscenario/get_graph_scenario)

[Create Graph Scenario Failure | Microsoft Purview Team Docs](https://eng.ms/docs/microsoft-security/cloud-ecosystem-security/microsoft-sentinel-graph-msg/security-platform-ecosystem/security-platform-purview/microsoft-sentinel-graph-msg-team-docs/teams/msgapiservice/troubleshoot/graphinteractivetierservice/graphscenario/create_graph_scenario)

[Graph Scenario API High Failure Rate | Microsoft Purview Team Docs](https://eng.ms/docs/microsoft-security/cloud-ecosystem-security/microsoft-sentinel-graph-msg/security-platform-ecosystem/security-platform-purview/microsoft-sentinel-graph-msg-team-docs/teams/msgapiservice/troubleshoot/graphinteractivetierservice/graphscenario/high_error_mitigate)

### Graph Builder Service

[IcM: Customer failed to onboard graph | Microsoft Purview Team Docs](https://eng.ms/docs/microsoft-security/cloud-ecosystem-security/microsoft-sentinel-graph-msg/security-platform-ecosystem/security-platform-purview/microsoft-sentinel-graph-msg-team-docs/teams/msggraphbuilderservice/tsg/customer-failed-to-onboard-graph)

[IcM: Customer failed to refresh snapshot | Microsoft Purview Team Docs](https://eng.ms/docs/microsoft-security/cloud-ecosystem-security/microsoft-sentinel-graph-msg/security-platform-ecosystem/security-platform-purview/microsoft-sentinel-graph-msg-team-docs/teams/msggraphbuilderservice/tsg/customer-failed-to-refresh-snapshot)

[IcM: System Graph Spark Jobs Failed for Customers | Microsoft Purview Team Docs](https://eng.ms/docs/microsoft-security/cloud-ecosystem-security/microsoft-sentinel-graph-msg/security-platform-ecosystem/security-platform-purview/microsoft-sentinel-graph-msg-team-docs/teams/msggraphbuilderservice/tsg/system-graph-spark-job-failed-for-customer)

[IcM: Customer requests are inProgress for >N minutes | Microsoft Purview Team Docs](https://eng.ms/docs/microsoft-security/cloud-ecosystem-security/microsoft-sentinel-graph-msg/security-platform-ecosystem/security-platform-purview/microsoft-sentinel-graph-msg-team-docs/teams/msggraphbuilderservice/tsg/customer-graph-request-stuck-too-long)

---
### Log Analysis

#### Graph API Service
Example

```q
FidelisKustoServiceLogEvent
| where TenantId contains �<Tenant ID>�
| where CorrelationId contains �<Correlation ID>�
```

#### Sentinel Gateway
Example
```q
GatewayEvent
| where CallerTenantId contains �<Tenant ID>�
| where CorrelationId contains �<Correlation ID>�
```
---
### Service Health Dashboard

- Monitor service health through service dashboards and check for failures in specific regions and for specific tenants

| Name | Link | Access Requirements | |
|--|--|--|--|
| Graph API Service | [MSG Graph API Service - Dashboards - Grafana](https://msp-grafana-prod-cddydac8avcreecg.wus3.grafana.azure.com/dashboards/f/fej4omfygya68d/?orgId=1)| [TM-MSG-Partners](https://coreidentity.microsoft.com/manage/entitlement/entitlement/tmsecuritypl-u0fh) | Sentinel Graph ADO Access |
| Graph API Service | [MSG Graph Builder Service - Dashboards - Grafana](https://msp-grafana-prod-cddydac8avcreecg.wus3.grafana.azure.com/dashboards/f/aeq58wjmx9fk0a/msg-graph-builder-service) | [TM-MSG-Partners](https://coreidentity.microsoft.com/manage/entitlement/entitlement/tmsecuritypl-u0fh) | Sentinel Graph ADO Access |
---

---
### Useful Resources
- Microsoft Sentinel Lake Documentation
  - [Microsoft Sentinel data lake overview (preview) - Microsoft Security | Microsoft Learn](https://learn.microsoft.com/en-us/azure/sentinel/datalake/sentinel-lake-overview)
  - [Roles and permissions in the Microsoft Sentinel platform | Microsoft Learn](https://review.learn.microsoft.com/en-us/azure/sentinel/roles?branch=main)
- Microsoft Learn and Community Forums
  - [Setup guides for Microsoft Defender XDR - Microsoft Defender XDR | Microsoft Learn](https://learn.microsoft.com/en-us/defender-xdr/deploy-configure-m365-defender)
  - [Prerequisites and support in Microsoft Security Exposure Management - Microsoft Security Exposure Management | Microsoft Learn](https://learn.microsoft.com/en-us/security-exposure-management/prerequisites)

---
# Support Boundaries
If you have any support boundary concerns please refer to the 
[Support Boundaries - Microsoft Sentinel Graph (MSG)](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel/12572/-Support-Boundaries-Microsoft-Sentinel-Graph-(MSG)) page.


---
|Contributor Name|Details|Date(DD/MM/YYYY)|
|--|--|--|
| Avinash Pillai | Creator | 22/09/2025 |

---

---
:::template /.templates/Wiki-Feedback.md

:::  

---
:::template /.templates/Ava-GetHelp.md
:::