# Resource Health & Service Health Diagnostics

## Overview
Jarvis diagnostic queries for investigating Resource Health and Service Health events in Mooncake.

## Scenarios & Jarvis Queries

### 1. Customer Performed an Operation (Check Activity Log)
- **Wiki TSG**: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/315080/How-to-get-details-of-a-service-health-event-in-Activity-Log-from-Jarvis
- **Jarvis**: Use DGrep with:
  - Endpoint: CA Mooncake
  - Namespace: EvtRPChina
  - Event: EventDataFull
  - Role: Event.BulkEventsWorkerRole.razzle, Event.ManagerWorkerRole.razzle
  - Filter: category == "ResourceHealth", subscriptionId == "<sub-id>"

### 2. Resource Health Generated a False Alert
- **Jarvis query**: https://jarvis-west.dc.ad.msft.net/4A1DC49C
- Use to get resource health history for a specific resource and verify if alert was false positive

### 3. Check Service Health Notification Events
- **ServiceHealth Geneva Dashboard**: https://portal.microsoftgeneva.com/s/78D612AE
- **Jarvis query for notification events**: https://portal.microsoftgeneva.com/s/4B2631C4
- Use when customer needs to verify service health notification delivery

## Source
- OneNote: Mooncake POD Support Notebook > MONITOR > ## Service Health > Resource Health
