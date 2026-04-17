---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Code Samples and Lab Walkthroughs/Lab Walkthroughs/Update Application Insights SDK within Visual Studio"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Code%20Samples%20and%20Lab%20Walkthroughs/Lab%20Walkthroughs/Update%20Application%20Insights%20SDK%20within%20Visual%20Studio"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Update Application Insights SDK within Visual Studio

Guide for updating the Application Insights SDK to the latest version in a .NET web application using Visual Studio.

## Prerequisites

Complete the Lab Walkthrough for building and deploying a fully functional .NET Web App first (pre-packaged solution contains an older SDK version).

## Check Current SDK Version

1. In Visual Studio, check the version via **References** in Solution Explorer
2. Or go to **Tools > NuGet Package Manager > Manage NuGet Packages for Solution**
3. In the **Installed** tab, look for `Microsoft.ApplicationInsights` to see the current version

Latest package info: https://github.com/Microsoft/ApplicationInsights-Home#supported-sdks

## Update Process

1. Go to the **Updates** tab in NuGet Package Manager
2. Find the package `Microsoft.ApplicationInsights`
3. Check it along with the Project name on the right side
4. Click **Install** and confirm the dialog + EULA acceptance
   - Selecting this package will pull in all related AI dependencies automatically
5. Close and reopen NuGet Manager UI to verify the updated version

## Important Notes

- The update only changes binaries locally
- **Test locally first** (F5) to make sure everything works properly
- **You still need to republish** the solution to IIS servers or Azure Web App to update the actual running application
