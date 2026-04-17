# ARM Azure Stack Hub 网络与 SDN (DNS / Hyper-V) — 排查工作流

**来源草稿**: ado-wiki-a-install-the-sdn-diagnostics-module.md 等 8 files
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: DNS 问题排查
> 来源: ASH SDN 参考文件 | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 检查 DNS 配置与解析状态
2. 查找 orphaned DNS 记录
3. 验证 Network Controller 与 DNS 集成
4. 使用 SdnDiagnostics 模块收集网络追踪

---

## Scenario 2: Hyper-V 网络排查
> 来源: ASH SDN 参考文件 | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 检查 vSwitch 配置
2. 验证 Hyper-V 网络虚拟化状态
3. 分析 Network Controller 连接性
