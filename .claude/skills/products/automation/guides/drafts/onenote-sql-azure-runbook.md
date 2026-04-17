# Connect and Query SQL Azure DB from Automation Runbook

## Overview
Azure Automation runbook code sample for connecting to SQL Azure DB using SQL Auth via `System.Data.SqlClient`.

## Prerequisites
- SQL Azure DB with SQL Authentication enabled
- Automation Account with Credential Asset storing SQL username/password

## Code Sample

```powershell
workflow SQLAzureExample {
    $creds = Get-AutomationPSCredential -Name "SQLAcct"

    inlinescript {
        $SqlUsername = $Using:creds.UserName
        $SqlPass = ($Using:creds).GetNetworkCredential().Password
        $SqlConn = New-Object System.Data.SqlClient.SqlConnection
        $SqlConn.ConnectionString = "Server=tcp:mysqldb.database.chinacloudapi.cn,1433;Initial Catalog=TestIT;Persist Security Info=False;User ID=$SqlUsername;Password=$SqlPass;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

        $SqlComm = New-Object System.Data.SqlClient.SqlCommand
        $SqlComm.CommandText = "SELECT 'test'"
        $SqlComm.Connection = $SqlConn
        $SqlConn.Open()
        Write-Output "After Open"
        $SqlComm.ExecuteNonQuery()

        $Results = $SqlComm.ExecuteReader()
        if ($Results.HasRows) {
            while ($Results.Read()) {
                Write-Output $Results[0]
            }
        }
    }
}
```

## Notes
- At the time of writing, Azure AD authentication for SQL was not supported in Automation runbooks → use SQL Auth
- For Mooncake: change server FQDN to `*.database.chinacloudapi.cn`
- Store credentials in Automation Account Credential Asset (not hardcoded)
- This uses PowerShell Workflow (not PowerShell 7); for PS7 runbooks, use PowerShell syntax directly without `inlinescript`

## Source
- OneNote: Mooncake POD Support Notebook > AUTOMATION > Common Code Samples
