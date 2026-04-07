---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/PowerShell tips and tricks"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FPowerShell%20tips%20and%20tricks"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# PowerShell Tips and Tricks for Entra ID

## Proxy Configuration (Fiddler)

```powershell
# Must be first command in session
[System.Environment]::SetEnvironmentVariable("ALL_PROXY", "127.0.0.1:8888")
netsh winhttp set proxy 127.0.0.1:8888

# Reset when done
[System.Environment]::SetEnvironmentVariable("ALL_PROXY", $null)
netsh winhttp reset proxy
```

## Debug Logging

```powershell
$DebugPreference = 'Continue'
```

## Check PowerShell Version

```powershell
$PSVersionTable
```

## Get Recent Error Details

```powershell
$e = $error[0].Exception; while ($e) { $e | fl * -force; $e = $e.InnerException }
```

## Enable TLS 1.2

```powershell
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::SecurityProtocol -bor [System.Net.SecurityProtocolType]::Tls12
```

## Date/Time Handling

```powershell
# Current UTC
$utc = (Get-Date).ToUniversalTime()

# ISO 8601
$date = Get-Date ((Get-Date).ToUniversalTime()) -Format o

# Ago example (1 day back)
$start = Get-Date ($utc).AddDays(-1) -Format o
```

## Convert Epoch from JWT

```powershell
$LongInt = "1728938496"
$date = (Get-Date -Date "1/1/1970").AddSeconds($LongInt)

# Convert date to Epoch
Get-Date -Date $((Get-Date).ToUniversalTime()) -UFormat %s
```

## Certificate Handling

### Read Certificate Files

```powershell
# Windows PowerShell 5.x
$bytes = Get-Content 'certificate.pfx' -Encoding Byte

# PowerShell 7
$bytes = Get-Content 'certificate.pfx' -AsByteStream -Raw

# Convert to Base64
$base64 = [System.Convert]::ToBase64String($bytes)
```

### Create Certificate Objects

```powershell
$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 -ArgumentList @($bytes, $password)
```

### Get from Certificate Store

```powershell
$cert = Get-ChildItem -Path "cert:\CurrentUser\My\$CertificateThumbprint" -Recurse | Select-Object -First 1
```

### Certificate Thumbprint to Base64 (kid)

```powershell
$thumbprint = $cert.Thumbprint
$Bytes = [byte[]]::new($thumbprint.Replace("-","").Length / 2)
For($i=0; $i -lt $Thumbprint.Length; $i+=2){
    $Bytes[$i/2] = [convert]::ToByte($Thumbprint.Substring($i, 2), 16)
}
$thumbprintBase64 = [Convert]::ToBase64String($Bytes).Split('=')[0].Replace('+', '-').Replace('/', '_')
```

### Change PFX Password

```powershell
$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2
$cert.Import($oldPfxPath, $oldPassword, "Exportable,PersistKeySet")
$bytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Pfx, $newPassword)
[System.IO.File]::WriteAllBytes($newPfxPath, $bytes)
```

### Export Windows Cert Store as PEM

```powershell
$certs = Get-ChildItem -Path "Cert:\CurrentUser" -Recurse -Include *
$pemContent = ""
foreach ($cert in $certs) {
    if($cert.RawData) {
        $pemContent += "-----BEGIN CERTIFICATE-----`n"
        $pemContent += [Convert]::ToBase64String($cert.RawData) + "`n"
        $pemContent += "-----END CERTIFICATE-----`n"
    }
}
$pemContent | Out-File -FilePath "wincertstore.pem"
```

Useful for passing root certificates to tools without Windows cert store access (e.g., OpenSSL).

### Convert FiddlerRoot.cer to PEM

```powershell
$bytes = Get-Content "FiddlerRoot.cer" -AsByteStream -Raw
$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2 -ArgumentList @($bytes,$null)
$base64 = [System.Convert]::ToBase64String($cert.RawData)
$pemContent = "-----BEGIN CERTIFICATE-----`r`n" + ($base64 -replace "(.{64})", "`$1`r`n") + "`r`n-----END CERTIFICATE-----"
Set-Content -Path "FiddlerRoot.pem" -Value $pemContent
$env:REQUESTS_CA_BUNDLE = "FiddlerRoot.pem"
```

## Error Details from Invoke-WebRequest

```powershell
try {
    $response = Invoke-WebRequest -Uri $uri -Headers $headers -ErrorAction Stop
} catch {
    $e = $_.Exception
    if ($PSVersionTable.PSVersion.Major -eq 5) {
        $reader = [System.IO.StreamReader]::new($e.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Output "Status: $($e.Response.StatusCode.value__) | Body: $responseBody"
    }
    if ($PSVersionTable.PSVersion.Major -eq 7) {
        Write-Output "Status: $($e.Response.StatusCode.value__) | Body: $($_.ErrorDetails)"
    }
}
```

## Proxy Network Configuration

```powershell
$proxy = New-Object System.Net.WebProxy("http://proxy-server:port")
$proxy.UseDefaultCredentials = $true
[System.Net.WebRequest]::DefaultWebProxy = $proxy
```

## Pagination with nextLink

```powershell
$url = "https://graph.microsoft.com/v1.0/users?`$top=999"
$results = @()
Do {
    $headerParams = @{'Authorization'="Bearer $token"}
    $response = Invoke-WebRequest -UseBasicParsing -Headers $headerParams -Uri $url
    $content = $response.Content | ConvertFrom-Json
    $nextLink = $content.'@odata.nextLink'
    $url = $nextLink
    $results += $content.value
    Start-Sleep -Milliseconds 100
} while($nextLink)
```

## CSV Export Methods

### Simple (flat data)

```powershell
$resp | Export-Csv -NoTypeInformation -Path results.csv
```

### Complex types (collections/nested)

```powershell
$data = $resp | ConvertTo-Json -Depth 99 | ConvertFrom-Json
# Flatten nested properties to strings before Export-Csv
```

### Custom Hashtable (recommended for control)

```powershell
$formattedResult = @()
foreach ($item in $response) {
    $data = @{}
    $data.UserName = $item.userPrincipalName
    $data.LastSignIn = $item.SignInActivity.LastSignInDateTime
    $data.Licenses = $item.AssignedLicenses.SkuId -join ','
    $formattedResult += $data
}
$formattedResult | ConvertTo-Csv -NoTypeInformation | Out-File results.csv
```
