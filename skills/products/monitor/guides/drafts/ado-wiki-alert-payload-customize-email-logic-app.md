---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Action Groups and Notifications/How to get alert payload and customize email notifications using Logic App"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FAction%20Groups%20and%20Notifications%2FHow%20to%20get%20alert%20payload%20and%20customize%20email%20notifications%20using%20Logic%20App"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to get alert payload and customize email notifications using Logic App

## Scenario

This How-To article can be used to obtain an alert payload using the Azure Portal. This is applicable when:
- The customer would like to review the payload to modify it or process it with additional tools.
- The customer would like to customize the content on the email notifications.

## Before You Start

1. You must have an existing alert and existing action group.
2. You must have permissions to create Logic Apps.
3. You must have an outlook email address (non-work related) to configure the email connector.

## Get the alert payload

### Step 1: Create a Logic App

1. In the Azure Portal, navigate to Logic Apps and select **Add**.
2. Under Consumption, select Multi-tenant.
3. Fill the required fields and select **Create**.

### Step 2: Create an HTTP trigger

1. In your Logic App, navigate to Development tools > **Logic app designer**.
2. Select **Add a trigger** and search for **When a HTTP request is received**.
3. In the Request Body JSON Schema, paste the Common Alert Schema JSON.

**NOTE:** If you don't want to use the Common Alert Schema, you can leave this section blank. This means the schema might vary between alerts, as the alert type will determine its schema when it fires.

Common Alert Schema:
```json
{
    "type": "object",
    "properties": {
        "schemaId": { "type": "string" },
        "data": {
            "type": "object",
            "properties": {
                "essentials": {
                    "type": "object",
                    "properties": {
                        "alertId": { "type": "string" },
                        "alertRule": { "type": "string" },
                        "severity": { "type": "string" },
                        "signalType": { "type": "string" },
                        "monitorCondition": { "type": "string" },
                        "monitoringService": { "type": "string" },
                        "alertTargetIDs": { "type": "array", "items": { "type": "string" } },
                        "originAlertId": { "type": "string" },
                        "firedDateTime": { "type": "string" },
                        "resolvedDateTime": { "type": "string" },
                        "description": { "type": "string" },
                        "essentialsVersion": { "type": "string" },
                        "alertContextVersion": { "type": "string" }
                    }
                },
                "alertContext": { "type": "object", "properties": {} }
            }
        }
    }
}
```

4. Select **Save**.

### Step 3: View the alert payload

1. In the Azure Portal, navigate to your Action Group and select **Edit**.
2. Under Actions, add your Logic App and enable the Common Alert Schema.
3. Select **Save Changes**.
4. Navigate to your alert and select **Edit**.
5. Navigate to the Actions tab and select your Action Group.
6. Select Review and Save > Save.
7. Once the alert fires, navigate to your Logic App > Run history.
8. Select the latest run, this indicates the alert fired and sent the alert payload.
9. Select the run and select **When a HTTP request is received**.
10. Under **Outputs**, select **Show raw outputs**. This is your alert payload.

Sample alert payload output includes:
- Headers: Cookie, Host, User-Agent (IcMBroadcaster/1.0), Content-Type (application/json)
- Body: schemaId (azureMonitorCommonAlertSchema), data.essentials (alertId, alertRule, severity, signalType, monitorCondition, monitoringService, alertTargetIDs, firedDateTime, description), data.alertContext (conditionType, condition with windowSize, searchQuery, operator, threshold, dimensions, metricValue, failingPeriods), data.customProperties

## Customize the email notification

### Step 1: Process the alert payload

1. In the Azure Portal, navigate back to your Logic App and select **Logic app designer**.
2. Select the + sign to add a new action. Search for **Parse JSON**.
3. In the Content field, select the lightning symbol and search for **Body**.
4. In the Schema field, select Use sample payload to generate schema. Paste your sample output from the "Get the alert payload" section above.

### Step 2: Configure and customize your email

1. Add a third action. Select the + sign to add a new action. Search for **Send an email**.
2. Select **Sign In** and enter your non-work Outlook email credentials.
3. In the To line, add your work email address.
4. In the Subject and Body add your desired content. To add values from the processed payload, use the lightning button.
5. Select **Save**.
6. Once your alert fires again, you will receive a customized email notification.
