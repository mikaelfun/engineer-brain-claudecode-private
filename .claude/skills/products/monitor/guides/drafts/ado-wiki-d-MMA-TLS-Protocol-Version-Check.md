---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/How-To/How to check security protocol version (TLS)"
sourceUrl: "https://dev.azure.com/Supportability/6f9dfd80-6071-4f7b-8bf9-c97214ca68cf/_wiki/wikis/bebfc12e-d2ce-4ed1-8a64-d64c20264fd2?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows%2FHow-To%2FHow%20to%20check%20security%20protocol%20version%20%28TLS%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

# Scenario
---
Check if the TLS version of a machine where the agent is installed, is a supported one (according to our documentation - https://docs.microsoft.com/azure/azure-monitor/platform/log-analytics-agent#tls-12-protocol)
 
# Steps
---
With the script below, you will be able to validate the current version of the TLS protocol on the machine:
```
function Test-SslProtocols {	
	��� param(
	����� [Parameter(Mandatory=$true,ValueFromPipelineByPropertyName=$true,ValueFromPipeline=$true)]
	����� $ComputerName,
	����� 
	������[Parameter(ValueFromPipelineByPropertyName=$true)]
	����� [int]$Port = 443
	��� )
	��� begin {
	����� $ProtocolNames = [System.Security.Authentication.SslProtocols] | gm -static -MemberType Property | ?{$_.Name -notin @("Default","None")} | %{$_.Name}
	��� }
	��� process {
	����� $ProtocolStatus = [Ordered]@{}
	����� $ProtocolStatus.Add("ComputerName", $ComputerName)
	����� $ProtocolStatus.Add("Port", $Port)
	����� $ProtocolStatus.Add("KeyLength", $null)
	����� $ProtocolStatus.Add("SignatureAlgorithm", $null)
	����� 
	������$ProtocolNames | %{
	������� $ProtocolName = $_
	������� $Socket = New-Object System.Net.Sockets.Socket([System.Net.Sockets.SocketType]::Stream, [System.Net.Sockets.ProtocolType]::Tcp)
	������� $Socket.Connect($ComputerName, $Port)
	������� try {
	��������� $NetStream = New-Object System.Net.Sockets.NetworkStream($Socket, $true)
	��������� $SslStream = New-Object System.Net.Security.SslStream($NetStream, $true)
	��������� $SslStream.AuthenticateAsClient($ComputerName,� $null, $ProtocolName, $false )
	��������� $RemoteCertificate = [System.Security.Cryptography.X509Certificates.X509Certificate2]$SslStream.RemoteCertificate
	��������� $ProtocolStatus["KeyLength"] = $RemoteCertificate.PublicKey.Key.KeySize
	��������� $ProtocolStatus["SignatureAlgorithm"] = $RemoteCertificate.SignatureAlgorithm.FriendlyName
	��������� $ProtocolStatus["Certificate"] = $RemoteCertificate
	��������� $ProtocolStatus.Add($ProtocolName, $true)
	������� } catch� {
	��������� $ProtocolStatus.Add($ProtocolName, $false)
	������� } finally {
	��������� $SslStream.Close()
	������� }
	����� }
	����� [PSCustomObject]$ProtocolStatus
	��� }
	� }
	�
	�
	� Test-SslProtocols -ComputerName "docs.microsoft.com"
```


# References
---
[Log Analytics TLS 1.2](https://docs.microsoft.com/azure/azure-monitor/platform/log-analytics-agent#tls-12-protocol)


