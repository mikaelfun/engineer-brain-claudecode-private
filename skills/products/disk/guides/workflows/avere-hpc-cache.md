# Disk Avere vFXT & HPC Cache — 排查工作流

**来源草稿**: [ado-wiki-a-avere-cli-cmdlets.md], [ado-wiki-a-avere-scoping-general.md], [ado-wiki-a-avere-scoping-performance.md], [ado-wiki-a-avere-scoping-system-failure.md], [ado-wiki-a-basic-troubleshooting-steps.md], [ado-wiki-a-basic-connectivity-testing.md], [ado-wiki-a-hpc-quick-reference-sheet.md], [ado-wiki-avere-vfxt-quick-reference-sheet.md], [ado-wiki-rpc-slot-exhaustion-nfs.md], [ado-wiki-how-to-get-logs-and-packet-captures.md], [ado-wiki-a-avere-hpc-cache-restart-services.md], [ado-wiki-a-support-operations-reboot-cache.md], [ado-wiki-a-support-operations-collect-traces.md], [ado-wiki-a-support-operations-get-cache-plus.md]
**Kusto 引用**: 无
**场景数**: 6
**生成日期**: 2026-04-07

---

## Scenario 1: HPC Cache / Avere 基础排查 (Zero-to-Triage)
> 来源: ado-wiki-a-basic-troubleshooting-steps.md, ado-wiki-a-hpc-quick-reference-sheet.md | 适用: Mooncake ❌ / Global ✅

### 排查步骤
1. 获取集群名称 -> 检查 **StatsViewer/Virtual Dashboard** (条件、告警、延迟)
   - 健康规则: 客户端延迟 < Core Filer 延迟 = 集群正常工作
   - 仪表板有约 5 分钟延迟
2. 检查 **A/C Dashboard** (健康检查 + playbook)
3. 运行 **Geneva Get Cache Plus** (需 SAW + AME): 获取配置、状态、条件
   - 关键字段: `CurrentState`, `health.conditions`, `NodeStates`, `ActiveImage`
4. 确认缓存策略匹配工作负载 (最佳: ~80% 读 / 20% 写)
   - 写密集 + ReadOnly 策略 -> slot 耗尽 -> 高延迟
5. 如果证据过时 -> 强制收集新 GSI
   `[来源: ado-wiki-a-basic-troubleshooting-steps.md, ado-wiki-a-hpc-quick-reference-sheet.md]`

---

## Scenario 2: 延迟/性能问题排查
> 来源: ado-wiki-a-avere-scoping-performance.md, ado-wiki-a-hpc-quick-reference-sheet.md | 适用: Mooncake ❌ / Global ✅

### 排查步骤
1. **Virtual Dashboard**: 比较前端延迟 vs 存储目标延迟
2. 使用 **latency_analyzer.py**: 分析 bad vs baseline 时间窗口
3. 区分首次访问延迟 vs 热缓存延迟 (首次读取从后端获取 -> 延迟高峰正常)
4. 检查缓存状态: 缓存满 -> 淘汰数据 -> 延迟升高

### 常见根因

| 症状 | 根因 | 修复 |
|------|------|------|
| 写密集负载高延迟 | 策略不匹配 (写密集用 ReadOnly) | 切换 ReadWrite 策略 |
| 延迟尖峰、请求排队 | RPC Slot 耗尽 | 增加连接乘数或集群 IP |
| 缓存操作期间持续延迟 | 缓存满 — 空间淘汰 | 调整 writeback 延迟、调整工作集大小 |
| 高前端延迟 | 后端存储目标慢 | 检查后端健康状况 |

`[来源: ado-wiki-a-avere-scoping-performance.md, ado-wiki-a-hpc-quick-reference-sheet.md]`

---

## Scenario 3: RPC Slot 耗尽排查
> 来源: ado-wiki-rpc-slot-exhaustion-nfs.md | 适用: Mooncake ❌ / Global ✅

### 排查步骤
1. 确认时间窗口并检查 `nfs_back_proc` 统计
2. 关键指标:
   - `recv.timerExpire > 0` -> **不是** slot 耗尽 (NFS 调用未被正确响应)
   - `req.hunt + req.asyncappend` 显著 -> **是** slot 耗尽
   - `cwndlimit` 递增 -> 确认 slot 耗尽
3. 修复前验证: Core filer 利用率 < 80%, 无网络拥塞

### 修复方法
- **方法 1 (首选)**: 增加连接乘数 `massX.nfsConnMult` (默认 4 -> 先增到 8, 最大 23)
- **方法 2**: 增加集群 IP 数量 (更大的变更)
   `[来源: ado-wiki-rpc-slot-exhaustion-nfs.md]`

---

## Scenario 4: 系统故障排查
> 来源: ado-wiki-a-avere-scoping-system-failure.md | 适用: Mooncake ❌ / Global ✅

### 排查步骤
1. 检查 Dashboard 条件和告警
2. 确认服务重启是否仍在继续
3. 重复重启在单节点 -> 节点特定问题 -> 重启该节点服务
4. 条件已清除但告警仍显示 -> 检查历史告警是否过时
5. 无条件 + 正常指标 -> 集群可能已自愈 -> 聚焦 GSI 根因分析
   `[来源: ado-wiki-a-avere-scoping-system-failure.md]`

---

## Scenario 5: 连通性测试
> 来源: ado-wiki-a-basic-connectivity-testing.md | 适用: Mooncake ❌ / Global ✅

### 排查步骤
```bash
# UNIX ping 测试
ping -c 10 <ip>
# TCP 端口测试
nc -zvv <ip> <tcp_port>
# NFS 服务检查
rpcinfo -p <server>
nfsstat -c
nfsstat -s
```
- Windows: `tnc <ip> -Port 2049` -> 检查 `TcpTestSucceeded`
   `[来源: ado-wiki-a-basic-connectivity-testing.md]`

---

## Scenario 6: Geneva 操作 (Restart/Reboot/Collect Traces)
> 来源: ado-wiki-a-avere-hpc-cache-restart-services.md, ado-wiki-a-support-operations-reboot-cache.md | 适用: Mooncake ❌ / Global ✅

### 通用参数
需要: SAW + AME 账号, Environment, Endpoint, Subscription Id, Resource Group, Cache Name

### 操作列表
- **Restart Services**: Node Id (-1 = 全部), 输出 "NoContent" = 成功, 5-10 分钟后用 Get Cache Plus 验证
- **Reboot Cache**: Node Id (-1 = 全部), 操作前后检查 conditions/alerts
- **Collect Traces**: Initial Time + Duration Before/After, 完成后 trace 自动上传
- **Get Cache Plus** (只读): 返回集群配置、状态、条件信息
   `[来源: ado-wiki-a-avere-hpc-cache-restart-services.md, ado-wiki-a-support-operations-reboot-cache.md]`
