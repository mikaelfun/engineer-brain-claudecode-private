---
title: SSL Connectivity Check for Microsoft Monitoring Agent (Windows)
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/azure-monitor-agent/windows-agents/ssl-connectivity-mma-windows-powershell
product: monitor
date: 2026-04-18
---

# SSL Connectivity Check for MMA (Windows)

## Purpose
Determine whether SSL filtering (HTTPS inspection) is interfering with MMA connections to Azure endpoints.

## CheckSSL PowerShell Function

```powershell
function CheckSSL($fqdn, $port=443) {
    try {
        $tcpSocket = New-Object Net.Sockets.TcpClient($fqdn, $port)
    } catch {
        Write-Warning "$($_.Exception.Message) / $fqdn"
        break
    }
    $tcpStream = $tcpSocket.GetStream()
    $sslStream = New-Object -TypeName Net.Security.SslStream($tcpStream, $false)
    $sslStream.AuthenticateAsClient($fqdn)
    $certinfo = New-Object -TypeName Security.Cryptography.X509Certificates.X509Certificate2($sslStream.RemoteCertificate)
    $sslStream | Select-Object | Format-List -Property SslProtocol, CipherAlgorithm, HashAlgorithm, IsAuthenticated, IsEncrypted
    $certinfo | Format-List -Property Subject, Issuer, NotBefore, NotAfter, Thumbprint
    $tcpSocket.Close()
}
```

## Endpoints to Test
Replace `{workspaceId}` and `{automationId}` with actual GUIDs:

```powershell
CheckSSL "{workspaceId}.ods.opinsights.azure.com"
CheckSSL "{workspaceId}.oms.opinsights.azure.com"
CheckSSL "{workspaceId}.agentsvc.azure-automation.net"
CheckSSL "scadvisorcontent.blob.core.windows.net"
CheckSSL "api.monitor.azure.com"
CheckSSL "profiler.monitor.azure.com"
CheckSSL "live.monitor.azure.com"
CheckSSL "snapshot.monitor.azure.com"
```

## Key Validation
- `Issuer` must contain "Microsoft" (e.g., `CN=Microsoft RSA TLS CA 01`)
- If Issuer is NOT Microsoft → firewall/proxy HTTPS inspection is active → bypass it
- If no SSL info returned → check TCP connectivity first → check network firewall

## DNS Regional Codes (for Automation endpoints)
Common codes: East US = `eus`, West Europe = `we`, Southeast Asia = `sea`, China East 2 = `sha2`, China North 2 = `bjs2`
