---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Beta Resources - Pre-GA/Winfield Bugs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Beta%20Resources%20-%20Pre-GA/Winfield%20Bugs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Filing bugs

Bug template: http://aka.ms/aldo-bug

No regular cadence for bug reviews at this time.

## General guidance:

- If you need to file a "blocking" bug, run it by PG first ([ArcA service owners](https://dev.azure.com/azssaturn/Documentation/_wiki/wikis/Documentation.wiki?wikiVersion=GBwikiMaster&pagePath=/Products/ArcA%20%252D%20Azure%20Arc%20Autonomous/ArcA%20Troubleshooting%20Guide/ArcA%20service%20owners)).
- Please add the following tags: 
   * [CSS] for bugs opened by CSS
   * [Customer]
   * [buildNumber]

Screenshot showing expected tags:

![image.png](/.attachments/image-074aa144-f9d4-432c-b97e-05d9360e4eee.png)

### External private and public preview bugs

Bugs for issues raised by external customers and partners should be raised with the same template as above, but tagged: `<EPP><Name of customer> Short description of issue`

### Internal private preview (inactive)

Teams channel for internal Winfield support: [Winfield Internal MSFT Preview | Support | Microsoft Teams](https://teams.microsoft.com/l/channel/19%3Ad54d22f8cb2b402dac258f0649c549a5%40thread.tacv2/Support?groupId=41d90929-beb4-4712-922c-d0db99c82b91&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)
If you don't get a response in Teams within a few days, file a bug, and add a bug link to the Teams thread.

## Info needed in bug template:

- What's the issue?
- Customer Impact?
- Any workaround?
- Link to Kusto/Lens Explorer?
- Detailed repro steps or screenshots?
- Priority? 
  - [0] Release blocking - must fix
  - [1] Build blocking - must unblock
  - [2-3-4] non-blocking
- Scenario blocking? 
  - If yes, add Tag = "ARCA_HERO_SCENARIO"
- Severity?
  - SEV1 – Critical Failure / Extreme Customer Impact
  - SEV2 – Major Functional Failure / High Customer Impact
  - SEV3 – Minor Functional Failure / Moderate to Low Customer Impact
  - SEV4 – Request for Improvement / Negligible Customer Impact 

More detailed info on the criteria for the different severities is in the bug template.

# Tracking bugs

PG Customer bug query: https://aka.ms/winfield-customer-bugs
CSS bugs: [Winfield CSS Bugs - Boards (visualstudio.com)](https://msazure.visualstudio.com/One/_queries/query/e17ddb33-88fc-4557-b9bd-66c4a839620c/)

# Feature requests

Use this template for submitting feature requests on behalf of the CSS team-
https://msazure.visualstudio.com/One/_workitems/create/Feature?templateId=b0cc9020-7580-4193-9336-6f888db88261&ownerId=053edde3-9b75-446c-b490-37d8ea497d71
