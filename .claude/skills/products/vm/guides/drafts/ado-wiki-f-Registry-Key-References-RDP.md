---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Registry Key References_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FRegistry%20Key%20References_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Registry Key References for RDP/SSH

Reference for registry keys related to Terminal Services and RDP configuration on Azure VMs.

## Services key reference

Path: `HKLM\SYSTEM\CurrentControlSet\Services`

### Error Control Management

Controls how critical a service is and whether a driver error requires LastKnownGood or Stop message.

### Start Control Management

Defines how and when the service/device starts.

### Type Management

Specifies which group the device/service belongs to and loading order.

### Other Values

| Key | Type | Meaning |
|-----|------|---------|
| Group | REG_SZ | Group the driver/service belongs to for startup ordering |
| DependOnGroup | REG_MULTI_SZ | Groups that must load before this service |
| DependOnService | REG_MULTI_SZ | Services that must load before this service |
| ImagePath | REG_DWORD | Path and filename of the service binary |
| ObjectName | REG_DWORD | Account name (WIN32 service) or driver object name |
| Tag | REG_DWORD | Load order within a group (unique per group) |

## Terminal Server Level

Path: `HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server`

| Key | Default | Meaning |
|-----|---------|---------|
| AllowRemoteRPC | 0 | 0=Disable, 1=Enable remote RPC to TS |
| DeleteTempDirsOnExit | 1 | 0=Keep, 1=Delete temp session dirs on logoff |
| fAllowToGetHelp | 0 | 0=Disable, 1=Enable remote assistance |
| fDenyTSConnections | 1 | 0=RDP Enabled, 1=RDP Disabled |
| fSingleSessionPerUser | 1 | 0=Multiple sessions, 1=Single session per user |
| PerSessionTempDir | 1 | 0=Shared temp dir, 1=Per-session temp dir |
| TSAdvertise | 1 | 0=Disable, 1=Enable TS server advertising |
| TSEnabled | 1 | 0=TS Disabled, 1=TS Enabled |
| TSServerDrainMode | 0 | 0=Accept RDP, 1=Drain mode (maintenance) |
| TSUserEnabled | 0 | 0=Login Enabled, 1=Login Disabled |
| UserSessionLimit | 0 | 0=Unlimited, XX=Limited session count |

## RDP Listener Level

Key encryption and security settings for the RDP listener configuration.

### MinEncryptionLevel

| Value | Meaning |
|-------|---------|
| 1 | Low: only client-to-server encrypted (56-bit) |
| 2 | Client Compatible: bidirectional at max level supported by client |
| 3 | High: 128-bit bidirectional encryption |
| 4 | FIPS Compliant: Federal Information Processing Standard |

### SecurityLayer

| Value | Meaning |
|-------|---------|
| 0 | RDP Security Layer (less secure) |
| 1 | Negotiate: TLS if supported, else RDP |
| 2 | SSL/TLS: requires server certificate |

### UserAuthentication (NLA)

| Value | Meaning |
|-------|---------|
| 0 | NLA not required |
| 1 | NLA required before full RDP connection |
