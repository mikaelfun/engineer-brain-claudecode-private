---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Validate Network Connectivity/Validate TCP connectivity in Application Insights"
sourceUrl: "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Validate%20Network%20Connectivity/Validate%20TCP%20connectivity%20in%20Application%20Insights"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Validate TCP Connectivity in Application Insights

## Purpose

Validate TCP connectivity between the host running an application and Application Insights ingestion endpoints.

**Prerequisite:** DNS resolution must be confirmed first. See: [Validate DNS connectivity](guides/drafts/ado-wiki-c-validate-dns-connectivity.md)

**Question TCP answers:** *"Can I get there?"*

## Methods to Validate TCP Connectivity

### Method 1: Send Sample Telemetry via PowerShell
See: [Send Sample Telemetry Using PowerShell](guides/drafts/ado-wiki-c-send-sample-telemetry-using-powershell.md)

### Method 2: curl Commands

curl validates DNS resolution AND TCP connectivity together (must resolve DNS + establish TCP before REST call can succeed).

#### App Service on Windows (Console)
```
curl -v https://{ingestion-endpoint}:443
```

#### App Service on Linux (SSH)
```bash
curl -v https://{ingestion-endpoint}:443
```

#### Azure VM / On-Premises (CMD)
```
curl -v https://{ingestion-endpoint}:443
```

#### AKS Environments
```bash
kubectl exec <pod-name> --namespace <namespace> -- curl -v --tlsv1.2 --tls-max 1.2 https://centralus-2.in.applicationinsights.azure.com:443
kubectl exec <pod-name> --namespace <namespace> -- curl -v --tlsv1.2 --tls-max 1.2 https://live.applicationinsights.azure.com:443
```

### curl Tips
- Specify protocol and port: `https://` and `:443`
- Use `curl --help` for options

## Interpreting curl Output

### Successful Connection
Key indicators in output:
```
* Connected to centralus-2.in.applicationinsights.azure.com (20.44.12.194) port 443 (#0)
* SSL connection using TLSv1.2 / ECDHE-RSA-AES256-GCM-SHA384
* Connection #0 to host centralus-2.in.applicationinsights.azure.com left intact
```

### Failure: Port 443 Blocked (NSG outbound rule)
```
* connect to 20.44.8.7 port 443 failed: Timed out
* Failed to connect to centralus-0.in.applicationinsights.azure.com port 443: Timed out
curl: (7) Failed to connect to ... Timed out
```

### Failure: TLS Version Conflict (curl forced to TLS 1.1, endpoint requires TLS 1.2)
```
* OpenSSL SSL_connect: Connection was reset in connection to centralus-2.in.applicationinsights.azure.com:443
curl: (35) OpenSSL SSL_connect: Connection was reset
```
> **Important:** This TLS failure from curl does NOT necessarily mean the customer's web app is also using TLS 1.1. curl uses its own process and TLS version choice. This merely confirms the endpoint is enforcing TLS 1.2.

## Solution for TCP Failures

If host can resolve DNS but cannot establish TCP connection, engage the customer's networking team to investigate:
- Firewalls, load balancers, proxies, or third-party network appliances blocking outbound connections
- Direct customer to allowlist required endpoints per: [IP addresses used by Azure Monitor](https://learn.microsoft.com/azure/azure-monitor/app/ip-addresses)
- Engage Azure Networking team if infrastructure is Azure-hosted
