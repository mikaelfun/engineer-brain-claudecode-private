---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/IIS References/Deploy a .NET Framework web app to IIS"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Additional%20Reference%20Material/IIS%20References/Deploy%20a%20.NET%20Framework%20web%20app%20to%20IIS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Deploy .NET Framework web app to IIS

## Overview

This article provides walk-through steps on how deploying a .NET Framework web application to your existing IIS server.

## Considerations

- Some prerequisites are needed for this walk-through. See: Install IIS Web Server role in Windows Server VM
- Install Visual Studio on the Azure VM on your IIS server. Install all the required Visual Studio workloads for .NET web application development.

## Workflow

### 1. Create a .NET Framework web application in Visual Studio
- See step 1 for a [guide](https://learn.microsoft.com/azure/app-service/quickstart-dotnetcore?tabs=netframework48&pivots=development-environment-vs#1-create-an-aspnet-web-app) on this.

### 2. Publish your .NET Framework web app
- Open your project in Visual Studio.
- Right-click on your project in the Solution Explorer and select "Publish".
- In the "Pick a publish target" window, select "Folder", and then choose a location to save the published files.
- Click "Publish".
- Once your project is published, copy the files from your release and paste them on a folder path accessible to IIS - usually anything under `C:\inetpub\`.

### 3. Create a new website in IIS
- Open the IIS Manager.
- Right-click on the "Sites" node in the tree, and then click "Add Website".
- Give your website a name, set the physical path to the location of your published files within `C:\inetpub\`, and then set the port as needed.

### 4. Restart IIS
- Open a Command Prompt window as an administrator.
- Type `iisreset` and press Enter.

### 5. Navigate your app
- Go to IIS Manager and locate your new website.
- Click Browse.
