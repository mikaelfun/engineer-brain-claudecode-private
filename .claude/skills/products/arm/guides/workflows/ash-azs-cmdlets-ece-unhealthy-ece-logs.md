# ARM Azure Stack Hub AzS Support 诊断命令 (ECE / Unhealthy) — 排查工作流

**来源草稿**: ado-wiki-a-AzsSupportComputeInfra.md 等 67 cmdlet 参考文件
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: ECE 不健康状态与日志收集
> 来源: ASH AzS.Support Module cmdlet 参考 | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **检查 ECE 状态**: 使用 Azs.Support 模块诊断 ECE (Execution Control Engine) 健康
2. **收集 ECE 日志**: 通过 PEP 获取详细日志
3. **分析 unhealthy 组件**: 检查 ECE role node 定义和组件状态
4. **修复**: 根据诊断结果执行修复操作
