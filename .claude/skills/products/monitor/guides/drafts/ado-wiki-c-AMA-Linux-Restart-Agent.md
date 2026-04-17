---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Restart the agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Restart%20the%20agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]
# Overview
This how-to will explain different methods by which the Azure Monitor Agent for Linux can be restarted.

# Scenario: Systemd (system & service manager)
In some scenarios, we just need to restart the agent quickly and allow it to perform initialization tasks.

If you need to stop and start quickly (i.e. a single operation):
```
systemctl restart azuremonitoragent
```

If you need to stop the service, perform specific operations, and then start the service after:
```
systemctl stop azuremonitoragent
systemctl start azuremonitoragent
```

# Scenario: Clear cache
In some scenarios, we need to clear the existing agent cache files.

```
systemctl stop azuremonitoragent
rm -rf /var/opt/microsoft/azuremonitoragent/events
systemctl start azuremonitoragent
```

# Scenario: Extension disable & enable
In some scenarios, we need to replicate the operations that the AMA extension would perform during initial install.

Update the <agent-version-number> below to match your scenario:

```
cd /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-<agent-version-number>/
./shim.sh -disable
```

![image.png](/.attachments/image-772ec140-66fa-4d26-8302-c25d4597290d.png)

After the scripts finish running you should see the following results of a successful execution:

![image.png](/.attachments/image-d86065b2-3f12-4d59-9e24-740ad809f3d3.png)


```
cd /var/lib/waagent/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-<agent-version-number>/

./shim.sh -enable
```

![image.png](/.attachments/image-0110c2ef-e405-4dcd-8d2d-28d81ab7d137.png)

After the scripts finish running you should see the following results of a successful execution:

![image.png](/.attachments/image-529d0416-4764-4c85-8585-d0fb7ec0bdb4.png)



