---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/Concepts/Built-In Azure Monitor Alerts"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FConcepts%2FBuilt-In%20Azure%20Monitor%20Alerts"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Built-In Azure Monitor Alerts

## Regular Azure Monitor Alerting Flow

**Alerts Data Plane:** Processes the Azure Monitor alert rule logic to determine if an alert should be fired/resolved or not.

**Alert Management Platform:**
- Fires/Resolves the Azure Monitor alert
- Processes the relevant Alert Processing Rule (if applicable)
- Invokes the relevant Action Group (if applicable)

**Azure Notification System:** Responsible for invoking the relevant notification/action

## Built-In Azure Monitor Alerting Flow

Built-In Azure Monitor Alerts are a simplified alerting experience that an Azure service can onboard to. The Built-In Monitor Alerting experience is **owned by the onboarded Azure service PG and CSS**. Azure Monitor does not own this alerting experience.

### Azure Services onboarded to Built-In Monitor Alerts
- Azure Backup and Site Recovery
- Azure Stack Edge
- Azure Stack HCI
- Data Box Gateway
- Event Grid
- SCOM Managed Instance
- Azure Local

### Key Architecture Differences

1. **No resource ID** — Built-In Alerts skip the Alerts Data Plane; the onboarded service processes alerting logic in its own environment.
2. **No Action Group directly** — Because there is no resource ID, an Action Group cannot be added directly. An **Alert Processing Rule** must be used instead.
3. **Exception: Event Grid** — Event Grid uses an Event Subscription which HAS a resource ID, so an Action Group CAN be directly added.

### Support Boundaries

- **Onboarded service PG owns**: alerting logic and processing (green)
- **Azure Monitor team owns**: Alert Processing Rule and Action Group experience (purple)
- **Event Grid addition**: data processed for alerting is owned by different resource providers (currently Azure VM and Azure Key Vault in public preview)

### Event Grid Specifics

- Event Grid is event-driven (eliminates polling, sub-second alert firing)
- Sub-second processing does NOT apply to notification/action delivery time
- Currently supported for Azure VMs and Azure Key Vault only
- Engage Event Grid team first for troubleshooting

## Helpful References

### Azure Backup and Site Recovery
- [Monitoring and reporting solutions for Azure Backup](https://learn.microsoft.com/azure/backup/monitoring-and-alerts-overview)
- [Switch to Azure Monitor based alerts](https://learn.microsoft.com/azure/backup/move-to-azure-monitor-alerts)

### Azure Event Grid
- [Project Flash - Use Azure Event Grid to monitor Azure VM availability](https://learn.microsoft.com/azure/virtual-machines/flash-event-grid-system-topic)
- [Subscribe to Health Resources events](https://learn.microsoft.com/azure/event-grid/handle-health-resources-events-using-azure-monitor-alerts)

### Azure Stack Edge
- [Review alerts on Azure Stack Edge](https://learn.microsoft.com/azure/databox-online/azure-stack-edge-alerts)

### Azure Stack HCI
- [Respond to Azure Stack HCI health alerts](https://learn.microsoft.com/azure-stack/hci/manage/health-alerts-via-azure-monitor-alerts)
