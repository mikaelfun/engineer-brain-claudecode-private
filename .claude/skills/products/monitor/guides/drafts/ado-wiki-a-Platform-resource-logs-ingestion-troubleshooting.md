---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Azure platform and resource logs data ingestion troubleshooting workflow"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FAzure%20platform%20and%20resource%20logs%20data%20ingestion%20troubleshooting%20workflow"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">
   
   **Note**

This wiki page does not include information about the new ingestion pipeline (**NorthStar**), so you can only use it when the data type you're troubleshooting is being sent via **INMEM**. 

If you don't know which pipeline you should troubleshoot, please follow [HT: Determine which pipeline is processing a given data type](/Log-Analytics/How%2DTo-Guides/Ingestion/HT:-Determine-which-pipeline-is-processing-a-given-data-type)

We're in the process of adding new information about the **NorthStar** pipeline and\or create new separate wiki pages, so please check this page regularly. 
   </div>

# Important information
---
All issues related with platform and resource logs should investigated using this TSG:[Troubleshooting Resource Log data not being received by target destinations](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480552/Troubleshooting-Resource-Log-data-not-being-received-by-target-destinations)

# Instructions
---
Before you start this flowchart, make sure you have the following information:
- A clear understanding of the issue
- Data type (AzureDiagnostics, AzureActivity,etc)
- The ResourceID of the relevant resource(s)
- Workspace ID
- Workspace region
- Time interval of the issue (if limited to an interval)

# Flowchart blocks description and usage
---
## 'How-to' block
The blocks with the red dotted line border include a link to the relevant 'How-to', so please press 'CTRL + mouse click' to open the links in a new tab:

::: mermaid
 graph TD;
 A(Example:<br>Press the CTRL key on the keyboard and then click this button);
 click A "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/617654/Log-Analytics";
 style A fill:#FFFAF0,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
::: 

## 'Jump to new workflow' block
The blocks with the blue dotted line border and orange background, include a link to another workflow (please press 'CTRL + mouse click' to open the links in a new tab:
::: mermaid
 graph TD;
 A(Example:<br>Select this button to open the new workflow);
 click A "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/617654/Log-Analytics";
 style A fill:#FFE4B5,stroke:#191970,stroke-width:2px,stroke-dasharray: 5, 5;
:::

## 'Engage PG' block
The blocks with the red dotted line border and light blue background, include a link to the article on how to engage the PG (please press 'CTRL + mouse click' to open the links in a new tab:
::: mermaid
 graph TD;
 A(Example:<br>Select this button know how to engage the PG);
 click A "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/617654/Log-Analytics";
 style A fill:#00BFFF,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
:::

# Flowchart
---

::: mermaid
 graph TD;
A(OBO - Azure platform and resource logs) --> KI;
KI(Check for known issues or outages) -->KIF;
 click KI "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750271/Known-Issues";
 style KI fill:#FFFAF0,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
 KIF{Is it a known issue?};
 KIF --> | Yes | KIF1(Proceed according to the wiki<br>article or outage info page);
 style KIF1 fill:#9ACD32,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
 KIF --> | No \ Not sure| E{What's the issue type?};
E --> | Data Missing | E1(Check if the data is reaching OBO);
click E1 "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480502/How-to-check-if-resource-provider-sent-data-to-OnBehalfOf-service-in-Kusto";
style E1 fill:#FFFAF0,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
E1 --> H{Is the data reaching OBO?};
E --> | Data Latency | I[Run Latency Analysis in<br>Azure Support Center];
click I "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750258/How-to-Check-the-latency-or-delay";
style I fill:#FFFAF0,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
N(Check InMem for ingestion errors);
click N "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750225/HT-How-to-check-for-ingestion-errors";
style N fill:#FFFAF0,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
N --> N1{Is it a documented ingestion error?};
N1 --> | Yes| N13(Follow the instructions on the wiki article);
 style N13 fill:#9ACD32,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
N1 --> | No | N11(Engage the Ingestion PG);
 click N11 "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750215/IcM-Templates-Index-support-topic-mappings?anchor=azure-log-analytics-%7C-ingestion";
 style N11 fill:#00BFFF,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
H --> | Yes| N
H --> | No | H1(Engage the Resource Provider team)
 style H1 fill:#FFE4B5,stroke:#191970,stroke-width:2px,stroke-dasharray: 5, 5;
I --> I1{Was latency detected?}
I1 --> | Yes | I3(Check OBO latency)
click I3 "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750258/How-to-Check-the-latency-or-delay?anchor=resource-logs";
style I3 fill:#FFFAF0,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
I1 --> | No | I2(If the time interval is correct,<br>then there's no issue.)
 style I2 fill:#9ACD32,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
I3 --> I4{Is there OBO latency?}
I4 --> | No | N11
I4 --> | Yes | I6(Engage the Resource Provider team)
 style I6 fill:#FFE4B5,stroke:#191970,stroke-width:2px,stroke-dasharray: 5, 5;
:::

