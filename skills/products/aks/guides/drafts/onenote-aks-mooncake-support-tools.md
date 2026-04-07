# AKS Mooncake Support Tools Reference

> Source: OneNote - Mooncake POD Support Notebook

## Access Prerequisite
Join MyAccess project for Mooncake AKS log access:
- Security group: `CME\cld-aks-kusto-access-partners-mc` (member of `CME\MC-CXSupport`)
- May take ~half a day to take effect

## Tools

### ASI (Azure Service Insights)
- URL: https://azureserviceinsights.trafficmanager.cn/
- Usage: Select "ARM resource id" and input AKS resource ARM ID

### Geneva (Jarvis)
- URL: https://jarvis-west.dc.ad.msft.net/AB3A3E1C

### Kusto
- Primary: `akscn.kusto.chinacloudapi.cn`
- Alternative: `mcakshuba.chinaeast2.kusto.chinacloudapi.cn` (use if primary has access issues)
- Auth type: Client Security: AAD-Federated (requires CME smart card)

### AppLens
- URL: https://applens.chinacloudsites.cn/
- Usage: Select "ARM resource id" and input AKS resource ARM ID

## Useful Scripts & Dashboards
- PowerShell tool for quick Kusto queries: [ADO Wiki](https://supportability.visualstudio.com/AzureContainers/_wiki/wikis/Containers%20Wiki/1280681/PowerShell-tool-for-quick-useful-Kusto-Queries)
- Portal Metrics for VMSS IOPS (Linux): [ADO Wiki](https://supportability.visualstudio.com/AzureContainers/_wiki/wikis/Containers%20Wiki/1280653/Get-Portal-Metrics-For-Vmss-iops-using-custom-metrics(Linux))
- Helm Chart for network traces on all nodes: [ADO Wiki](https://supportability.visualstudio.com/AzureContainers/_wiki/wikis/Containers%20Wiki/1280655/Helm-Chart-for-capturing-Network-Traces-on-all-nodes)

## kubectl for Windows (Mooncake mirror)
- Download: https://mirror.azure.cn/kubernetes/kubectl/
