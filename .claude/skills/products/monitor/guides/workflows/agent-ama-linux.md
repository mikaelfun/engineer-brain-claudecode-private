# Monitor AMA Linux 代理排查 — 排查工作流

**来源草稿**: [ado-wiki-a-AMA-Linux-TSG-Installation-Azure-VM.md], [ado-wiki-a-AMA-Linux-TSG-Installation-Azure-Arc.md], [ado-wiki-a-AMA-Linux-TSG-Configuration-Azure-VM.md], [ado-wiki-a-AMA-Linux-TSG-Configuration-Azure-Arc.md], [ado-wiki-a-AMA-Linux-TSG-Collection-Text-Logs.md], [ado-wiki-b-AMA-Linux-Check-AMA-Processes.md], [ado-wiki-d-AMA-Linux-Test-Endpoint-Connectivity.md]
**Kusto 引用**: 无
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: AMA Linux 安装失败 — Azure VM
> 来源: ado-wiki-a-AMA-Linux-TSG-Installation-Azure-VM.md | 适用: Mooncake ✅

### 排查步骤

1. **VM 是否已开机？** Portal 路径: Azure Portal -> VM -> Overview -> Status
2. **VM 是否有 Managed Identity？** Portal 路径: Azure Portal -> VM -> Identity
3. **扩展是否存在？** Type=Microsoft.Azure.Monitor.AzureMonitorLinuxAgent
4. **VM Guest Agent 是否运行？** systemctl status walinuxagent
5. **Guest Agent 是否下载了扩展二进制？**
6. **Guest Agent 是否安装并启用了扩展？** 检查 extension.log
7. **AMA 进程是否启动？**

   ```bash
   ps -ef | grep -v grep | grep azuremonitoragent
   ```
   [来源: ado-wiki-b-AMA-Linux-Check-AMA-Processes.md]

**判断逻辑**：

| 结果 | 含义 | 下一步 |
|------|------|--------|
| Provisioning Succeeded + 进程运行 | 安装正常 | -> Scenario 3 |
| Provisioning Failed | 安装失败 | 检查 Guest Agent 日志 |
| 进程未运行 | 启动失败 | 检查 agentlauncher/mdsd 日志 |

---

## Scenario 2: AMA Linux 安装失败 — Azure Arc
> 来源: ado-wiki-a-AMA-Linux-TSG-Installation-Azure-Arc.md | 适用: Mooncake ✅

### 排查步骤

1. **Arc 机器是否已连接？** Status = Connected
2. **Arc 机器是否有 Managed Identity？**
3. **扩展是否存在于 Arc 配置中？**
4. **Arc Agent 是否下载了扩展二进制？**

   ```bash
   cat /var/lib/GuestConfig/ext_mgr_logs/gc_ext.log
   ```
   [来源: ado-wiki-a-AMA-Linux-TSG-Installation-Azure-Arc.md]

5. **Arc Agent 是否安装并启用了扩展？** azcmagent logs
6. **AMA 进程是否启动？** 同 Scenario 1 Step 7

---

## Scenario 3: AMA Linux 配置失败 — Azure VM
> 来源: ado-wiki-a-AMA-Linux-TSG-Configuration-Azure-VM.md | 适用: Mooncake ✅

### 前提: 扩展 Succeeded + 进程运行，但 AuthToken-MSI.json 缺失或 configchunks 为空

### 排查步骤

1. **是否有 DCR 关联？**
2. **VM 是否有 Managed Identity？**
3. **能否连通 IMDS？**

   ```bash
   curl -H Metadata:true http://169.254.169.254/metadata/instance?api-version=2021-02-01
   ```
   [来源: ado-wiki-a-AMA-Linux-TSG-Configuration-Azure-VM.md]

4. **能否连通 Handler 端点？**

   ```bash
   curl -v -s -S -k https://global.handler.control.monitor.azure.com/ping
   ```
   [来源: ado-wiki-d-AMA-Linux-Test-Endpoint-Connectivity.md]

   | 结果 | 含义 | 下一步 |
   |------|------|--------|
   | HTTP 200 | 连通正常 | 分析 mdsd 日志 |
   | TCP 失败 | 防火墙/NSG | 检查网络规则 |
   | TLS 失败 | 版本问题 | 确保 TLS>=1.2 |

5. **网络抓包** tcpdump -w /tmp/ama-trace.pcap

---

## Scenario 4: AMA Linux 配置失败 — Azure Arc
> 来源: ado-wiki-a-AMA-Linux-TSG-Configuration-Azure-Arc.md | 适用: Mooncake ✅

同 Scenario 3，但 Step 3 用 HIMDS 替代 IMDS

---

## Scenario 5: AMA Linux Text Log 数据不收集
> 来源: ado-wiki-a-AMA-Linux-TSG-Collection-Text-Logs.md | 适用: Mooncake ✅

### 前提: Heartbeat 正常，Text Log 缺失/重复/格式错误

### 排查步骤

1. **范围界定** — 问题类型/文件路径/编码/分隔方式
2. **DCR 配置是否正确？** 关联 DCR + filePatterns + stream/table
3. **mdsd 是否正确配置？** configchunks + 监听端口
4. **Fluentbit 是否正确运行？** td-agent.conf + fluentbit.log
5. **mdsd 数据传输** mdsd.qos TotalRowsRead/TotalRowsSent
6. **Ingestion Pipeline** 表 + Schema + Transform + DCRErrorLogs

---

## 关联已知问题
| 症状 | 方案 | 指向 |
|------|------|------|
| 扩展安装失败 | Guest Agent + MI | Scenario 1/2 |
| 进程运行但无 Heartbeat | 配置获取失败 | Scenario 3/4 |
| Text Log 缺失 | Fluentbit | Scenario 5 |
| TLS 握手失败 | TLS 1.0 | TLS 1.2+ |
