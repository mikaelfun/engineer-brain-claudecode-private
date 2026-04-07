---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/SOC Optimization/[TSG] - SOC Optimization"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FNext-Gen%20-%20Microsoft%20Sentinel%20(USX)%2FSOC%20Optimization%2F%5BTSG%5D%20-%20SOC%20Optimization"
importDate: "2026-04-07"
type: troubleshooting-guide
---

#Troubleshooting guide for the new SOC optimization experience in USX:


Overview and demo in Ninja show [Ninja show](https://www.youtube.com/watch?v=b0rbPZwBuc0)

Public documentation and blog posts:

- [Optimize your security operations](https://learn.microsoft.com/en-us/azure/sentinel/soc-optimization/soc-optimization-access?tabs=azure-portal)
- [https://techcommunity.microsoft.com/t5/microsoft-sentinel-blog/soc-optimization-unlock-the-power-of-precision-driven-security/ba-p/4130589](https://techcommunity.microsoft.com/t5/microsoft-sentinel-blog/soc-optimization-unlock-the-power-of-precision-driven-security/ba-p/4130589)

#Contacts

PM: Michal Shechter

PM content hub integration: Preeti Krishna

Engineering manager: Hen Azran

Engineering manager content hub integration: Nan Zang

| Feature | Problem | Answer | Notes |
|--|--|--|--|
| Navigation menu icon | Icon doesn't appear in the menu | Customer isn't onboarded to USX. If onboarded - IcM request | |
| Blade | Blade is empty | Workspace has no recommendations at this moment | This rarely happens unless customer dismissed/completed cards |
| | I can only see a subset of cards | You either have a filter on, or an active search | Search works on title only |
| Top metrics | Customer doesn't understand the meaning of metrics | Refer to documentation | |
| | Top left metrics said I saved money though I added analytic rules / vice versa | Currently, when marking an optimization as completed and it had 2 suggestions, we don't identify immediately which was implemented | Will be fixed in the future |
| Cards | To which workspace the card refers to | Workspace name appears on the card | |
| | My card disappeared | Recommendations can be automatically marked as completed if upon re-calculation we identify a change in the environment which makes them not relevant | Cards will be automatically moved to the "completed" tab. A message will appear: This can happened also when reactivating a card (see below) |
| | I acted on the recommendation, but the card is still there | Recommendations are calculated every 24 hours. | |
| | I accidently marked a card as dismissed/I now think this recommendation is interesting to me | In the dismissed tab, customer can choose to reactivate a card by changing the status (3 dots, top right corner) | Reactivated cards take up to 1 hour to re-calculate. They're moved to the overview tab and marked as active but need to be checked only an hour later for updated recommendation. Sometimes, we will identify this recommendation is no longer relevant and it'll be auto completed and moved to "completed". |
| | I'm working on a card and don't want others to work on it as well | Mark card as "in progress" | To go back, mark as active |
| Data value optimizations | What does low usage / no usage / monitoring mean? What's the logic? | Refer to documentation | |
| | Which tables does this feature work on? | Billable, whether custom or using out of the box connectors | This feature doesn't surface changes in ingestion for UEBA tables, TI tables |
| | Why is there a basic logs recommendation sometimes, and sometimes there isn't | Only some tables are eligible for basic logs, we check this per table | |
| | You recommend basic logs to save money, but my pricing is actually lower | We're currently not integrated with billing services, so we don't know that in the feature | Always tell the customer to make their due diligence on pricing (until we're integrated with billing service) |
| | Should I move a table to basic logs? | Refer customer to documentation | Basic logs have many limitations on the queries customers can run, and no analytic rules can run on it |
| | I'm not seeing suggestion for analytic rule(s), only ingestion change | Some tables don't have OOTB content in content hub. Some tables are custom tables | Customers can write their own analytic rules if they see security value in the data |
| | When pivoting to content hub, the rules list is empty | If the rule is already installed as part of a solution, the solution might need updating. Otherwise IcM request | There should always be analytic rule(s) suggestion(s). If the problem is the solution update - it'll be fixed in the future |
| | When pivoting to content hub I get an error/loading time is long and request times out | IcM request | |
| | The list shows rules for products I don't have | We show all the rules for utilizing the table, customer should choose the ones they need | In the future we will identify the customer's security stack, but not at the moment |
| | Analytic rule validation failed | Customer might need more data sources for this rule, not only the one we identified as not used. Customer might be missing parsers | In the future, we will indicate the rule is missing data sources. Would like to get customer feedback if it's needed |
| Threat based (coverage) optimizations | I don't understand what the threats mean | There's an explanation inside each of the side panels | |
| | I don't understand what high/medium/low mean | Refer to documentation | |
| | I'm seeing suggestions for rules for products I don't have | We show all the rules for improving coverage, customer should choose the ones they need. This doesn't affect the score | |
| | I have XDR but you're not taking it into account | Feature request | Work planned for H1B |
| | Where can I see the MITRE breakdown? | Inside the side panel there's a link to the breakdown of tactics and techniques | We're adding sub techniques as well very soon, if customers ask |
| API | How do I use the API? | Refer to Swagger and documentation | API is open to all customers and is also in preview |
| General | When will this be available in Sentinel? | Soon | |
| | Will the Sentinel feature have the same functionalities? | Yes | |
