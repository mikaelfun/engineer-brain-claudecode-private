---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/IIS References/Add dummy web sites to IIS Manager"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAdditional%20Reference%20Material%2FIIS%20References%2FAdd%20dummy%20web%20sites%20to%20IIS%20Manager"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview

How to add a test "dummy" web site to IIS app pool by leveraging the configuration of an existing default web site.

# Use Cases

- Reproduce scenarios involving multiple apps, like the key map feature for the on-premises agent for Application Insights.

# Prerequisites

- Install the Web Server role for Windows Servers (see: Install IIS Web Server role in Windows Server VM)

# Steps

1. **Verify IIS default site**: Navigate to the Default Web Site and confirm the IIS welcome page loads.

2. **Duplicate wwwroot contents**:
   - Go to `C:\inetpub`
   - Copy the `wwwroot` directory contents
   - Paste into `C:\inetpub` and rename the duplicate directory (e.g., `wwwroot2`)

3. **Create second IIS web site**:
   - Open IIS Manager
   - Right-click on Sites → Add Website
   - Provide a name and a port number NOT already in use (default site uses port 80)
   - Set physical path to the duplicated wwwroot directory
   - No need to define a hostname for testing

4. **Verify**: Navigate to `http://localhost:<port>/` to confirm the new site is accessible.
