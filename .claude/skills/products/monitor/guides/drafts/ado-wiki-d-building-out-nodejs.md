---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Code Samples and Lab Walkthroughs/Code Samples/Building out Node.JS"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FCode%20Samples%20and%20Lab%20Walkthroughs%2FCode%20Samples%2FBuilding%20out%20Node.JS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Building a Node.JS Application with Application Insights

## Overview

Walk through of building a lab environment with a Node.JS app instrumented with the Application Insights Node.JS SDK. Uses Express + Cosmos DB + Azure App Service.

## Setup Prerequisites

1. Create an Azure VM for running the Node.js app locally
2. Create a Cosmos DB free-tier account (save URI and PRIMARY KEY)
3. Install Git, Node.js (v14.15.3 proven), and VS Code on the VM

## Application Build

1. Install Express Generator: `npm install -g express-generator`
   - Note: may need `Set-ExecutionPolicy RemoteSigned` for PowerShell
2. Create app: `express --view=jade nameOfYourApp`
3. Install Cosmos DB modules: `npm install @azure/cosmos`
4. Create `models/taskDao.js` — Cosmos DB data access
5. Create `routes/tasklist.js` — task management APIs
6. Create `config.js` — Cosmos DB connection settings (HOST, AUTH_KEY)
7. Update `app.js` — wire up Express + Cosmos DB
8. Update views: `layout.jade` and `index.jade`

## Publishing to Azure

1. Initialize local Git repo
2. Create Node.js App Service (do NOT enable App Insights from creation)
3. Configure Deployment Center with Local Git
4. Push: `git push azure master` (not `main` — check your branch name)

## Enable Application Insights SDK

1. Create App Insights component in portal
2. Install Node.js SDK: `npm install applicationinsights`
3. Add configuration to app.js with IK value and enable Live Metrics
4. Redeploy and verify via Live Metrics

## Common Issues

- **git push azure main** returns "error: src refspec main does not match any" → check `git branch`, may need `git push azure master` instead

## Documentation

- Cosmos DB Node.js tutorial: https://docs.microsoft.com/azure/cosmos-db/sql-api-nodejs-application
- App Insights Node.js: https://docs.microsoft.com/azure/azure-monitor/app/nodejs
