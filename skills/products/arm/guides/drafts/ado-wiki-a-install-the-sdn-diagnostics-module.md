---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/SDN Overview/SDN in progress/Install the SDN Diagnostics module"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FInfrastructure%2FSDN%20Overview%2FSDN%20in%20progress%2FInstall%20the%20SDN%20Diagnostics%20module"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Install the SDN Diagnostics Module

You can install the SDN Diagnostics module to help you troubleshoot SDN related issues that may occur within Azure Local.

## Host Nodes

If the SDN Module is already installed you can optionally uninstall and then upgrade on each node with:

```powershell
Install-Module -Name SdnDiagnostics
Import-Module -Name SdnDiagnostics
Get-Command -Module SdnDiagnostics   # should show commands such as Start-SdnNetshTrace
```

## Domain Controller

For the DC you need to install/import the Network Controller Certificate first before you install the SDN Module:

```powershell
$domainCreds = Get-Credential -UserName 'vhci01.lab\Administrator' -Message 'Provide Credentials'
$cerFile = Invoke-Command -ComputerName 'ncvhci01-cl1' -Credential $domainCreds -ScriptBlock {
    $cert = Get-ChildItem -Path cert:\localmachine\my | ? Subject -ieq 'CN=NCVHCI01-CL.VHCI01.LAB'
    $certFile = Export-Certificate -Type CERT -Cert $cert -FilePath "C:\RestCert.cer"
    return $certFile
}
$session = New-PSSession $cerFile.PSComputerName -Credential $domainCreds
Copy-Item -FromSession $session -Path $cerfile.FullName -Destination C:\
Import-Certificate -FilePath C:\RestCert.cer -CertStoreLocation Cert:\LocalMachine\Root

Install-Module -Name SdnDiagnostics   # choose yes for any files that need updating
Import-Module -Name SdnDiagnostics
```
