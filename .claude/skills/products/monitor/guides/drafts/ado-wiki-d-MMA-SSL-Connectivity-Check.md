---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/How-To/How to check SSL connectivity for MMA using PowerShell"
sourceUrl: "https://dev.azure.com/Supportability/6f9dfd80-6071-4f7b-8bf9-c97214ca68cf/_wiki/wikis/bebfc12e-d2ce-4ed1-8a64-d64c20264fd2?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows%2FHow-To%2FHow%20to%20check%20SSL%20connectivity%20for%20MMA%20using%20PowerShell"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
---
Applies To:
- Microsoft Monitoring Agent :- All versions
---

# Note
 - The screenshot and output provided are from test labs there is no pii data present.

# Scenario
---
Whenever customers are facing difficulties with endpoint connectivity and the Microsoft monitoring agents, while we can run the �Test Cloud Connection� utility to see if the Physical Network Connections are open, there are times when we need to check for specific SSL connectivity to determine if there is any filtering in place.
 

# PowerShell

_**Open an elevated PowerShell ISE session (Run As Administrator) and run the following lines:**_



```
###################################################################
## Function test the following:
##   Name Resolution
##   Connectivity
##   information on the Certificate provided.   If the issuer is not Microsoft ask customer to "Bypass HTTPS Inspection"
## 
## Usage:    CheckSSL FQDN
##
function CheckSSL($fqdn, $port=443) 
{
    Try {$tcpsocket = New-Object Net.Sockets.TcpClient($fqdn, $port)} Catch {Write-Warning "$($_.Exception.Message) / $fqdn";break}
    $tcpstream = $tcpsocket.GetStream()
    ""; "-- Target: $fqdn / " + $tcpsocket.Client.RemoteEndPoint.Address.IPAddressToString
    $sslStream = New-Object Net.Security.SslStream($tcpstream, $false)
    $sslStream.AuthenticateAsClient($fqdn)  # if not valid will dispaly remote cerfiticate is invalid
    $certinfo = New-Object security.cryptography.x509certificates.x509certificate2($sslStream.RemoteCertificate)
    $sslStream | select-object | FL sslProtocol,CipherAlgorithm, HashAlgorithm,KeyExchangeAlgorithm,IsAuthenticated,IsEncrypted,IsSigned, CheckCertRevocationStatus
    $certinfo | fl Subject, Issuer, FriendlyName, NotBefore, NotAfter, Thumbprint
    $certinfo.Extensions | where {$_.Oid.FriendlyName -like 'subject alt*'} | `
      foreach { $_.Oid.FriendlyName; $_.Format($true) }
    $tcpsocket.Close() 
}
CLS 
 
##  Sample checking log Analytics workspace endpoints where ########-####-####-####-############ is the workspace ID
IPConfig /FlushDNS     ### this is not required however it is wise to execute if you are collecting a network trace
CheckSSL "########-####-####-####-############.ods.opinsights.azure.com"
CheckSSL "########-####-####-####-############.oms.opinsights.azure.com"
CheckSSL "########-####-####-####-############.agentsvc.azure-automation.net"
CheckSSL "scadvisorcontent.blob.core.windows.net"
# other related log analytics URLs
CheckSSL "api.monitor.azure.com"
test-netconnection global.in.ai.monitor.azure.com -port 443 ###  "The remote certificate is invalid according to the validation procedure."  Not certain why the error occurs with checkssl
CheckSSL "profiler.monitor.azure.com"
CheckSSL "live.monitor.azure.com"
CheckSSL "snapshot.monitor.azure.com"

##  Sample checking Automation endpoints where ########-####-####-####-############ is the automation ID, found on the Azure portal under "Automation Account | Keys" on the URL field

CheckSSL "########-####-####-####-############.jrds.eus2.azure-automation.net"
CheckSSL "########-####-####-####-############.agentsvc.eus2.azure-automation.net"

```
 - When checking the Automation account endpoints you will need to modify, not only the automation account id, but also the regional code inside the target endpoints path.

Example: ########-####-####-####-############.agentsvc.**eus2**.azure-automation.net, points to an automation account in East US 2. For a complete list of DNS regional codes refer to the chart at the bottom of this page

**== Sample Windows PowerShell Output:**

```

PS C:\WINDOWS\system32> CheckSSL "########-####-####-####-############.ods.opinsights.azure.com"

-- Target: ########-####-####-####-############.ods.opinsights.azure.com / 40.79.154.83

SslProtocol               : Tls12
CipherAlgorithm           : Aes256
HashAlgorithm             : Sha384
KeyExchangeAlgorithm      : 44550
IsAuthenticated           : True
IsEncrypted               : True
IsSigned                  : True
CheckCertRevocationStatus : False


Subject      : CN=ODS-SSL201712EUS.azure.com
Issuer       : CN=Microsoft RSA TLS CA 01, O=Microsoft Corporation, C=US
FriendlyName : 
NotBefore    : 9/26/2021 2:30:43 PM
NotAfter     : 9/26/2022 2:30:43 PM
Thumbprint   : F84E9C8A41CF8C7E62A594F1E95961107C33A30D



Subject Alternative Name
DNS Name=ODS-SSL201712EUS.azure.com
DNS Name=*.ods.opinsights.azure.com
DNS Name=ods.systemcenteradvisor.com
DNS Name=ods.trafficmanager.net
DNS Name=eus-aa-ods-a.cloudapp.net
DNS Name=eus-aa-ods-b.cloudapp.net
DNS Name=eus2-aa-ods-a.cloudapp.net
DNS Name=eus2-aa-ods-b.cloudapp.net

```

Each one will result with an Issuer tag if this tag does not show Microsoft as in the following examples:

**PowerShell: Issuer : _CN=Microsoft_ RSA TLS CA 01, O=Microsoft Corporation, C=US**

Note:  if you do not get any SSL information return you should check if the TCP connection is successful. If you cannot establish a TCP connection then customer should check Network firewall.

                Using Windows PowerShell
                test-netconnection global.in.ai.monitor.azure.com -port 443    

![image.png](/.attachments/image-41372f56-5306-42df-833c-d56aa2410481.png)
