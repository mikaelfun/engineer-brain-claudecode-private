---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Troubleshooting/Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FLinux%20Devices%2FEnterprise%20SSO%20for%20Linux%20Desktops%2FTroubleshooting%2FLogs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Client Diagnostic Logs

There are two different ways that you can collect the client logs:

1. Use an automated tool to upload the client logs to Powerlift.
2. Execute the commands manually to inspect/gather the logs individually by each component.

**NOTE**: Once ASC and/or [Assist 365](https://assist.microsoft.com/) are updated, there will be no need to use Powerlift.

# What is the journalctl?

Journalctl is a utility for querying and displaying logs from journald, systemd's logging service.

```
$ journalctl -u microsoft-identity-broker.service since 1 hour ago 
```

# Find the Intune Device ID

Users can find their Device Id in Intune if they have the Intune Agent (Company Portal) installed:

```bash
cat ~/.config/intune/registration.toml
```

Response example:
```bash
account_hint = 'someuser@microsoft.com' 
device_hint = '12345678-1234-1234-1234-123456789abc'
```

# Collect Client Logs using Uploader (microsoft-identity-diagnostics)

The `microsoft-identity-diagnostics` tool captures, organizes, and uploads logs from the Linux Broker, Intune, OneAuth, and Microsoft Edge to a log management service.

## Install on Ubuntu/Debian (.DEB)

```bash
sudo apt install curl
curl -sSl https://packages.microsoft.com/keys/microsoft.asc | sudo tee /etc/apt/trusted.gpg.d/microsoft.asc
curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list | sudo tee /etc/apt/sources.list.d/microsoft-ubuntu-focal-prod.list
sudo apt update
sudo apt install microsoft-identity-diagnostics
```

## Install on RHEL/Fedora (.RPM)

```bash
sudo dnf install microsoft-identity-diagnostics
```

## Run the Collector

```bash
collect-microsoft-identity-diagnostics
```

Output includes:
- **INCIDENT REFERENCE**: short code (e.g. `42R4D3FB`)
- **INCIDENT URL**: `https://powerlift.acompli.net/#/incidents/<id>`

Share the **INCIDENT URL** with the support engineer.

# Access the Client Logs

## PowerLift

To view logs, request access to security group `cpp-linux-broker-PROD-RO` at [aka.ms/idweb](https://aka.ms/idweb):
1. Go to **Manage My Requests**
2. Search for `cpp-linux-broker-PROD-RO`
3. Add yourself as a member
4. Navigate to the **INCIDENT URL** to view `brokerlogs`, `edge_auth_logs`, `intune_agent_logs`, `intune_portal_logs`, `mainlogs`, `userlogs`

## Azure Support Center / Assist 365

1. In [Assist 365](https://assist.microsoft.com/), enter the DFM Support Incident ID
2. Navigate: **Actions** > **Applications** > **Intune** > **Troubleshooting** > **Device Logs**
3. Enter the Incident ID (PowerLift easy id) and click **View Results**

# Collect Logs Manually

## D-Bus output for broker

```bash
busctl --user monitor com.microsoft.identity.broker1
```

## Edge

```bash
./msedge.exe --enable-logging -v=1 --oneauth-log-level=5 --oneauth-log-pii
```

## JavaBroker — User-Context Logs

```bash
journalctl --user -f -u microsoft-identity-broker.service
```

## JavaBroker — System-Context Logs (Device Broker)

```bash
journalctl --system -f -u microsoft-identity-device-broker.service
```

## Intune — Ubuntu/Debian (.DEB)

```bash
journalctl --user -t intune-agent -b
```

## Intune — RHEL/Fedora (.RPM)

**Tab 1** — capture logs:
```bash
journalctl -f --user -t intune-portal > intune-portal.log
```

**Tab 2** — launch portal with debug logging:
```bash
cd /opt/microsoft/intune/bin
INTUNE_LOG_LEVEL=debug ./intune-portal
```

# Example JavaBroker Log Entries

Successful silent token acquisition log pattern:
```
I/BrokerJoinedAccountController:acquireTokenWithPRT:TokenResult: [...] Success Result
I/CommandDispatcher:submitSilent: [...] Completed silent request as owner [...] status: COMPLETED is cacheable: true
```
