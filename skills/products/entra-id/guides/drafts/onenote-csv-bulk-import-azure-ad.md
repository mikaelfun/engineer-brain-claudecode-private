# Bulk User Import to Azure AD via CSV (AADC Alternative)

> Source: OneNote — [AADC replacement] Import CSV file to Azure Active Directory

## Scenario

When AAD Connect is not used or not suitable, use PowerShell + CSV to bulk create members or invite B2B guests.

## Add Members

```powershell
$Admin = "admin@contoso.onmicrosoft.com"
$AdminPassword = "<password>"
$Directory = "contoso.onmicrosoft.com"
$NewUserPassword = "<new-user-password>"
$CsvFilePath = "E:\User1.csv"

$SecPass = ConvertTo-SecureString $AdminPassword -AsPlainText -Force
$Cred = New-Object System.Management.Automation.PSCredential ($Admin, $SecPass)
Connect-AzureAD -Credential $cred

$PasswordProfile = New-Object -TypeName Microsoft.Open.AzureAD.Model.PasswordProfile
$PasswordProfile.Password = $NewUserPassword

$NewUsers = Import-Csv -Path $CsvFilePath
foreach ($NewUser in $NewUsers) {
    $UPN = "$($NewUser.Firstname).$($NewUser.LastName)@$Directory"
    $DisplayName = "$($NewUser.Firstname) $($NewUser.Lastname) ($($NewUser.Department))"
    $MailNickName = "$($NewUser.Firstname).$($NewUser.LastName)"
    New-AzureADUser -UserPrincipalName $UPN -AccountEnabled $true `
        -DisplayName $DisplayName -GivenName $NewUser.FirstName `
        -MailNickName $MailNickName -Surname $NewUser.LastName `
        -Department $NewUser.Department -JobTitle $NewUser.JobTitle `
        -PasswordProfile $PasswordProfile
}
```

CSV format: `Firstname, LastName, DirectoryName, Department, JobTitle`

## Invite B2B Guests

```powershell
Connect-AzureAD -Credential $cred
$invitations = Import-Csv "E:\User2.csv"
$messageInfo = New-Object Microsoft.Open.MSGraph.Model.InvitedUserMessageInfo
$messageInfo.customizedMessageBody = "Welcome message here"

foreach ($email in $invitations) {
    New-AzureADMSInvitation `
        -InvitedUserEmailAddress $email.InvitedUserEmailAddress `
        -InvitedUserDisplayName $email.Name `
        -InviteRedirectUrl http://myapps.microsoft.com `
        -InvitedUserMessageInfo $messageInfo `
        -SendInvitationMessage $true
}
```

CSV format: `Name, InvitedUserEmailAddress`

## Prerequisites

- AzureADPreview module v2.0.0.137+
- If script execution is blocked: `Set-ExecutionPolicy Unrestricted`

## Note

AzureAD PowerShell module is deprecated. For new implementations, use Microsoft Graph PowerShell SDK (`New-MgUser`, `New-MgInvitation`).
