---
source: ado-wiki
sourceRef: "Supportability\AzureMonitor\AzureMonitor.wiki;C:\Program Files\Git\Azure Monitor\How-To\ICM\How to open a CRI (ICM) when Azure Support Center is down"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Azure%20Monitor/How-To/ICM/How%20to%20open%20a%20CRI%20%28ICM%29%20when%20Azure%20Support%20Center%20is%20down"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**

Do not follow the steps in this article or use any of the templates provided unless Azure Support Center is unavailable.  If Azure Support Center is available, CRIs should always be created via that tool following article [Product Group Escalation](https://aka.ms/azmonpgescalation).
</div>

[[_TOC_]]

# Instructions
---

:::template /.templates/AzMon-HowToCreateCRIWithoutASC.md
:::

# Templates
---
## Security Concern

| Template | Title | Description |
|:---------|:------|:------------|
| [z144Ob](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=z144Ob) | Azure Monitor \| Security Concern | Use this template to report a security concern. |

## General

| Template | Title | Description |
|:---------|:------|:------------|
| [F2e3Qe](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=F2e3Qe) | Azure Monitor \| Resource Provider Registration | Use this template for issues where an Azure Monitor resource provider is failing to register successfully. |
| [z144Ob](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=z144Ob) | Azure Monitor \| Security Concern | Use this template to report a security concern. |

## Alerting

| Template | Title | Description |
|:---------|:------|:------------|
| [343n2h](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=343n2h) | SEV2 - OUTAGE | Raise a Severity 2, high customer impact, Alerts and action groups outage incident. | 
| [61f2O2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=61f2O2) | Azure Monitor \| Log Alert (aka Log Search Alert) Rule Quota Increase | Use this template to request an increase in the number of active log alert (aka log search alert) rules allowed for a subscription or active alert rules per resource. | 
| [53b2d1](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=53b2d1) | Azure Monitor \| Metric Alert Rule Quota Increase | Use this template to request an increase in the number of active metric alert rules allowed for a subscription or metric time-series per alert rule. | 
| [u2P1rZ](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=u2P1rZ) | Azure Monitor \| Activity Log Alerts - Control Plane | Use this template for issues related to creating, reading, updating or deleting activity log alert rules. For issues with false / missed activity log alerts, use the Activity log alerts Data Plane escalation template. |
| [8oD23Y](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=8oD23Y) | Azure Monitor \| Activity Log Alerts - Data Plane - False or missed alerts | Use this template for issues related to any failures of Activity Log alerts to be processed correctly. For create / update / delete issues, use the Activity log alerts control plane escalation template. |
| [W19354](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=W19354) | Azure Monitor \| Log Alerts - Control Plane |Use this template for issues related to any failures of Log search alerts to be processed correctly, resulting in missed or false alerts. For create / update / delete issues, use the log alerts control plane escalation template. |
| [q3j2E2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=q3j2E2) | Azure Monitor \| Log Alerts (aka Log Search Alerts) - Data Plane - False or missed alerts | Use this template for issues related to any failures of Log search alerts to be processed correctly. For create / update / delete issues, use the log alerts control plane escalation template. |
| [HWK3O1](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=HWK3O1) | Azure Monitor \| Metric Alerts - Control Plane | Use this template for issues related to creating, reading, updating or deleting Metric alert rules, for issues related to creating, reading, updating or deleting Log to Metric (aka Metric on Logs) alert rules or for any failures of Log to Metric alerts. |
| [m1i1x2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=m1i1x2) | Azure Monitor \| Dynamic threshold - False or missed alerts | Use this template for issues related to any failures of dynamic threshold alert rules to be processed correctly, resulting in missed or false alerts. |
| [Mg1T2D](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Mg1T2D) | Azure Monitor \| Metric Alerts - Data Plane - False Alerts | Use this template for issues related to metric alert rule evaluations that resulted in the alert being fired unexpectedly (false alert).  Do not use this template for issues resulting from late arriving metric data from resource providers. |
| [w22c2u](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=w22c2u) | Azure Monitor \| Metric Alerts - Data Plane - Missed Alerts | Use this template for issues related to metric alert rule evaluations that resulted in the alert not being fired when expected (missed alert).  Do not use this template for issues resulting from late arriving metric data from resource providers. |
| [D143DT](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=D143DT) | Azure Monitor \| Alerts User Experience (UX) | Use this template for issues related to the alert rules in the Azure portal user experience (UX) such as problems creating, retrieving (or listing), updating or deleting alert rules. |
| [33J3P2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=33J3P2) | Azure Monitor \| Azure Notification Service (Action Groups) | Use this template for issues related to creating, reading, updating or deleting action groups or for actions or notifications that did not work as expected when an alert was fired and the action/notification was successfully sent to Azure Notification Service (AzNS). | 
| [h274z3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=h274z3) | Azure Monitor \| Microsoft Email Orchestrator (MEO, formerly AEO) | Use this template to request identification of the reason for an email notification failing to be delivered even though Azure Notification Service (AzNS) indicates it has been successfully completed. |
| [f1K312](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=f1K312) | Azure Monitor \| Alert Management Platform (AMP) | Use this template for issues relating to an alert that fires but does not get processed properly for actions/notifications.  Do not use this template if the action/notification was sent successfully to AzNS. |
| [ijp3h2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=ijp3h2) | Azure Monitor \| Alert Processing Rules (formerly Action Rules) | Use this template for issues related to the creation, reading, updating or deletion operations of an alert processing rule or for any failure of an alert processing rule to perform as expected (for example failure to suppress notifications or failure to apply an action group when an alert is fired). |
| [hc3e1D](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=hc3e1D) | Azure Monitor \| Application Insights Smart Detections | Use this template for all issues relating to Application Insights smart detection. | 
| [j2D1n3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=j2D1n3) | Azure Monitor \| ITSM Connector/ITSM Secure Export | Use this template for issues related to creating, reading, updating or deleting ITSM Connector/ITSM Secure Export or for any failures of ITSM Connector/ITSM Secure Export to process correctly. | 
| [b1blU2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=b1blU2) | Azure Monitor \| Classic Alert Migration | Use this template for all issues related to migration of classic alerts. | 
| [j1EPHA](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=j1EPHA) | Azure Monitor \| Prometheus Alerts - Control Plane | Use this template for issues related to creating, reading, updating or deleting Prometheus rule groups, alert rules or recording rules. |
| [E1N2M1](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=E1N2M1) | Azure Monitor \| Prometheus Alerts - Data Plane - False Alerts | Use this template for issues related to Prometheus alert rule evaluations that resulted in an alert being fired unexpectedly (false alert) or recording rules not working as expected.|
| [F04i3D](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=F04i3D) | Azure Monitor \| Prometheus Alerts - Data Plane - Missed Alerts | Use this template for issues related to Prometheus alert rule evaluations that resulted in an alert not being fired when expected (missed alert) or recording rules not working as expected.|

## AMPLS - Azure Monitor Private Link Scopes

| Template | Walmart-Only <br>ACE template | Title | Description |
|:---------|:------|:------|:------------|
| [5221h3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=5221h3) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=5221h3) | SEV2 - OUTAGE | Raise a Severity 2, high customer impact, Application Insights Outage incident. |
| [q3GH3I](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=q3GH3I) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=q3GH3I) | Azure Monitor Private Link Scope (AMPLS) | Issues connecting to or configuring AMPLS |

## Agents

| Template | Title | Description |
|:---------|:------|:------------|
| [xj3z3J](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=xj3z3J) | SEV2 - OUTAGE | Raise a Severity 2, high customer impact, Azure Monitor Agents Outage incident. | 
| [ma3n1c](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=ma3n1c) | Azure Log Analytics \| Windows Agents (aka MMA Agent for Windows) | Use this template for issues related to post MMA agent installation unable to upload Heartbeats or Data like Perf counters & Events to workspace. | 
| [Ci3v1e](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Ci3v1e) | Azure Log Analytics \| Linux Agents (aka OMS Agent for Linux) | Use this template for issues related to post Linux agent installation unable to upload Heartbeats or Data like Perf counters to workspace. | 
| [4231G3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=4231G3) | Azure \| Azure Monitor Agent for Windows | Use this template for issues related to Onboarding or post onboarding AMA agent for Windows unable to upload Heartbeats or Data via DCR. |  
| [n3w2h3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=n3w2h3) | Azure \| Azure Monitor Agent for Linux | Use this template for issues related to Onboarding or post onboarding AMA agent for Linux unable to upload Heartbeats or Data via DCR. |  
|[mri3w1](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=mri3w1) | Azure \| Data Collection Rules (aka DCR) | Use this template for issues related to DCR Creation & its association to VM issues. |  
|[w2n2x2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=w2n2x2) | Azure Monitor \| Linux Azure Diagnostics (aka LAD) | Use this template for issues related to Onboarding or post onboarding Linux Azure Diagnostic Agent unable to upload Data to Log Analytic workspace, storage account, Event Hubs. |  
|[V1O181](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=V1O181) | Azure Monitor \| Windows Azure Diagnostics (aka WAD) | Use this template for issues related to Onboarding or post onboarding Windows Azure Diagnostic Agent unable to upload Data to Log Analytic workspace, storage account, Event Hubs. |  
|[e3PF1y](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=e3PF1y) | Azure Monitor \| Migration helper tool for Windows agent (aka MMA) To AMA | Use this template for issues related to Migration helper tool for AMA - Windows. |  
|[X3K3f2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=X3K3f2) | Azure Monitor \| Migration helper tool for Linux agent (aka OMS) To AMA | Use this template for issues related to Migration helper tool for AMA - Linux |  

## Application Insights

**NOTE:** The second column is strictly for ACE engineers only, to open up Sev 2 CRIs for Walmart. 

| Template | Walmart-Only <br>ACE template | Title | Description | 
|:---------|:-------------|:---------|:----------------------|
| [5221h3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=5221h3) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=5221h3) | SEV2 - OUTAGE | Raise a Severity 2, high customer impact, Application Insights Outage incident. | 
| [q3GH3I](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=q3GH3I) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=H1Af20) | Azure Monitor Private Link Scope (AMPLS) | Issues with AMPLS |
| [Y3X1R3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Y3X1R3) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=U2aFO1) | Availability Tests | Issues with Availability Tests (not related to alert notifications) |
| [W2g323](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=W2g323) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=E2p1g3) | Billing | Issues involving amount billed |
| [117A1Y](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=117A1Y) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=v83Ht1) | Codeless Attach - .Net Framework (Status Monitor, IPA, AppServices, Functions) | Issues related to codeless attach issues involving .Net on various platforms and App Insights Agent(Status Monitor) |
| [q54E2R](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=q54E2R) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=a21z1z) | Codeless Attach - .Net Core (Status Monitor, IPA, AppServices, Functions)", | Issues related to codeless attach issues involving .Net Core on various platforms and App Insights Agent(Status Monitor) |
| [F14162](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=F14162) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=m52dk2) |Continuous Export  | Issues involving Continuous Export |
| [u1E1u3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=u1E1u3) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=43D2k1) | Control Plane issues | Issues involving ARM Template deployments or PS, CLI, etc creating, modifying, deleting App Insight resources |
| [r1Y2Z2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=r1Y2Z2) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=H1n2R8) | Investigate Experiences UX (for example AppMap, Search) | Issues related to noted blades not due to the underlying telemetry data |
| [74k3S8](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=74k3S8) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=c3U1N1) | Ingestion Latency or Missing Data | Ingestion issues related to missing data or latent data in general (NOT related to SDK issues) |
| [uZ312W](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=uZ312W) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=w1yO54) | Live Metrics | Issues related to Live Metrics |
| [Pn1xw3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Pn1xw3) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=zo3f17) | Profiler and Snapshot Debugger | App Insights Profiler and Snapshot Debugger issues |
| [B2X1w3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=B2X1w3) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=b264y2) | Querying Data | Issues involving querying App Insights data either in the Logs blade or via the APIs |
| [l2C1x1](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=l2C1x1) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=m3p2b1) | SDK - .Net Framework | Issues related to implementing or using .Net SDK (not a portal experience or latency issue) |
| [O2K1La](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=O2K1La) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=h1Bb1e) | SDK - .Net Core | Issues related to implementing or using .Net Core SDK (not a portal experience or latency issue) |
| [oS3E1c](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=oS3E1c) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=n3g2I3) | SDK - JAVA | Issues related to implementing or using JAVA SDK or JAVA 3.X stand alone agent (NOT javascript) |
| [93n1X3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=93n1X3) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=e2xW2u) | SDK - JavaScript | Issues related to implementing or using JavaScript (NOT Java SDK) |
| [u3H374](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=u3H374) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=a1d3U2) | SDK - Node.JS | Issues related to implementing or using Node.JS SDK |
| [h362ml](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=h362ml) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=U3Ij2V) | SDK - Python | Issues related to implementing or using Python SDK |
| [n3pP1G](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=n3pP1G) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Z3N1uw) | User Analytics (Users/Sessions/Events) | Issues related to noted blades not due to the underlying telemetry data |
| [8211P3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=8211P3) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=8211P3) | Work Items | Issues involving work item integration |
| [k3Q244](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=k3Q244) | [ACE CRI](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=71f143) | Quota or Limit Increases | Customers asking to increase Quota, Throttle or other Limits |

## Carbon Optimization

| Template | Title | Description |
|:---------|:------|:------------|
| [p2n1G1](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=p2n1G1) | Azure Monitor \| Carbon Optimization | Use this template for all issues relating to Azure Carbon Optimization. |

## Insights and Workbooks

### Container Insights (aka Insights for Containers)

| Template | Title | Description |
|:---------|:------|:------------|
|[w71A2W](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=w71A2W) | SEV2 - OUTAGE | Raise a Severity 2, high customer impact, Container Insights Outage incident. |
| [P1G2V2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=P1G2V2) | Azure Monitor \| Container Insights (aka Insights for Containers) | Use this template for issues related to onboarding Container Insights, issues related to the containerized agent and issues with viewing and using container monitoring. | 
| [ma3n1c](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=ma3n1c) | Azure Log Analytics \| Agent | Use this template for issues related to Log Analytics agent (omsagent) for the containers host.  Do not use this template for issues with the agent used inside the containers (containerized agent). | 

### Managed Grafana

| Template | Title | Description |
|:---------|:------|:------------|
|[C304bO](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=C304bO) | SEV2 - OUTAGE | Raise a Severity 2, high customer impact, Azure Managed Grafana Outage incident. |
| [R1q3r2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=R1q3r2) | Azure Monitor \| Grafana Workspace | Use this template for issues relating to Grafana Workspaces on Azure. |
| [54S2D3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=54S2D3) | Azure Monitor \| Granfana Workspace Data Sources | Use this template for issues relating to data sources configured for a Grafana Workspace on Azure (for example Azure Monitor, Azure Monitor Container Insights). |

### Managed Prometheus

| Template | Title | Description |
|:---------|:------|:------------|
|[k35n3i](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=k35n3i) | SEV2 - OUTAGE | Raise a Severity 2, high customer impact, Azure Managed Prometheus Outage incident. |
| [82U1L3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=82U1L3) | Azure Monitor \| Azure Managed Prometheus - AMCS | Use this template for issues relating to creation, reading, updating or deletion operations of an Azure Monitor Workspace. |
| [f3tR1U](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=f3tR1U) | Azure Monitor \| Azure Managed Prometheus - PromWebAPI | Use this template for issues relating to querying metrics via Prometheus Query Service (PQS) / Prometheus Web API. |
| [318314](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=318314) | Azure Monitor \| Azure Managed Prometheus - Agent | Use this template for issues related to the Azure Managed Prometheus Agent as well as issues with the Managed Prometheus dashboards in Azure Managed Grafana.
| [34r3Jg](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=34r3Jg) | Azure Monitor \| Azure Managed Prometheus - Insights UX | Use this template for portal issues related to the Insights tab in the portal for Azure Managed Prometheus and Container Insights. 
| [x23314](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=x23314) | Azure Monitor \| Azure Managed Prometheus - AMW Quota Requests | Use this template to request quota limit increases on Azure Monitor Workspaces associated with Azure Managed Prometheus.
| [r144V3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=r144V3) | Azure Monitor \| Azure Managed Prometheus - AMW UX | Use this template for portal issues related to the Azure Monitor Workspaces UX.

### VM Insights (aka Insights for Virtual Machines)

| Template | Title | Description |
|:---------|:------|:------------|
|[Nq1M2r](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Nq1M2r) | SEV2 - OUTAGE | Raise a Severity 2, high customer impact, VM Insights Outage incident. |
| [33v1f2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=33v1f2) | Azure Monitor \| VM Insights Performance and Map | Use this template for issues relating to VM Insights Performance or Map content including issues with the Dependency Agent (DA).  Note: For issues with data not being sent to Log Analytics, update SAP and use templates appropriate for agent issues. | 

### Workbooks

| Template | Title | Description |
|:---------|:------|:------------|
|[p1N302](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=p1N302) | SEV2 - OUTAGE | Raise a Severity 2, high customer impact, Azure Workbooks Outage incident. |
| [13J222](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=13J222) | Azure Monitor \| Azure Workbooks | Use this template for issues relating to creation, reading, updating or deletion operations of an Azure Workbook or for any issues related to using or authoring a workbook. | 

### Azure Monitor Pipeline
| Template | Title | Description |
|:---------|:------|:------------|
| [C1152M](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=C1152M) | Azure Monitor Pipeline | Use this template for issues related to Azure Monitor Pipelines|
| [01Bt1b](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=01Bt1b) | Azure Monitor Pipeline MOD | Use this template for issues related to Azure Monitor Pipelines for the Customer **MOD** or **Fuseti** |


## Log Analytics


| Template | Title | Description |
|:---------|:------|:------------|
| [giB271](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=giB271) | SEV2 - OUTAGE | Raise a Severity 2, high customer impact, Log Analytics Outage incident. | 
| [h2B2Bd](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=h2B2Bd) | Azure Log Analytics \| Core | |
| [z2S3yk](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=z2S3yk) | Azure Log Analytics \| Portal | |
| [44d2Wn](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=44d2Wn) | Azure Log Analytics \| Ingestion | |
| [ma3n1c](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=ma3n1c) | Azure Log Analytics \| Agent | |
| [g1i2ub](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=g1i2ub) | Azure Log Analytics \| Billing | |
| [41pbJ3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=41pbJ3) | Azure Log Analytics \| Draft | |
| [o2hz1K](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=o2hz1K) | Azure Log Analytics \| General-EEE | |

## Monitor Essentials

### Activity Logs

| Template | Title | Description |
|:---------|:------|:------------|
| [i3cD2r](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=i3cD2r) | Azure Monitor \| Activity Logs portal user experience | Use this template for issues with Activity Logs user experience in Azure portal. |
| [B2tG2x](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=B2tG2x) | Azure Monitor \| Activity Logs Query and API | Use this template for issues with Activity logs REST API or with issues relating to results returned by querying the Activity logs (for example, events that are expected but missing). |
| [S2hGO3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=S2hGO3) | Azure Monitor \| Activity Logs | Use this template for issues relating to the Azure Activity Logs platform.  Do not use this template for issues with the REST API, query of events or Azure portal experience. | 
| [Y2C2L3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Y2C2L3) | Azure Monitor \| Activity Log Change History | Use this template for issues relating to the change history feature when viewing Azure activity log events. |

### Autoscale

| Template | Title | Description |
|:---------|:------|:------------|
| [PaRm2Q](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=PaRm2Q) | Azure Monitor \| Autoscale | Use this template for issues relating to creation, reading, updating or deletion operations of an Autoscale setting or for any issues related to the Autoscale settings not performing as expected. | 

### Resource Logs and Diagnostic Settings

| Template | Title | Description |
|:---------|:------|:------------|
| [wS9E3o](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=wS9E3o) | Azure Monitor \| Delete orphaned Diagnostic Settings | Use this template to submit a request to have orphaned diagnostic settings deleted. | 
| [73b3W1](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=73b3W1) | Azure Monitor \| Diagnostic Logs (Resource Logs) missing | Use this template for issues relating to logs that did not reach their intended Log Analytics workspace, Storage account, Event Hub or Marketplace (Partner Solution) destination(s). |
| [72N3v1](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=72N3v1) | Azure Monitor \| Diagnostic Logs (Resource Logs) latency | Use this template for issues relating to logs that reached their intended Log Analytics workspace, Storage account, Event Hub or Marketplace (Partner Solution) destination(s) but did so with latency. |
| [820141](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=820141) | Azure Monitor \| Diagnostic Logs and Diagnostic Settings | Use this template for issues relating to creation, reading, updating or deletion operations of a diagnostic setting or for any issues related to diagnostic settings that are not addressed by one of the other templates. | 

### Metrics

| Template | Title | Description |
|:---------|:------|:------------|
| [N2N3j3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=N2N3j3) | Azure Monitor \| Metrics Export | Use this template for issues related to the Metrics Export functionality. |
| [73m1Rl](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=73m1Rl) | Azure Monitor \| Metrics | Use this template for issues related to the Metrics platform, issues using Metrics Explorer or issues working with the Metrics REST APIs. | 
| [73m1Rl](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=73m1Rl) | Geneva Monitoring \| Ingestion Gateway Support - Tier 2 | Use this template for issues ingesting the custom metrics |

## Resource Health and Service Health

| Template | Title | Description |
|:---------|:------|:------------|
| [O2v3E1](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=O2v3E1) | Azure Monitor \| Service Health Activity Log Missing or Incorrect| Use this template for issues related to Service Health events that exist but a corresponding Activity Log event was not created or was created but has incorrect or unexpected information. |
| [61E1N3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=61E1N3) | Azure Monitor \| Service Health Activity Log Delayed | Use this template for issues related to a Service Health event that exists and where an Activity Log event was created but the Activity Log event creation was delayed getting from Azure Communications Manager (Service Health) to Activity Log. |
| [r3O263](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=r3O263) | Azure Monitor \| Service Health| Use this template for issues related to Service Health for which there is no other template, including querying data from Service Health APIs. |
| [s1k2V2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=s1k2V2) | Azure Monitor \| Resource Health Activity Log Missing or Incorrect | Use this template for issues related to a Resource Health event that exists but a corresponding Activity Log event was not created, or was created but has incorrect or unexpected information. |
| [T104M1](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=T104M1) | Azure Monitor \| Resource Health Activity Log Delayed | Use this template for issues related to a Resource Health event that exists and where an Activity Log event was created but the Activity Log event creation was delayed getting from Geneva Health (Resource Health) to Activity Log. |
| [i3y24t](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=i3y24t) | Azure Monitor \| Resource Health | Use this template for issues related to Resource Health for which there is no other template, including querying data from Resource Health APIs. |

## SCOM Managed Instance

| Template | Title | Description |
|:---------|:------|:------------|
| [PF1B25](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=PF1B25) | Azure Monitor \| SCOM Managed Instance | Use this template for issues related to SCOM Managed Instance. |

## Azure CLI, PowerShell and SDK

| Template | Title | Description |
|:---------|:------|:------------|
| [662M3q](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=662M3q) | Azure Monitor \| Azure CLI | Use this template for issues with Azure CLI related to Azure Monitor features (az monitor) that are NOT a problem with the underlying Azure Monitor REST APIs.  REST API issues should be raised using the appropriate template for the related technology. |
| [q1o3e2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=q1o3e2) | Azure Monitor \| Azure PowerShell | Use this template for issues with Azure PowerShell SDK related to Azure Monitor features (Az.Monitor) that are NOT a problem with the underlying Azure Monitor REST APIs.  REST API issues should be raised using the appropriate template for the related technology. |
| [U3VK3b](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=U3VK3b) | Azure Monitor \| Azure SDK - Management Clients | Use this template for issues with Azure SDKs other than Azure PowerShell and Azure CLI (for example .NET, Java, JavaScript, Python) that are NOT a problem with the underlying Azure Monitor REST APIs.  REST API issues should be raised using the appropriate template for the related technology. |

## Partner Solutions

| Template | Title | Description |
|:---------|:------|:------------|
| [B1X42s](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=B1X42s) | Partner Solutions \| Apache Airflow on Astro (Astronomer) | Use this template for issues raised by Microsoft partner Astro relating to Liftr solution Apache Airflow on Astro (Astronomer) integration. |
| [v1ua2Y](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=v1ua2Y) | Partner Solutions \| Confluent | Use this template for issues raised by Microsoft partner Confluent relating to Liftr solution Confluent integration. |
| [o3o2V2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=o3o2V2) | Partner Solutions \| Datadog | Use this template for issues raised by Microsoft partner Datadog relating to Liftr solution Datadog Integration. |
| [G371x2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=G371x2) | Partner Solutions \| Dynatrace | Use this template for issues raised by Microsoft partner Dynatrace relating to Liftr solution Dynatrace Integration. |
| [91ZM3H](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=91ZM3H) | Partner Solutions \| Elastic | Use this template for issues raised by Microsoft partner Elastic relating to Liftr solution Elastic Integration. |
| [54d1M1](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=54d1M1) | Partner Solutions \| Informatica | Use this template for issues raised by Microsoft partner Informatica relating to Liftr solution Informatica integration. |
| [O1w2v1](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=O1w2v1) | Partner Solutions \| MongoDB | Use this template for issues raised by Microsoft partner Informatica relating to Liftr solution MongoDB integration. |
| [vm2G27](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=vm2G27) | Partner Solutions \| Neon Serverless Postgres | Use this template for issues raised by Microsoft partner Neon relating to the Liftr solution Neon Serverless Postgres integration. |
| [B2W1b1](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=B2W1b1) | Partner Solutions \| New Relic | Use this template for issues raised by Microsoft partner New Relic relating to Liftr solution New Relic integration. |
| [K20111](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=K20111) | Partner Solutions \| All other Azure Native Integrations partners (aka Liftr Lite or Liftr Basic) | Use this template for issues raised for any other Azure Native Integration. |
