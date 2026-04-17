---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Troubleshooting/Broker or DBUS Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Device%20Registration/Linux%20Devices/Enterprise%20SSO%20for%20Linux%20Desktops/Troubleshooting/Broker%20or%20DBUS%20Troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Linux Enterprise SSO - Broker / DBUS Troubleshooting

## Monitor DBUS Output for Broker

```bash
busctl --user monitor com.microsoft.identity.broker1
```

## Restart DBUS

```bash
systemctl reload dbus
```

## Start/Stop Brokers

```bash
# Get Status
systemctl --user status microsoft-identity-broker
sudo systemctl --system -f -u status microsoft-identity-device-broker

# Get Info
systemctl --user info microsoft-identity-broker
sudo systemctl --system -f -u info microsoft-identity-device-broker

# Stop Brokers
systemctl --user stop microsoft-identity-broker
sudo systemctl --system -f -u stop microsoft-identity-device-broker

# Start Brokers
systemctl --user start microsoft-identity-broker
sudo systemctl --system -f -u microsoft-identity-device-broker
```
