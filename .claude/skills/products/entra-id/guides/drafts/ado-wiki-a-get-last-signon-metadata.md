---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Logs and Reporting/Azure AD Reporting Workflow/Get Azure AD users Last Sign On metadata values"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20Logs%20and%20Reporting/Azure%20AD%20Reporting%20Workflow/Get%20Azure%20AD%20users%20Last%20Sign%20On%20metadata%20values"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
- cw.comm-orgmgt
- cw.Entra ID Logs and Reporting
- Workflow
- Sign-Ins
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[[_TOC_]]
#Intro
**PII notice: All the identifiable information in this guide comes from a lab environment and was destroyed after the guide was put together**

**Disclaimer:** scripting is not supported by CSS, this is not an official customer ready guide, this is to be used as an example, if shared with a customer make sure to discliose the following:

"The sample script provided isn't supported under any Microsoft standard support program or service. The sample script is provided AS IS without warranty of any kind. Microsoft further disclaims all implied warranties including, without limitation, any implied warranties of merchantability or of fitness for a particular purpose. The entire risk arising out of the use or performance of the sample script and documentation remains with you. In no event shall Microsoft, its authors, or anyone else involved in the creation, production, or delivery of the script be liable for any damages whatsoever (including, without limitation, damages for loss of business profits, business interruption, loss of business information, or other pecuniary loss) arising out of the use of or inability to use the sample script or documentation, even if Microsoft has been advised of the possibility of such damages."

This guide aims to export the values of the last sing on object metadata, This approach is useful in cases where the last sign on outdates the log retention period, for example other approaches would rely on the sign in logs for these purposes but if the last sign in for that particular user was over 7 days for unlicensed tenants or over 30 days for licensed, we won't have a log for those users and won't be properly reported. Please bear in mind that this metadata option for the user objects was introduced (pending exact date) at some point in the last couple of years so if an user was created prior to that and hasn't loged in since it will have an null value for this entry.

This is not a fits all solution, ideally customers should be able to filter and download the sign in records from the portal or powershell, with this approach we are aiming to overcome the retention period limitation to get a more comprehensive analysis of sign in activities.

**Note:** the script does not contemplate Graph throttling but avoids it by pulling 1000 records each time. You can use the filters at the end to scope it so it handles big requests.

#Prereqs
1. An account with sufficient permissions to create an application in AAD and grant admin consent.
1. This metada is only accesible for AAD tenants with P1 or P2 licenses.

#Register your aplication
1. Go to https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps
1. Click on **"New Registration**"
1. Give your application a name and leave the rest by default
1. Click on "**Register**"
![image.png](/.attachments/image-6ba2ea7b-36ff-461d-b594-db52cf720b5e.png)
1. Once the application has been registered copy the "**Application (client) ID**" from the app overview page.
1. Go to "**Certificates & secrets**"
1. Click on "**New client secret**"
1. Provide as description and expiration prediod to your liking and click "**Add**"
1. Copy the secret "**Value**" if you don't get it now you will need to create a new one as this is only visible at this stage.
![image.png](/.attachments/image-2ce8ea72-7d67-4213-87b8-8609baf92728.png)
1.Go to "**API ppremissions**"
1. Click "**Add Permission**"
1. Under "**MicrosoftAPIs**" Select "**Microsoft Graph**"
1. Click "**Application Permissions**"
1. From the searchbar locate and add "**AuditLog.Read.All**" and "**User.Read.All**" 
1. When added click "**Grant Admin Consent**" and yes on the confirmation pop-up
![image.png](/.attachments/image-5882e51f-7f17-4feb-872c-00134f3ca0c7.png)

#Building the script
The script requires several components that canbe tuned to fit the needs of each scenario, overall you are going to need an access token and pull the data.
##Get an access token.
1. Provide your tenantID or doamain name. `$TenantId = "XXXXXXXXXXX.onmicrosoft.com"`
1. Provide your application ClientID. `$AppClientId="XXXXXXXXXX-be44-4c7e-a937-6c8663adf551"`
1. Provide your application secret key. `$ClientSecret ="XXXXXXXXXXXXXXXXXXXXXXXX"`
1. Build the token request. `$RequestBody = @{client_id=$AppClientId;client_secret=$ClientSecret;grant_type="client_credentials";scope="https://graph.microsoft.com/.default";}`
1. Get the token. `$OAuthResponse = Invoke-RestMethod -Method Post -Uri https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token -Body $RequestBody`
1. Store the token for lter use. `$AccessToken = $OAuthResponse.access_token`

When done this section should look something likle this:
![image.png](/.attachments/image-dc939c59-e742-4926-a6e5-11b1d5c5f967.png)

##Get and export your logs
1. Form request headers with the acquired AccessToken. `$headers = @{'Content-Type'="application\json";'Authorization'="Bearer $AccessToken"}`
1. Get users list with signInActivity. `$ApiUrl = "https://graph.microsoft.com/beta/users?$select=displayName,userPrincipalName,signInActivity,userType,assignedLicenses&$top=999"`
1. Organize and export your data. 
`$Result = @()
While ($ApiUrl -ne $Null)
{
$Response = Invoke-WebRequest -Method GET -Uri $ApiUrl -ContentType "application\json" -Headers $headers | ConvertFrom-Json
if($Response.value)
{
$Users = $Response.value
ForEach($User in $Users)
{ 
$Result += New-Object PSObject -property $([ordered]@{ 
DisplayName = $User.displayName
UserPrincipalName = $User.userPrincipalName
LastSignInDateTime = if($User.signInActivity.lastSignInDateTime) { [DateTime]$User.signInActivity.lastSignInDateTime } Else {$null}
IsLicensed  = if ($User.assignedLicenses.Count -ne 0) { $true } else { $false }
IsGuestUser  = if ($User.userType -eq 'Guest') { $true } else { $false }
})
} 
}
$ApiUrl=$Response.'@odata.nextlink'
}
$Result | Export-CSV "C:\LastLoginDateReport.CSV" -NoTypeInformation -Encoding UTF8`

When completed this section should look something like this:
![image.png](/.attachments/image-0b31e070-e8e1-4402-b569-615ee0bbd21a.png)

##optional filters
###Guest users only
`$Result | Where-Object { $_.IsGuestUser -eq $true }`
###Member users only
`$Result | Where-Object { $_.IsGuestUser -eq $false }`
###Inactive users by period of time
`$DaysInactive = 90`

`$dateTime = (Get-Date).Adddays(-($DaysInactive))`

`$Result | Where-Object { $_.LastSignInDateTime -eq $Null -OR $_.LastSignInDateTime -le $dateTime }`


#sample script
[get last sign on.zip](/.attachments/get%20last%20sign%20on-882f8c0b-62f4-405b-9ff7-f723c4dd8057.zip)
