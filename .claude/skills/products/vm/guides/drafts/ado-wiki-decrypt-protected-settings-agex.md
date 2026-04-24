---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/Extension/Decrypt Protected Settings_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FHow%20Tos%2FExtension%2FDecrypt%20Protected%20Settings_AGEX"
importDate: "2026-04-21"
type: guide-draft
---

# How to Decrypt VM Extension Protected Settings

## Summary

VM extension protected settings are encrypted and stored in config files. Decrypting them can help troubleshoot character issues in passwords (VMAccessForLinux) or retrieve download URIs (CustomScript extension).

## Linux

1. Locate the settings file:
   ```bash
   cat /var/lib/waagent/Microsoft.OSTCExtensions.VMAccessForLinux*/config/0.settings
   ```

2. Assign the protected settings string:
   ```bash
   string="<protected settings string>"
   ```

3. Decrypt using the certificate thumbprint from the settings file:
   ```bash
   echo $string | base64 -d | openssl smime -inform DER -decrypt -recip /var/lib/waagent/<THUMBPRINT>.crt -inkey /var/lib/waagent/<THUMBPRINT>.prv
   ```

## Windows

### Option 1: With Known Thumbprint

```powershell
param(
    [string]$thumbprint,
    [string]$protectedSettings
)
$cert = Get-ChildItem Cert:\LocalMachine\My\$thumbprint
$content = [Convert]::FromBase64String($protectedSettings)
[System.Reflection.Assembly]::LoadWithPartialName("System.Security") | Out-Null
$envelope = New-Object Security.Cryptography.Pkcs.EnvelopedCms
$envelope.Decode($content)
$envelope.Decrypt()
$decryptedSettings = [text.encoding]::UTF8.getstring($envelope.ContentInfo.Content)
Write-Output $decryptedSettings
```

### Option 2: Without Thumbprint (Auto-detect)

```powershell
function Decrypt-Envelope ($base64string) {
    [System.Reflection.Assembly]::LoadWithPartialName("System.Security") | Out-Null
    $content = [Convert]::FromBase64String($base64string)
    $env = New-Object Security.Cryptography.Pkcs.EnvelopedCms
    $env.Decode($content)
    $env.Decrypt()
    return [text.encoding]::UTF8.getstring($env.ContentInfo.Content)
}
$ProtectedSettings = "MIIDBAYJKoZ...."
Decrypt-Envelope $ProtectedSettings
```

## References

- [Azure Linux Extensions source code](https://github.com/Azure/azure-linux-extensions/blob/14835e2a9e52c7b7b6cb6363dff8242b2640cdb5/Utils/HandlerUtil.py#L194)
