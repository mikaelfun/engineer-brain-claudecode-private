# AVD User Self-Service Reboot via Webhook + Automation

> Source: OneNote Case Study 2111080040003860

## Scenario

Customer wants AVD desktop users to reboot their personal desktop without granting Azure Portal access.

## Solution Architecture

Webhook → Azure Automation Runbook → Verify user session ownership → Restart-AzVM

## Steps

1. **Create Automation Account** with System Managed Identity
   - Grant VM Contributor role on the resource group
   - Reference: [PowerShell runbook with managed identity](https://docs.azure.cn/en-us/automation/learn/powershell-runbook-managed-identity)

2. **Create Runbook** with two input variables:
   - `$hostpoolname` — Host pool name
   - `$resourcegroupname` — Host pool resource group name

3. **Create Webhook** for the Runbook
   - User provides: `$upn` (UPN) and `$desktop` (hostname)
   - Reference: [Automation webhooks](https://docs.azure.cn/en-us/automation/automation-webhooks)

4. **Ownership Verification Logic** in Runbook:
   ```powershell
   if ((Get-AzWvdUserSession -HostPoolName $hostpoolname -ResourceGroupName $resourcegroupname -Filter "userPrincipalName eq '$upn'").Name -like '*'+$desktop+'*') {
       Get-AzVM | Where-Object {$_.Name -eq $desktop} | Restart-AzVM
   }
   ```

5. **Client-side Script** for users:
   ```powershell
   $upn = Read-Host -Prompt 'Input your UPN'
   $desktop = Read-Host -Prompt 'Input the desktop name you need to restart'
   $webhookURI = "webhook url"
   $userinput = @(@{upn=$upn}, @{desktop=$desktop})
   $body = ConvertTo-Json -InputObject $userinput
   $response = Invoke-WebRequest -Method Post -Uri $webhookURI -Body $body -UseBasicParsing
   ```

## Security Considerations

- Webhook URL has no built-in authentication — anyone with the URL can trigger the runbook
- Webhook URL has an expiration date — rotate periodically
- **Recommendation:** Wrap the script in a web app or client app with proper user authentication (e.g., Azure AD auth)

## Applicability

- 21V (Mooncake): Yes — Automation + Webhook supported
- Personal desktop host pools only (session ownership verification)
