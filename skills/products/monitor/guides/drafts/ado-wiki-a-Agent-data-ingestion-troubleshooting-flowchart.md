---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Agent data ingestion troubleshooting flowchart"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FAgent%20data%20ingestion%20troubleshooting%20flowchart"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">
   
   **Note**

This wiki page does not include information for the new ingestion pipeline (**NorthStar**), so you can only use it when the data type you're troubleshooting is being sent via **INMEM**. 

If you don't know which pipeline you should troubleshoot, please follow [HT: Determine which pipeline is processing a given data type](/Log-Analytics/How%2DTo-Guides/Ingestion/HT:-Determine-which-pipeline-is-processing-a-given-data-type)
   </div>


# Instructions
---
Before you start this flowchart, make sure you have the following information:
- A clear understanding of the issue
- Data type (Perf, Heartbeat, Event, etc)
- Workspace ID
- Workspace region
- The computer name, the Azure ResourceID or the Azure Arc for enabled servers ResourceID
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
A(ODS - Agent or HTTP Data Collection API) --> KI;
KI(Check for known issues or outages) -->KIF;
 click KI "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750271/Known-Issues";
 style KI fill:#FFFAF0,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
 KIF{Is it a known issue?};
 KIF --> | Yes | KIF1(Proceed according to the wiki<br>article or outage info page);
 style KIF1 fill:#9ACD32,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
 KIF --> | No \ Not sure| D{What's the issue type?};;
D --> | Data Missing | F{Are all agent data types missing?};
D --> | Data Latency | G[Run Latency Analysis in<br>Azure Support Center];
click G "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750258/How-to-Check-the-latency-or-delay";
style G fill:#FFFAF0,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
F --> | No \ Not sure | K{Is the relevant data type reaching ODS?};
click K "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750227/HT-What-Agent-data-types-are-reaching-ODS";
style K fill:#FFFAF0,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
F --> | Yes| J(Follow Agents Troubleshooting Guides<br>Follow Agents PG escalation path);
 click J "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605514/Agents";
 style J fill:#FFE4B5,stroke:#191970,stroke-width:2px,stroke-dasharray: 5, 5;
K --> | Yes | M(Check daily cap limit);
M --> N(Check InMem for ingestion errors);
click N "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750225/HT-How-to-check-for-ingestion-errors";
style N fill:#FFFAF0,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
N --> N1{Is it a documented ingestion error?};
N1 --> | Yes| N13(Follow the instructions on the wiki article);
 style N13 fill:#9ACD32,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
K --> | No | J;
N1 --> | No | N11(Engage the Ingestion PG);
 click N11 "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750215/IcM-Templates-Index-support-topic-mappings?anchor=azure-log-analytics-%7C-ingestion";
 style N11 fill:#00BFFF,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
G --> O{Was latency detected?};
O --> | No | P(If the time interval is correct,<br>then there's no issue.)
 style P fill:#9ACD32,stroke:#f66,stroke-width:2px,stroke-dasharray: 5, 5;
O --> | Yes | Q(Follow the instructions provided<br>on the Latency Analysis output)
:::
