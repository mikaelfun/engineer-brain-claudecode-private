---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Troubleshooting/Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FLinux%20Devices%2FEnterprise%20SSO%20for%20Linux%20Desktops%2FTroubleshooting%2FLogs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Client Diagnostic Logs — Linux Enterprise SSO

There are two different ways to collect the client logs:

1. Use an automated tool to upload the client logs to Powerlift.
2. Execute the commands manually to inspect/gather the logs individually by each component.

**NOTE**: Once ASC and/or [Assist 365](https://assist.microsoft.com/) are updated, there will be no need to use Powerlift.

---

## What is journalctl?

Journalctl is a utility for querying and displaying logs from journald, systemd's logging service.

```bash
journalctl -u microsoft-identity-broker.service --since "1 hour ago"
```

---

## Find the Intune Device ID

```bash
cat ~/.config/intune/registration.toml
# account_hint = 'someuser@microsoft.com'
# device_hint = '12345678-1234-1234-1234-123456789abc'
```

---

## Collect Client Logs using the Uploader Tool

### Install microsoft-identity-diagnostics

**Ubuntu/Debian:**
```bash
sudo apt install curl
curl -sSl https://packages.microsoft.com/keys/microsoft.asc | sudo tee /etc/apt/trusted.gpg.d/microsoft.asc
curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list | sudo tee /etc/apt/sources.list.d/microsoft-ubuntu-focal-prod.list
sudo apt update
sudo apt install microsoft-identity-diagnostics
```

**RHEL/Fedora:**
```bash
sudo dnf install microsoft-identity-diagnostics
```

### Run the Collector

```bash
collect-microsoft-identity-diagnostics
```

Output example:
```
Collecting & Merging Logs...
1. Collecting Broker Device Logs..
2. Collecting Broker Logs...
3. Collecting Intune logs
4. Collecting Microsoft Edge Logs
Creating Incident...
Uploading Logs...
Incident Details
- INCIDENT REFERENCE: [42R4D3FB]
- ID: [dd3988ea-088d-4e2d-9212-c2d5b42b0f90]
- INCIDENT URL: [https://powerlift.acompli.net/#/incidents/dd3988ea-...]
```

Share the **INCIDENT URL** with the customer's support contact.

---

## Access Client Logs via PowerLift

1. Visit [aka.ms/idweb](https://aka.ms/idweb) → **Manage My Requests**
2. Search for and join security group: `cpp-linux-broker-PROD-RO`
3. Once approved, navigate to `https://powerlift.acompli.net/#/incidents` and search by INCIDENT REFERENCE or INCIDENT URL.

Log bundles available: `brokerlogs`, `edge_auth_logs`, `intune_agent_logs`, `intune_portal_logs`, `mainlogs`, `userlogs`

---

## Collect Logs Manually

### DBus Broker (User Context)
```bash
busctl --user monitor com.microsoft.identity.broker1
```

### JavaBroker — User Context
```bash
journalctl --user -f -u microsoft-identity-broker.service
```

### JavaBroker — Device/System Context
```bash
journalctl --system -f -u microsoft-identity-device-broker.service
```

### Microsoft Edge
```bash
./msedge.exe --enable-logging -v=1 --oneauth-log-level=5 --oneauth-log-pii
```

### Intune (Ubuntu/Debian)
```bash
journalctl --user -t intune-agent -b
```

### Intune (RHEL/Fedora) — Two terminals:

**Tab 1** (capture logs):
```bash
journalctl -f --user -t intune-portal > intune-portal.log
```

**Tab 2** (launch with debug):
```bash
cd /opt/microsoft/intune/bin
INTUNE_LOG_LEVEL=debug ./intune-portal
```

---

## Example JavaBroker Log Output

### User-Context Success Flow
```
microsoft-identity-broker: I/BrokerJoinedAccountController:acquireTokenWithPRT:TokenResult: Success Result
microsoft-identity-broker: I/CommandDispatcher:submitSilent: Completed silent request as owner ... status: COMPLETED
```

### System-Context (Device Broker)
```
microsoft-identity-device-broker: V/StorageEncryptionManager#:decrypt: Finished decryption with key:LinuxBrokerSystemUserSecretKey
microsoft-identity-device-broker: I/DeviceBrokerDBusV1Impl:loadKeyPair: Sending result back to calling application
```
