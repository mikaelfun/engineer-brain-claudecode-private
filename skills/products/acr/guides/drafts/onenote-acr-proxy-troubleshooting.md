# ACR Container Registry Proxy Server Troubleshooting (Mooncake)

> Source: MCVKB 18.7 — [AKS] troubleshooting guide for container registry proxy server issues
> Quality: guide-draft (pending review)

## Proxy Architecture

Mooncake proxy servers pull images from Global Azure proxy servers (West US 2), which in turn pull from public container registries.

```
Public Registries → WUS2 Proxies → Mooncake Proxies (per region) → AKS Cluster
```

- Proxies are **per region** (China East 2, China North 2)
- Load balanced, but session cache means one AKS cluster connects to the same proxy for different images
- IP restriction: only Azure China IPs can access proxy servers (no public outside access)

### Proxy Server Inventory

| Region | Proxy VMs |
|--------|-----------|
| China East 2 | east2mirror, east2mirror2, east2mirror3, east2mirror4, east2mirror5 |
| China North 2 | north2mirror, north2mirror2, north2mirror3 |
| West US 2 (Global) | chinamirror, chinamirror-secondary, chinamirror3 |

Resource Group: `aks-mirror` (Mooncake), `chinamirror` (Global)

## Common Issues

1. **Bad performance** when pulling images from China proxy servers
2. **Fail to pull images** from China proxy servers

## Common Causes

1. **First-time image pull** — New image not cached on Mooncake proxy → goes back to Global proxy → goes to source registry. First pull is slow; subsequent pulls are faster.
2. **Customer-side network issue** — Investigate case by case.
3. **Ongoing issues on proxies** — High CPU or high traffic on Mooncake or Global proxy VMs.

## Investigation Steps for Cause #3

### Step 1: Check High Traffic Volume

- **Zabbix alerts**: Look for alerts about "too many active nginx connections"
  - Alert email titled "PROBLEM" = triggered
  - Alert email titled "OK" = cleared
  - Proxy naming: `east2cr` = east2mirror, `east2cr2` = east2mirror2
- **Network Out Mbps**: Check if proxy VMs' Network Out stays above **1GB** (use Jarvis dashboard)

### Step 2: Check CPU on Mooncake Proxies

- Check if CPU utilization stays above **50%** on Mooncake proxy servers
- Use Jarvis dashboard for the region where the AKS worker node is located

### Step 3: Check CPU on Global Proxies

- If no findings from Step 1 & 2, check CPU utilization on West US 2 proxy servers
- Use Global ASC link for CPU monitoring

## Escalation

When pull failure persists and customer needs urgent resolution:
- Raise **Sev.2 ICM** to PG for mitigation
- Include investigation findings (CPU metrics, traffic data) in ICM summary

## IP Whitelisting

- Proxy only accessible by Azure China IPs
- For whitelisting requests, contact: akscn@microsoft.com
- Reference: https://mirror.azure.cn/help/en/docker-registry-proxy-cache.html
