# Disk Data Box POD: Hardware & Error Codes — 排查工作流

**来源草稿**: ado-wiki-data-box-hardware-faq.md, ado-wiki-a-local-ui-error-codes.md, ado-wiki-a-hardware-6k-diagram.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Data Box POD 硬件故障排查
> 来源: ado-wiki-data-box-hardware-faq.md | 适用: Mooncake ✅ / Global ✅

### 关键硬件规格
- 存储容量: 100 TB (80 TB 可用，RAID 5)
- 网络接口: 2x 1 GbE (MGMT, DATA3) + 2x 10 GbE (DATA1, DATA2)
- 最大传输速率: 80 TB/天 (10 GbE)
- 电源: 700W (典型 375W)

### System Fault LED 指示

红色 LED 可能表示:
- 风扇故障
- CPU 温度过高
- 主板温度过高
- DIMM ECC 错误

### 排查步骤
1. 检查风扇是否正常工作
2. 将设备移至通风更好的位置
3. 以上无效 → 退回设备（Data Box 无现场可更换单元）

---

## Scenario 2: Local UI Error Code 解读
> 来源: ado-wiki-a-local-ui-error-codes.md | 适用: Mooncake ✅ / Global ✅

### 错误码格式
UI 显示 "OOPs! Something went wrong" + `#<数字代码>`

### 错误码解读

**#60XYZ 格式:**
```
X = 硬件健康: 0=Unknown, 1=Healthy, 2=Degraded, 3=Unhealthy
Y = 软件健康: 0=Unknown, 1=Healthy, 2=Unhealthy
Z = 整体健康: 0=Unknown, 1=Healthy, 2=Degraded, 3=Unhealthy
```

| 错误码 | 含义 |
|--------|------|
| #60313 | 硬件不健康，软件正常 |
| #60323 | 硬件和软件均不健康 |
| #60123 | 硬件正常，软件不健康 |
| #55100 | Pod 服务未运行，硬件正常 |
| #70111 | 意外错误 → 重启设备重试 |

### 处理流程
- 硬件不健康 (#60X3Z) → 收集 support package → 联系管理平台团队
- 软件不健康 (#60XY2) → 可能原因: DV filter 服务未运行 / 磁盘解锁异常 / Pod 启动任务失败
- 管理集群资源异常 (#55XYZ) → 收集 support package → 联系管理平台团队