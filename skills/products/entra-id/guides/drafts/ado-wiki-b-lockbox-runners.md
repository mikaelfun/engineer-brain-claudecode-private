---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Customer LockBox/Log Query Reference/Lockbox Runners"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Customer%20LockBox/Log%20Query%20Reference/Lockbox%20Runners"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Customer Lockbox - Lockbox Runners Management

## Accessing Lockbox Runners in Jarvis

1. Go to https://jarvis-west.dc.ad.msft.net/
2. Click **Manage** → **Logs** → **Runners**
3. Select **Diagnostics Prod** and **lockbox** as Logs account
4. Go to the **Runners** tab
5. Right-click individual runner instances to **start/stop** them and to view runner logs

## Checking Runner Status

> **Note**: When a runner is stopped, the dashboard doesn't show it clearly. The correct way to check is to review the runner logs and verify there are recent logs in the past 30 minutes.

## Runner Metrics Dashboard

Runner metrics can also be found at:
- https://jarvis-west.dc.ad.msft.net/dashboard → **LockboxRunner** dashboard
