---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Code Samples and Lab Walkthroughs/Code Samples/Building and Deploying fully funcational .Net Web App"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FCode%20Samples%20and%20Lab%20Walkthroughs%2FCode%20Samples%2FBuilding%20and%20Deploying%20fully%20funcational%20.Net%20Web%20App"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Building and Deploying a Fully Functional .NET Web App with Application Insights

## Overview

Walk through to build a fully functional web application hosted in App Services with the Application Insights SDK pre-deployed. Provides a realistic and functional setup to leverage when working cases.

Tutorial source: https://docs.microsoft.com/azure/app-service/app-service-web-tutorial-dotnet-sqldatabase

## Setup Steps

1. Work through the tutorial top-down through "Update app with Code First Migrations"
2. At completion: functional Azure Web App with Azure SQL backend sending telemetry to Application Insights

## SQL Configuration

- Run app with F5 initially for local SQL instance
- Change web.config to point to Azure SQL instance (use SQL Auth for simplicity)
- Connection string format:
  ```xml
  <add name="MyDbConnection" connectionString="Data Source=tcp:mysqlmain.database.windows.net,1433; Integrated Security=False; MultipleActiveResultSets=True; Initial Catalog=DotNetAppSQLDB; User Id=myuser; Password=******" providerName="System.Data.SqlClient"/>
  ```
- Configure Azure SQL firewall: add your IP address and enable "Allow Azure services and resources to access this server"

## Entity Framework

- May need to manually install Entity Framework via NuGet
- If NuGet install fails, move solution folder to a shallower path
- Install guide: https://docs.microsoft.com/ef/ef6/fundamentals/install

## Resources

- Sample solution: dotnet-sqldb-tutorial-master.zip (attached in wiki)
- GitHub source: https://github.com/Azure-Samples/dotnet-sqldb-tutorial/archive/master.zip
