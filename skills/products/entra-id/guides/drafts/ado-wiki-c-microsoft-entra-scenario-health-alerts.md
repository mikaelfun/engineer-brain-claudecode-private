---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Microsoft Entra Scenario Health Alerts"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FMicrosoft%20Entra%20Scenario%20Health%20Alerts"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Entra Scenario Health Alerts — Configuration and Troubleshooting Guide

## Feature Overview

Microsoft Entra Health (preview) monitors tenant health via health metrics fed into ML-based anomaly detection.
Scenarios: Too many failed sign-ins requiring compliant/managed device; Too many failed MFA sign-ins.

## Prerequisites

| Requirement | Details |
|---|---|
| License to VIEW | Microsoft Entra P1 or P2 |
| License to RECEIVE ALERTS | Entra P1/P2 + at least 100 MAU |
| Regions | Public cloud only (NOT Fairfax/Arlington, NOT Gallatin/Mooncake) |

## Required Roles

| Activity | Roles |
|---|---|
| View signals/alerts/configurations | Reports Reader, Security Reader, Security Operator, Security Admin, Helpdesk Admin, Global Reader |
| Update alerts | Security Operator, Security Admin, Helpdesk Admin |
| Update alert notification config | Security Admin, Helpdesk Admin |
| Graph API read | HealthMonitoringAlert.Read.All |
| Graph API read/write | HealthMonitoringAlert.ReadWrite.All |

## Known Limitations

1. New tenants need ~30 days of data before alerts can be generated
2. Customers cannot create custom alerts
3. Only ONE group can receive alert email notifications per alert type
4. Customers cannot control alert thresholds (ML-based, tenant-specific)
5. NOT available in Fairfax/Arlington or Gallatin/Mooncake

## Configure Email Notifications (Portal)

1. Sign in to Entra admin center as at least Helpdesk Administrator
2. Browse to Identity > Monitoring & health > Health > Health monitoring tab
3. Select the scenario to configure
4. From Group alert notifications section, select +Select or Edit
5. Choose the group (ONE group only) and click Select
Repeat for each scenario.

## Configure Email Notifications (API)

PATCH https://graph.microsoft.com/beta/reports/healthMonitoring/alertConfigurations/{alertConfigurationId}

Body:
{
  "emailNotificationConfigurations": [
    {"groupId": "<group-id>", "isEnabled": true}
  ]
}

IMPORTANT: Only ONE group per alert type is supported.

## Alert API Reference

### alertConfiguration
GET https://graph.microsoft.com/beta/reports/healthMonitoring/alertConfigurations
GET https://graph.microsoft.com/beta/reports/healthMonitoring/alertConfigurations/{id}

### alert
GET https://graph.microsoft.com/beta/reports/healthMonitoring/alerts
GET https://graph.microsoft.com/beta/reports/healthMonitoring/alerts/{id}

### Resolve/Dismiss an alert
PATCH https://graph.microsoft.com/beta/reports/healthMonitoring/alerts/{alertId}
Body: {"state": "resolved"}
Valid states: active, resolved, unknownFutureValue

## Alert Components

- alertConfiguration: Defines behavior/configuration (groupId for notifications)
- alert: System-detected anomaly instance

Alert response includes:
- impact: impactCount + affected resource details
- signals: data stream that triggered the alert + query for further investigation
- Sign-in logs query for root cause investigation
- Scenario-specific resources (CA policies, Intune compliance policies)

## Case Handling
Supported by: Organization Management community

## ICM Escalation
For Health blade/alerts deficiencies, use ICM to MAPS team.
Owning Service: IDX, Owning Team: MAPS

## Public Documentation
- https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-microsoft-entra-health
- https://learn.microsoft.com/en-us/entra/identity/monitoring-health/scenario-health-sign-ins-mfa

> Note: Partial content from 28KB source. See sourceUrl for full content.