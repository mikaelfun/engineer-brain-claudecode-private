---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Metrics/Troubleshooting Guides/TSG:Resource-centric query and metrics"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitoring%20Essentials%2FMetrics%2FTroubleshooting%20Guides%2FTSG%3AResource-centric%20query%20and%20metrics"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Public Documentation
---


[Announcing resource-scope query for Azure Monitor Workspaces | Microsoft Community Hub](https://techcommunity.microsoft.com/blog/azureobservabilityblog/announcing-resource-scope-query-for-azure-monitor-workspaces/4460567)

# Troubleshooting:

## I dont have an option to view AMW metrics for a resource



*   Resourcescopedquerying overview:AMW supports queryingPromQLin the context of an Azure resourcevia the regional endpointhttps://query.region>.prometheus.monitor.azure.comandwhen used programmaticallythe custom header x-ms-azure-scoping: <ARMresourceId>. This experience underpins Portal View AMW metrics in editor and Grafanaresourcescopeddata sources.
    

*   Manage access to Azure Monitor workspaces:https://learn.microsoft.com/azure/azure-monitor/workspaces/manage-access  explainsAccess Control Modeand RBAC concepts that apply to AMW andresourcecontextaccess.
    

*   Rollout notes:New AMWs default toresourcecontextaccessin preview; existing (brownfield) AMWs mayrequireenabling/allowlisting or a Query Options toggle when available.
    

## Scenario

Customer symptom: On a resources Monitoring  Metrics blade, the View AMW metrics in editor entry point is not visible (or disabled), so the customer cannot explore AMW metrics for that resource from its context.

Applies to: Resources that emit or are associated with metrics stored in an AMW (e.g., AKS via Container Insights (postmigration), VMs via AMA/Perf Counters, App InsightsOTelmetrics). Curated experiences (e.g., VM Insights v2, App InsightsOTel) use this under the hood.

Quick triage (what usually causes the button to be missing)

1.  AMW configuration preventsresourcescopedvisibility
    

*   AMWAccess Control Modeis set toworkspaceonlyinstead ofworkspace and resource context.
    

*   Resourcecontextqueryis disabled on the AMW (indexing/label enrichment off). (Greenfield AMWs default on; brownfield may still be off.) See this link fordetails on how to enable this:[https://learn.microsoft.com/azure/azure-monitor/workspaces/manage-access](https://learn.microsoft.com/azure/azure-monitor/workspaces/manage-access)
    

2.  AuthZmisconfiguration
    

*   The viewing identitylacks Monitoring Readeron thetarget resource(Portal and managed identities honor resource permissions). If AMW isworkspaceonly, the identity also needsReader/Monitoring Readeron theAMW.
    

3.  No discoverable AMW metrics yet
    

*   The resourceisntsending metrics to any AMW (or is sending via legacy paths).
    

*   Ingestion is using anolder agent pathwithoutlabel stamping(Microsoft.resourceid,Microsoft.subscriptionid,Microsoft.resourcegroupname,Microsoft.resourcetype,Microsoft.amwresourceid).Or they are ingesting agentless (e.g.Prometheus Remote Write) which does not currently support stamping of these dimensions.
    

Decision flow:

Step A  Confirm the experience & scope

*   Where is the customer looking?Azure Portal ResourceMonitoring  Metrics(expectView AMW metrics in editor).
    

*   Which resource type & region?CaptureresourceIdand region.
    

*   Whatsthe AMW?If known, capture AMWresourceId; if unknown, keep going (resourcescopedoes not require the user to know the AMW). [
    

If the entry point is visible but results are empty orerrorout, switch to theOption present but not workingpath in Step D.

StepB Verify AMW configuration and ingestion path

These checks ensure the Portal can discover AMW metricsby resource.

1.  Access control mode &resourcecontextquery
    

*   Goal:AMW should allowresourcecontextaccessand haveresourcecontextqueryenabled (so data is indexed by resource and enriched with labels).
    

*   Where:If the AMW Query Options page exists, ensure:
    

*   Access control mode=Workspace and resource context access
    

*   Resourcecontextquery=Enabled
    

*   If the toggleisntpresent(older AMWs or during early preview), engage the AMW team perEscalationtoenable;greenfield AMWs default on.
    

2.  Agent/ingestion label stamping
    

*   Confirm metrics for this resource are sent viaAMAand includeMicrosoft.resourceid(newer AMA paths stamp automatically).Checka recent time range (new series only).
    

3.  AuthZcheck
    

*   The user must haveMonitoring Readeron the resource.
    

*   If AMW isworkspaceonly, the user also needsReader/Monitoring Readeron the AMW;otherwisethe Portal cannot surface the entry point for them.
    

If configuration is correct and the button is still missing  StepC.

Step C -DeterminewhetheritsUI discovery vs data availability/auth

Use these two quick probes:

1.  Programmatic probe (resourcescoped)
    

*   ![==image_0==.png](/.attachments/==image_0==-ebdb89bc-0a1d-4644-98dc-e540205e3380.png) Ask customer to run (or run on repro subscription) a simple query with theresource context header:
    

*   Expected:2xx with data (if resource has AMW metrics and you have permission).
    

*   Common errors:
    

*   401 missing/invalidAuthorizationheader AuthNissue
    

*   403 validAuthNbutno permissionon the scoped resource (or malformed scoping)
    

*   400/422/503queryerrors/timeouts (not a scoping problem)(AMW/PQS follows Prometheus HTTP API status semantics.)[[Resource-c...ntric Spec | Word]](https://microsoft.sharepoint.com/teams/PIEObservability/_layouts/15/Doc.aspx?sourcedoc=%7BFB32DB92-332E-43CD-AC96-EA6C9A3EA94F%7D&file=Resource-centric%20Spec.docx&action=default&mobileredirect=true&DefaultItemOpen=1)
    

2.  Containerscopedfallback sanity check
    

*   In the AMWsPromQLeditor (or Grafana with AMW endpoint), query a known metric and filter byMicrosoft.resourceid.
    

*   If this returns data:Metrics exist, label stamping is present, andAuthZto AMW is OK. The missingPortal entry pointislikely aUI flighting/configissue (go toEscalation).
    

*   If this does not return data:Investigate ingestion path (agent/DCR), or the resource simply has no AMW metrics yet.
    

# FAQs

*   Do customers need AMW access forresourcescopedqueries?Not ifthe AMWAccess Control Modeis workspace and resource context access. Withworkspaceonly, they must also have AMW permissions. This mirrors the LAW access mode concept.
    

*   Which labels enable resource scoping?AMWenriches withMicrosoft.resourceid,Microsoft.subscriptionid,Microsoft.resourcegroupname,Microsoft.resourcetype, andMicrosoft.amwresourceid(dedupe aid). These are stamped automatically via AMA in preview.
    

*   Grafana setup (resource scope):Use the regionalquery endpointas the server URL and set a custom header x-ms-azure-scoping: <scope>. If using OSS Prometheus data source with Managed Identity, grantMonitoring Readeron the scoped subscription/resource group/resource.
    

*   Why might a greenfield AMW behave differently from a brownfield AMW?New AMWsdefaulttoresourcecontextaccess in preview; existing AMWs mightrequireenablement/allowlisting until the UI/API toggle isgenerally available.
    

# Support boundaries

*   Portal/UX surfacing (button missing, controls disabled):Work with the Azure MonitorUXteam owning the Metrics blade integration for AMW. ProvideresourceId, subscription, region, and timestamp of repro.
    

*   AMW configuration & indexing (access mode,resourcecontextquery):AMW/PQSProduct Groupcontrols theaccessmodeflag, label stamping/indexing, and endpoint behavior. Provide AMWresourceIdand whether the AMW is greenfield/brownfield.
    

*   RBAC on Azure resources / identities:Standard AzureRBACguidance; ensureMonitoring Readerat the scope used for the query or data source.
    

# Product Group escalation

Owning service:Azure Monitor  AMW / Prometheus Query Service (PQS)When to escalate:

*   Confirmedsupportedresource type & region,correctAMWaccessmodeandresourcecontextsettings,properRBAC,validatedingestion with label stamping  yetPortal entry point is still missingor disabled for eligible users.
    

Include in the support ticket:

1.  Resource details:Subscription,resourceId, region; AMWresourceId(if known).
    

2.  Repro details:Browser profile steps, screenshots of the Metrics blade (missing entry point).
    

3.  Config evidence:AMWAccess Control ModeandResourcecontextquerysettings (screenshot/API output), whether AMW is new vs existing.
    

4.  Auth evidence:PrincipalobjectIdand RBAC assignments showingMonitoring Readeron the resource (and AMW ifworkspaceonly).
    

5.  Data probe:Results of theresourcescopedcurlandcontainerscopedPromQLfallback tests from Step C (includetimestamps and response codes).
    

6.  Rollout check:Note if similar resources/regions in the tenant show the entry point (helps separateflight/UIvsconfig)..