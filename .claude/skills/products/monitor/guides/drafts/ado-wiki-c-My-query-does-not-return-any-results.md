---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Query execution/My query does not return any results"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FQuery%20execution%2FMy%20query%20does%20not%20return%20any%20results"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">

   **Note**

This troubleshooting guide (TSG) does not cover Errors returned while running a query. 
To address this topic, **and for issues with Partial Results please refer to:** [Common queries issues and how to handle them](/Log-Analytics/Troubleshooting-Guides/Query-execution/Common-queries-issues-and-how-to-handle-them)
   </div>



# Always start with checking if the desired logs have been sent by the source
---
<div style="margin:25px">
The vast majority of data types (tables) in Log Analytics are <b>PUSHED by a certain source to the Log Analytics workspace</b> (that is, ingested rather than pulled).
This means that the very first thing one need to check is whether or not the desired logs have been pushed to the workspace  by the relevant source.
<b>The best method to check it would be to inspect whether the data reached the very first-hop on the ingestion pipeline.
Each datatype(table) has a different first-hop:</b>
</div>

###Legacy agents (OMS and MMA) and HTTP Data Collector API are sending directly to ODS endpoint, hence check if relevant data reached ODS for these:
<div style="margin:25px">

[HT: What Agent data types are reaching ODS](/Log-Analytics/How%2DTo-Guides/Ingestion/HT:-What-Agent-data-types-are-reaching-ODS)

[How to: Investigate Data Collector API Custom Logs](/Log-Analytics/Troubleshooting-Guides/Data-sources/APIs/How-to:-Investigate-HTTP-Data-Collector-API-Custom-Logs)

</div>

###Resource logs (AzureDiagnostics, Resource-specific tables, AAD logs sent to Log Analytics, Diagnostic-settings based Activity Logs etc.) are going sending directly to OBO, hence check if relevant data reached OBO first:
<div style="margin:25px">

[Troubleshooting Resource Log data not being received by target destinations](/Monitoring-Essentials/Diagnostic-Settings/Troubleshooting-Guides/Troubleshooting-Resource-Log-data-not-being-received-by-target-destinations)

</div>

#If no logs have been pushed by the source
Please engage with the source owning team to address this issue.
NOTE: Some of the sources are owned by Azure Monitor (For example, MMA,OMS,AMA) hence are handled within Azure Monitor team.

#If Logs have been pushed by the source
Please proceed with the investigation by checking the other possibilities below.
**NOTE: You should first check if there is an Outage effectively affecting your customer that could explain missing data.**

<details closed>
<summary><b>1. Logs are not showing due to an ingestion issue</b></summary>
<div style="margin:25px">
See:
<a href="https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750362/Data-ingestion-troubleshooting-flowchart">Data Ingestion Troubleshooting Flowchart</a>
<br>
</div>
</details>

<details closed>
<summary><b>2. Logs are not showing due to Latency</b></summary>
<div style="margin:25px">
See:
<a href="https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750258/How-to-Check-the-latency-or-delay">How to check the latency or delay</a>
<br>
</div>
</details>

<details closed>
<summary><b>3. Logs are not showing due to lack of permissions</b></summary>
<div style="margin:25px">
<P style="margin:0in;font-family:Calibri;font-size:11.0pt">Lack of permissions
may lead to no results when running a query even if the logs have been properly
ingested.</P>

<UL  type=disc style="margin-top:0in;margin-bottom:0in">
 <LI style="margin-top:0;margin-bottom:0;vertical-align:middle"><SPAN style="font-family:Calibri;font-size:11.0pt">Check the </SPAN><SPAN style="font-weight:bold;font-family:Calibri;font-size:11.0pt">scope </SPAN><SPAN style="font-family:Calibri;font-size:11.0pt">the query is executed with </SPAN><SPAN style="font-weight:bold;font-family:Calibri;font-size:11.0pt">(Access
     Mode)</SPAN><SPAN style="font-family:Calibri;font-size:11.0pt">.</SPAN></LI>
</UL>

<P style="margin:0in;margin-left:.375in;font-family:Calibri;font-size:11.0pt">When
using resource-context, It might limit the query result set and hide some logs.</P>

<P style="margin:0in;margin-left:.375in;font-family:Calibri;font-size:11.0pt">Try
using the right scope or workspace-context to verify you are not limiting the
query and result set.</P>

<UL  type=disc style="margin-top:0in;margin-bottom:0in">
 <LI style="margin-top:0;margin-bottom:0;vertical-align:middle"><SPAN style="font-family:Calibri;font-size:11.0pt">Check the workspace </SPAN><SPAN style="font-weight:bold;font-family:Calibri;font-size:11.0pt">Access
     Control Mode</SPAN><SPAN style="font-family:Calibri;font-size:11.0pt">.</SPAN></LI>
</UL>

<P style="margin:0in;margin-left:.375in;font-family:Calibri;font-size:11.0pt">If
it is set with <SPAN style="font-weight:bold">'Use resource or workspace
permissions'</SPAN> it might be that the affected users do not have access to
the Resources which ingest data hence not showing related data. This mode means - if the user has read access to the resource, the he can read data from the workspace related to the resource based on the presence of a populated _ResourceId, regardless of whether he has access to the workspace itself. If the customer has the 'Require workspace permission mode' enabled on the workspace, then the user msut also have access to the workspace itself to read data from it.</P>

<UL  type=disc style="margin-top:0in;margin-bottom:0in">
 <LI style="margin-top:0;margin-bottom:0;vertical-align:middle"><SPAN style="font-family:Calibri;font-size:11.0pt">Check if the affected user</SPAN><SPAN style="font-weight:bold;font-family:Calibri;font-size:11.0pt"> has access
     to the desired table(s) or not.</SPAN></LI>
</UL>

<P style="margin:0in;margin-left:.375in;font-family:Calibri;font-size:11.0pt">&nbsp;</P>

For more information please check: [Manage access to Log Analytics workspaces - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/azure/azure-monitor/logs/manage-access?tabs=portal)

</div>
</details>

<details closed>
<summary><b>4. Logs are not showing because of an incorrect query</b></summary>
<div style="margin:25px">
<P style="margin:0in;font-family:Calibri;font-size:11.0pt">If customers run a
query which isn't valid from a logical perspective, they might miss the results
they are after.</P>

<P style="margin:0in;font-family:Calibri;font-size:11.0pt">Common reasons can
be:</P>

<UL  type=disc style="margin-top:0in;margin-bottom:0in">
 <LI style="margin-top:0;margin-bottom:0;vertical-align:middle"><SPAN style="font-weight:bold;font-family:Calibri;font-size:11.0pt">Incorrect
     filtering conditions used within the affected query</SPAN></LI>
 <LI style="margin-top:0;margin-bottom:0;vertical-align:middle"><SPAN style="font-weight:bold;font-family:Calibri;font-size:11.0pt">Check if
     this could be as a result of the following Logical Behaviors: 'has',
     default 'join' flavor, 'take'/'limit'.</SPAN></LI>
</UL>

See: [Common queries issues and how to handle them - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750401/Common-queries-issues-and-how-to-handle-them?anchor=queries-logical-issues)

<UL  type=disc style="margin-top:0in;margin-bottom:0in">
 <LI style="margin-top:0;margin-bottom:0;vertical-align:middle"><SPAN style="font-weight:bold;font-family:Calibri;font-size:11.0pt">You can
     carefully use the 'search'\'find' operators to try and fetch a sample
     record</SPAN><SPAN style="font-family:Calibri;font-size:11.0pt"> that will
     show whether the raw data the customer is after exists or not.</SPAN></LI>
</UL>

<P style="margin:0in;margin-left:.375in;font-family:Calibri;font-size:11.0pt">(Please
use &quot;search&quot;\&quot;find&quot; for sampling only as these functions
are not efficient performance wise)</P>

<UL  type=disc style="margin-top:0in;margin-bottom:0in">
 <LI style="margin-top:0;margin-bottom:0;vertical-align:middle"><SPAN style="font-weight:bold;font-family:Calibri;font-size:11.0pt">You can work
     with the owning team of the relevant table(s) and data to figure out the
     right queries to be used.</SPAN><SPAN style="font-family:Calibri;font-size:11.0pt"> Refer to Support boundaries on our Wikis (Or TA\SMEs)
     to determine which team supports the corresponding content of these
     tables.</SPAN></LI>
</UL><br>
</div>
</details>
