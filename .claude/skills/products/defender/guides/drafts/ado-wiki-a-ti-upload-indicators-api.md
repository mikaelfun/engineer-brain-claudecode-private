---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Troubleshooter guides/[TSG] - Threat Intelligence/Threat Intelligence Upload Indicators API (Data Connector)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Troubleshooter%20guides/%5BTSG%5D%20-%20Threat%20Intelligence/Threat%20Intelligence%20Upload%20Indicators%20API%20(Data%20Connector)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

#Summary
In-preview data connector. It is not a "regular" data connector per-se. 
The instructions are for the customer on how to get authorization token on AAD for an application to later do an API POST to the workspace/sentinel to upload/ingest the indicators in STIX format.

##Documentation
Here's the public documentation [Threat Intelligence Upload Indicators API](https://learn.microsoft.com/en-us/azure/sentinel/data-connectors/threat-intelligence-upload-indicators-api).

#Important points

- The information, indicators or data will be ingested by a third party application of the customer. This is on the customer's end of responsibility to address. 
- If there are issues with the authorization or creation of the token, please open a collaboration with AAD.
- The data source will be a TIP or Threat Intelligence Platform. 
- The endpoint is the destination of the TIs to be ingested/uploaded and is defined by specifying the workspaceID of the workspace where the Sentinel solution resides.
- The header needs to be of "Content-Type" = "application/json" which is just to define that the body will be in the JSON format.
- The body is a JSON array of the data/indicators to be ingested by Sentinel. The indicators need to come in STIX format.

##Stix Format
This [link](https://learn.microsoft.com/en-us/azure/sentinel/connect-threat-intelligence-taxii) contains the information on the STIX/TAXXI TI feeds and points to this [github](https://oasis-open.github.io/cti-documentation/) which holds the definitions of the STIX and TAXII. Checking the [STIX definition](https://oasis-open.github.io/cti-documentation/stix/intro), we can find that there is the Indicators definition [as shown here](https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html#_muftrcpnf89v).

Examples

Indicator itself, with context

```json
[
  {
    "type": "indicator",
    "spec_version": "2.1",
    "id": "indicator--8e2e2d2b-17d4-4cbf-938f-98ee46b3cd3f",
    "created_by_ref": "identity--f431f809-377b-45e0-aa1c-6a4751cae5ff",
    "created": "2016-04-06T20:03:48.000Z",
    "modified": "2016-04-06T20:03:48.000Z",
    "indicator_types": ["malicious-activity"],
    "name": "Poison Ivy Malware",
    "description": "This file is part of Poison Ivy",
    "pattern": "[ file:hashes.'SHA-256' = '4bac27393bdd9777ce02453256c5577cd02275510b2227f473d03f533924f877' ]",
    "pattern_type": "stix",
    "valid_from": "2016-01-01T00:00:00Z"
  }
]
```

##Example of JSON Body to use:

The source system is a string that can be changed to a different value to display where the TI came from.

```json
{ 
    "SourceSystem": "",
    "Indicators": [
        {
            "type": "indicator",
            "spec_version": "2.1",
            "id": "indicator--8e2e2d2b-17d4-4cbf-938f-98ee46b3cd3f",
            "created_by_ref": "identity--f431f809-377b-45e0-aa1c-6a4751cae5ff",
            "created": "2016-04-06T20:03:48.000Z",
            "modified": "2016-04-06T20:03:48.000Z",
            "indicator_types": ["malicious-activity"],
            "name": "Poison Ivy Malware",
            "description": "This file is part of Poison Ivy",
            "pattern": "[ file:hashes.'SHA-256' = '4bac27393bdd9777ce02453256c5577cd02275510b2227f473d03f533924f877' ]",
            "pattern_type": "stix",
            "valid_from": "2016-01-01T00:00:00Z"
        }
    ]
}
```
