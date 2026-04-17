---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Automate Scheduled Start and Stop for Application Gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FAutomate%20Scheduled%20Start%20and%20Stop%20for%20Application%20Gateway"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Automate Scheduled Start and Stop for Application Gateway

## Scenario

The customer wants to stop the AppGw at 7:00 PM and start it at 7:00 AM.

Here, I will outline the steps to achieve this using an **Automation Account** and **Runbooks.**

## Steps

1. Go to **Azure Portal**: https://ms.portal.azure.com
2. Search for **Automation Accounts** in the search bar.
3. Click **"Create"**.
4. Fill in the details:
   - **Subscription**: Select your Azure subscription.
   - **Resource Group**: Choose an existing one or create a new one.
   - **Automation Account Name**: Choose a unique name.
   - **Region**: Select a region close to your resources.
   - **Managed Identity**: In **Advanced** blade, Enable **System Assigned** identity.
5. Click **"Review + Create"**, then click **Create** and wait for the deployment.

Navigate to the newly created Automation Account, then create a **Runbook**.

- Select **Runbook** under **Process Automation.**
- Click on **Create a Runbook**, select **PowerShell** for **Type**, and set **7.2** as the value for **Version**, then click **Review + Create** and finally **Create**.
- Click on **Edit**, then select **Edit in Portal**.
- Paste the following code (modify Subscription ID, Resource Group, and AppGw Name):

```powershell
param (
    [string]$subscriptionId = "XXXXX-XXXXX-XXXX-XXX",
    [string]$resourceGroupName = "Main",
    [string]$appGatewayName = "MainDiego"
)

# Authenticate using Managed Identity
Connect-AzAccount -Identity

# Select the correct Azure subscription
Select-AzSubscription -Subscription $subscriptionId

# Retrieve the Application Gateway object
$appgw = Get-AzApplicationGateway -Name $appGatewayName -ResourceGroupName $resourceGroupName

# Stop the Application Gateway
Stop-AzApplicationGateway -ApplicationGateway $appgw
```

- Click on **Save**, then click **Publish**.
- Follow the same process for a **Start Runbook** (replace `Stop-AzApplicationGateway` with `Start-AzApplicationGateway`).

## Assigning Permissions

After creating both Runbooks (Stop/Start):

1. Navigate to **Identity** under **Account Settings**.
2. Copy the **Object (principal) ID**.
3. Navigate to your Application Gateway → **Access Control** → **Add Role Assignment**.
4. Under **Privileged Administrator Roles**, select **Contributor**.
5. Select **User, group, or service principal** → **Select Members**.
6. Search using the **Object (principal) ID** obtained earlier.
7. Click **Review + Assign** twice.

## Scheduling the Runbooks

1. Go to the Automation Account → **Runbooks** → select the **StopAppGw** Runbook → **Schedules** under **Resources**.
2. Click **Add Schedule** → **Link a Schedule to a Runbook** → **Add Schedule**.
3. Define the schedule (e.g., run every day at 7:00 PM to stop the AppGw).
4. Repeat for the **Start** Runbook (e.g., run every day at 7:00 AM).

> **Note**: It is safe to copy and share this content with customers, as all PII has been removed.

## Contributor

- Diego Garro
