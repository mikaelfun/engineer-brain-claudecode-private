---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Find out associated VNET for ASE-hosted web apps"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/AppLens/Find%20out%20associated%20VNET%20for%20ASE-hosted%20web%20apps"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Find Out Associated VNET for ASE-Hosted Web Apps

## Overview

This article covers the steps to find associated VNET/subnet details for an App Services web app running on ASE (App Service Environment) environments.

## Workflow

1. Start Applens.
2. Add the case number and name of App Service web app.
3. In the detectors filter type in **"Web App ASE General Info"** to locate the detector.
4. The highlighted sections in the detector display details on:
   - ASE name
   - VNET name
   - Subnet name
   - Additional ASE network details
