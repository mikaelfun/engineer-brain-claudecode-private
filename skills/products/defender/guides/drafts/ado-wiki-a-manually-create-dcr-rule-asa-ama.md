---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Archive/Agents and Log Analytics/Azure Monitoring Agent (AMA)/Manually Create the DCR Rule to connect ASA and AMA"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Archive/Agents%20and%20Log%20Analytics/Azure%20Monitoring%20Agent%20(AMA)/Manually%20Create%20the%20DCR%20Rule%20to%20connect%20ASA%20and%20AMA"
importDate: "2026-04-05"
type: troubleshooting-guide
note: "Archived content. Defender for Servers (AMA-based) retired in 21V August 2025."
---

# Manually Create the DCR Rule to Connect ASA and AMA

## Overview

This guide provides the API call needed to manually create the Data Collection Rule (DCR) for connecting Azure Security Agent (ASA) and Azure Monitoring Agent (AMA).

After DCR creation, the machines must be associated manually: **DCR → Resources → Add the resource**.

---

## API Call: Create DCR Rule

```
PUT: https://management.azure.com/subscriptions/<subid>/resourceGroups/<rgname>/providers/Microsoft.Insights/dataCollectionRules/<DCRName>?api-version=2021-09-01-preview
```

### Request Body

```json
{
  "location": "eastus",
  "properties": {
    "dataSources": {
      "windowsEventLogs": [
        {
          "streams": ["Microsoft-RomeDetectionEvent"],
          "xPathQueries": [
            "Security!*",
            "Microsoft-Windows-AppLocker/EXE and DLL!*"
          ],
          "name": "RomeDetectionEventDataSource"
        }
      ],
      "extensions": [
        {
          "streams": [
            "Microsoft-OperationLog",
            "Microsoft-ProtectionStatus",
            "Microsoft-ProcessInvestigator",
            "Microsoft-Auditd"
          ],
          "extensionName": "AzureSecurityLinuxAgent",
          "extensionSettings": {
            "scanners": [
              { "name": "heartbeat", "frequency": "PT1H" },
              { "name": "time", "frequency": "PT8H" },
              { "name": "antimalware", "frequency": "PT8H" },
              { "name": "codeintegrity", "frequency": "P1D" },
              { "name": "processinvestigator", "frequency": "PT1H" },
              { "name": "baseline", "frequency": "P1D" },
              { "name": "docker", "frequency": "P1D" }
            ]
          },
          "name": "AscLinuxDataSource"
        },
        {
          "streams": [
            "Microsoft-OperationLog",
            "Microsoft-ProtectionStatus",
            "Microsoft-ProcessInvestigator"
          ],
          "extensionName": "AzureSecurityWindowsAgent",
          "extensionSettings": {
            "scanners": [
              { "name": "heartbeat", "frequency": "PT1H" },
              { "name": "baseline", "frequency": "P1D" },
              { "name": "antimalware", "frequency": "P1D" },
              { "name": "processinvestigator", "frequency": "PT1H" }
            ]
          },
          "name": "AsaWindowsDataSource"
        },
        {
          "streams": [
            "Microsoft-DefenderForSqlAlerts",
            "Microsoft-DefenderForSqlLogins",
            "Microsoft-SqlAtpStatus-DefenderForSql",
            "Microsoft-DefenderForSqlTelemetry"
          ],
          "extensionName": "AdvancedThreatProtection",
          "extensionSettings": { "enableCollectionOfSqlQueries": false },
          "name": "AdvancedThreatProtection"
        },
        {
          "streams": [
            "Microsoft-DefenderForSqlScanEvents",
            "Microsoft-DefenderForSqlScanResults",
            "Microsoft-DefenderForSqlTelemetry"
          ],
          "extensionName": "VulnerabilityAssessment",
          "name": "VulnerabilityAssessment"
        }
      ]
    },
    "destinations": {
      "logAnalytics": [
        {
          "workspaceResourceId": "<workspaceresourceid>",
          "workspaceId": "<workspaceid>",
          "name": "<workspacename>"
        }
      ]
    },
    "dataFlows": [
      {
        "streams": [
          "Microsoft-OperationLog",
          "Microsoft-ProtectionStatus",
          "Microsoft-DefenderForSqlAlerts",
          "Microsoft-DefenderForSqlLogins",
          "Microsoft-SqlAtpStatus-DefenderForSql",
          "Microsoft-DefenderForSqlTelemetry",
          "Microsoft-DefenderForSqlScanEvents",
          "Microsoft-DefenderForSqlScanResults",
          "Microsoft-Auditd",
          "Microsoft-RomeDetectionEvent",
          "Microsoft-ProcessInvestigator"
        ],
        "destinations": ["<workspacename>"]
      }
    ]
  }
}
```

---

## Post-Creation Step

After the rule is created, associate machines to the DCR manually:
**DCR → Resources → Add the resource**
