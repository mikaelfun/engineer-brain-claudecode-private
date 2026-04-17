---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/General/How to Use Iridias to Get Service Health Event Details"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAzure%20Monitor%2FHow-To%2FGeneral%2FHow%20to%20Use%20Iridias%20to%20Get%20Service%20Health%20Event%20Details"
importDate: "2026-04-06"
type: troubleshooting-guide
---

This document provides an overview of how to retrieve Service Health Event details using Iridias.

# Introduction

*Iridias* is an internal application that offers greater visibility of consolidated Microsoft Cloud event insights. It provides official engineering updates and what is being communicated to customers for service incidents, maintenance and advisories.

# Instructions

## To Retrieve Service Health Incident or Outage Details Using a Tracking ID:

1. Navigate to **[Iridias](https://iridias.microsoft.com/incidentcentral)** > **Incidents**.
2. Enter the tracking ID in the **Search Incidents** field.

## To Retrieve Planned Maintenance Details Using a Tracking ID:

1. Navigate to **[Iridias](https://iridias.microsoft.com/incidentcentral)**
2. Select the **Maintenance** tab.
3. Click on **List**.
4. Adjust the **Time Filter** as needed.
5. Enter the tracking ID in the **Search Maintenance Events** field.

## To Retrieve Health or Security Advisory Details Using a Tracking ID:

1. Navigate to **[Iridias](https://iridias.microsoft.com/incidentcentral)**
2. Select the **Health/Security Advisories** tab.
3. Adjust the **Time Filter** as needed.
4. Enter the tracking ID in the **Search** field.

## Where to Find the Communication Details for a Service Health Event

- After opening the Service Health event in Iridias, scroll down to the **Communication** section and expand the arrow.
- In this section, you'll find detailed information about the event, including its status and the number of impacted subscriptions. This section also includes the communications sent at different stages, such as during **Active** and **Resolved** statuses.
- Any information found under the **Internal** tab is for internal reference only and should not be shared with customers.
- For outages, you can also locate the relevant **ICM**, along with the impacted service and region, in the **Incident Overview** section. You can tag the ICM number to your case if the customer is affected due to the outage.
