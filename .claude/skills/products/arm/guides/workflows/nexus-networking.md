# ARM Nexus 网络 — 排查工作流

**来源草稿**: ado-wiki-a-nexus-standard-networking-architecture.md, ado-wiki-a-gnmi-in-nexus.md 等 18 files
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Network Fabric 排查
> 来源: Nexus networking 参考 | 适用: Mooncake ❌ / Global ✅

### 排查步骤
1. 检查 Network Fabric 资源状态
2. 验证 wipe-repave 操作结果
3. 分析 Portal 中的 fabric 配置
4. 检查 password rotation 状态

---

## Scenario 2: gNMI 与 SDN 排查
> 来源: ado-wiki-a-gnmi-in-nexus.md, ado-wiki-a-sdn-enabled-by-azure-arc.md | 适用: Mooncake ❌ / Global ✅

### 排查步骤
1. 检查 gNMI (gRPC Network Management Interface) 连接
2. 验证 Arc-enabled SDN 配置
3. 使用 SDN Diagnostics 模块排查网络问题
