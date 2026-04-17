---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/IIS References/Install IIS Web Server role in Windows Server VM"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Additional%20Reference%20Material/IIS%20References/Install%20IIS%20Web%20Server%20role%20in%20Windows%20Server%20VM"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview
---
This article provides walk-through steps on installing the IIS web server role in a Windows Server Azure VM.

# Considerations
---
- This may come in handy when setting up reproduction environments for the on-premises agent or the VM extension for Application Insights.

# Workflow
---
1. Create an Azure VM and choose Windows Server as the operating system, preferably 2019 or 2022.
2. Install the Web Server role for your VM. See: Install IIS and ASP.NET Modules (https://learn.microsoft.com/iis/application-frameworks/scenario-build-an-aspnet-website-on-iis/configuring-step-1-install-iis-and-asp-net-modules)

Key roles and features to install:
- Web Server (IIS) → Web-Server
- Common HTTP Features (Default Document, Directory Browsing, HTTP Errors, Static Content)
- Health and Diagnostics (HTTP Logging)
- Performance (Static Content Compression)
- Security (Request Filtering)
- Application Development (.NET Extensibility 4.7, Application Initialization, ASP, ASP.NET 4.7, ISAPI Extensions/Filters, WebSocket Protocol)
- Management Tools (IIS Management Console)
- .NET Framework 4.7 Features (ASP.NET 4.7, WCF Services)

3. Verify by navigating to `http://localhost/` in IIS Manager.
