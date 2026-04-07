---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DDoS Protection/Special DDoS SR & CRI Handling Processes"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FSpecial%20DDoS%20SR%20%26%20CRI%20Handling%20Processes"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

https://aka.ms/AnpDdosCriHandling

# Overview

This document outlines some special handling scenarios and processes with Severity A `Azure\DDOS Protection\I'm under attack - Network Protection Plan` SRs. This process allows the ANP team to quickly and efficiently action against pending Sev-2 CRIs to the Cloudnet/DDOS team, ensuring Microsoft supports our customers in accordance with the [DDoS Rapid Response (learn.microsoft.com)](https://learn.microsoft.com/azure/ddos-protection/ddos-rapid-response) support model. 

# SE Notification in Teams

First off, SEs can expect to receive an automated notification when they are assigned a new DDoS "I'm under attack" case:

This is meant to be a nudge/reminder of the specifics around DDoS SRs - namely that DDoS Sev A "I'm under attack" cases have a very short 15min SLA, no matter what DfM says, or what their offering provides.

# ICM/CRI Process Specifics
An auto-generated ICM is created when a new "I'm under attack" case comes in. The ICM is assigned automatically to the case owner once assigned. This ICM serves as a quick ready-to-transfer CRI for Under Attack cases, to expedite engagement with DDoS PG. 

Actions required via the ICM:

* If confirmed as a Sev-2 DDoS attack, Transfer CRI to Cloudnet\DDOS and raise severity to 2 and fill out the template below.
* If confirmed to NOT be a valid DDoS attack, acknowledge & close this ICM as resolved.

Example: CRIs: https://portal.microsofticm.com/imp/v3/incidents/omnisearch?searchString=t:I%27m%20Under%20Attack%20t:ANPTA 

# Contributors

Any questions, please reach out to Service TA and M2.
