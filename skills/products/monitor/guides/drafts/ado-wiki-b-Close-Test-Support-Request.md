---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/General/How to close a test support request"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAzure%20Monitor%2FHow-To%2FGeneral%2FHow%20to%20close%20a%20test%20support%20request"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Introduction

Test cases are created for the sake of testing out scenarios ranging from the support request creation experience to testing internal diagnostic and troubleshooting tools. Since we don't want these test cases to impact our KPIs, the support requests should be closed under a specific SAP.

# Instructions

1. Update the Support Area Path (SAP, aka Support Topic) of the support request to **Windows\PSS Other**.
2. Meet the initial response. It is recommended to use a phone call log so as not to inadvertently communicate with whomever opened the test case. [Learn more](https://dev.azure.com/CSSToolsPM/Dynamics%20for%20Microsoft/_wiki/wikis/DfM/48/Meeting-IR-SLA) about how to meet initial response in DfM.
3. Initiate the normal process for closing the support request.
4. Populate the resolution summary to clearly identify that the support request was for testing purposes.
5. When selecting the reason for closing the support request, choose **Duplicate**.
6. Complete the process of closing the support request.
