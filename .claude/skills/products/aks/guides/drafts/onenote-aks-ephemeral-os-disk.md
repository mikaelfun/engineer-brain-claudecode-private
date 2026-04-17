---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======18. AKS=======/18.25 ephemeral OS disk.md"
sourceUrl: null
importDate: "2026-04-04"
type: knowledge-note
---

# AKS Ephemeral OS Disk 行为说明

> **参考文档**: docs.microsoft.com/azure/aks/cluster-configuration#ephemeral-os  
> **适用**: AKS 所有环境，client API version >= 2020-11-01

## 核心行为

| 场景 | 默认 OS 磁盘类型 |
|------|-----------------|
| VM size 支持 Ephemeral OS Disk（cache 或 temp disk 足够大） | **Ephemeral（临时磁盘）** |
| VM size 不支持 | Managed Disk |

- **Portal** 不显示 OS Disk 类型选择入口
- **Ephemeral OS Disk 行为**: VM deallocation 或 reimage 时数据丢失（与 temp disk 相同）
- **性能**: Ephemeral 比 Managed Disk 有更低 latency 和更高 IOPS

## 如何强制使用 Managed Disk

```bash
# 创建 node pool 时指定
az aks nodepool add \
  --resource-group <rg> \
  --cluster-name <cluster> \
  --name <nodepool> \
  --os-disk-type Managed

# 创建集群时指定
az aks create \
  --resource-group <rg> \
  --name <cluster> \
  --os-disk-type Managed
```

## 验证磁盘类型（Kusto）

**Kusto**: `azcrpmc.kusto.chinacloudapi.cn` / db: `crp_allmc`

```kql
cluster('Azcrpmc').database('crp_allmc').ContextActivity
| where PreciseTimeStamp >= ago(5d)
| where subscriptionId == "<subId>"
| where message contains "<clusterName>"
| where message contains "profile"
| where message contains "Local"
// "Local" 表示 ephemeral（本地）磁盘
```

## 排查建议

- 客户反映节点重启后数据丢失 → 确认是否使用了 Ephemeral OS Disk
- 确认 VM size 是否支持 ephemeral（检查 VM size 的 cache storage 大小 vs OS disk 大小）
- 生产环境若需持久化 node 数据（如自定义配置）→ 推荐使用 Managed Disk
