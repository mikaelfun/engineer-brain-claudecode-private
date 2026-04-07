---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Sentinel Content Hub and Solutions/[TSG] - SIEM Migration Tool (Old Experience)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Sentinel%20Content%20Hub%20and%20Solutions/%5BTSG%5D%20-%20SIEM%20Migration%20Tool%20(Old%20Experience)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# SIEM Migration Tool (Old Experience)

> :warning: This experience is being replaced with the new [AI-Powered SIEM Migration experience](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/USX/Onboarding/%5BTSG%5D%20-%20AI-Powered%20SIEM%20Migration%20experience).

## Overview

For customers who are currently using Splunk and are either interested in or currently migrating to Microsoft Sentinel, the SIEM migration experience allows them to migrate their existing Splunk detection rules. Customers export their Splunk detection rules, upload them to Sentinel, and the SIEM Migration Tool will then attempt to translate them to Sentinel Analytics Rules and present the customer with translation options.

## Prerequisites
- Ensure customers are using a supported version of Splunk (not EOL or EOS)
- Required [permissions](https://learn.microsoft.com/en-us/azure/sentinel/siem-migration#prerequisites)

## Troubleshooting

### The renderComponentIntoRoot component encountered an error while loading
- Customers might see this error after the JSON file is successfully uploaded in the "Upload file" tab but after clicking "Next: Configure Rules >" they get an error.
- Error includes: `Minified React error #31`
- This suggests the export command from Splunk was not performed correctly. The export JSON is missing required properties like the `alert_comparator` and `dispatch.earliest_time` fields.
- Ensure the customer runs the export command in Splunk without any modifications as per public docs and does not modify the JSON file itself:

```
| rest splunk_server=local count=0 /services/saved/searches | search disabled=0 | table title,search ,*
```

Reference ICM: [492701865](https://portal.microsofticm.com/imp/v3/incidents/incident/492701865/summary)
