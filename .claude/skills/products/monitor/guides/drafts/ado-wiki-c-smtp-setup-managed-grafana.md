---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Grafana/How-To/Setting up and testing SMTP with Azure Managed Grafana"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Managed%20Grafana/How-To/Setting%20up%20and%20testing%20SMTP%20with%20Azure%20Managed%20Grafana"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Setting up and Testing SMTP with Azure Managed Grafana

> **NOTE:** Due to SFI restrictions this method no longer works in MS tenants, because secrets cannot be created on App Registrations.

## Prerequisites

- Email Communication Services resource
- Communication Services resource
- Entra ID App Registration (with client secret)

## Setup Process

1. **Create Email Communication Services** resource and provision an Azure domain under **Provision domains** blade.

2. **Create Communication Services** resource and connect the domain from step 1 under the **Domains** blade.

3. **Create Entra ID App Registration** and create a new client secret under **Certificates & secrets** blade. Copy the secret value immediately.

4. **Assign permissions**: Create a [custom email role](https://learn.microsoft.com/azure/communication-services/quickstarts/email/send-email-smtp/smtp-authentication#creating-a-custom-email-role-for-the-entra-application) or assign Contributor to the App Registration at the resource/resource group/subscription level.

5. **Configure Grafana SMTP**: Navigate to **Azure Managed Grafana > Configuration > Email Settings** and enable SMTP:
   - Host: `smtp.azurecomm.net:587`
   - Username: `CommunicationServiceName.AppID.TenantID`
   - Password: Client Secret value from step 3
   - From Address: From the Email Communication Services **MailFrom addresses** blade

6. Click **Save**.

## Testing Email Sending

1. Navigate to **Alerting > Contact Points > Add contact point**
2. Insert email account(s) separated by `;`
3. Click **Test** to verify SMTP configuration
4. If configured correctly, a success message will appear

## Resources

- [Azure Managed Grafana | SMTP Settings](https://learn.microsoft.com/azure/managed-grafana/how-to-smtp-settings?tabs=azure-portal)
- [Azure Communications Service | Setup SMTP Auth](https://learn.microsoft.com/azure/communication-services/quickstarts/email/send-email-smtp/smtp-authentication)
