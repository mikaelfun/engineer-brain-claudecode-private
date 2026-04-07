---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Troubleshooter guides/[TSG] - Threat Intelligence/Threat Intelligence Ingestion Rules"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Troubleshooter%20guides/%5BTSG%5D%20-%20Threat%20Intelligence/Threat%20Intelligence%20Ingestion%20Rules"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Why or what is an Ingestion rule

Ingestion rules enable the customers to change fields of the stix objects (Indicators, AttackPatterns, ThreatActors etc.) during the ingestion time when the data is being pumped from various ingestion sources (like the connectors, file imports, upload APIs etc).

Ingestion rules have two parts:
- Customer facing part/API/UI: where the rules are created
- Backend engine part: where rules are applied.

For example: the customer might want to set the confidence for all the indicators that they receive from a certain source to 50.

From the API/UI, the customers will create these rules and the backend engine, which is part of the Normalization service, reads those rules and applies it.

Note that there is ordering to the Ingestion rules, meaning the ingestion rules will be applied in order for the enabled ingestion rules.

# How is Ingestion rule stored

All ingestion rules created for a workspace are stored as a single list in a Cosmos DB. This means there is a single document per workspace containing the rules as a list.

# API

Ingestion rules have two APIs

- GET call: The Get call returns the IngestionRules list stored in the document
- PUT call: The Put call is used for creating/updating/deleting the list. If all the rules are deleted, empty list will be stored in cosmos DB.

We make sure there are no parallel updates for the records by making sure the eTAG coming in as part of the request is the same as what was returned in the GET request.

Ingestion rules will be applied when the data is ingested through following sources:
- Connectors
- File imports
- Upload API Notes

# Notes

- Ingestion rules will NOT be applied for any updates or inserts made through Stix API.
- Currently we don't include any information around which Ingestion rules was applied to the indicators/other stix objects
