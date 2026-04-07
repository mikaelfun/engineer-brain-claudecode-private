---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======18. AKS=======/18.12 How to get AKS JIT access with escort.md"
sourceUrl: null
importDate: "2026-04-04"
type: internal-ops-guide
applicability: mooncake-only
---

# AKS JIT Access 获取流程（Mooncake Escort）

> **适用范围**: Mooncake (21Vianet) 内部支持工程师  
> **用途**: 在客户 AKS 控制平面执行操作前获取 JIT 授权

## 背景

Mooncake 所有客户环境访问需通过 ESCORT 合规流程。执行 AKS Customer Control Plane Operations（如 API Server restart、kubectl delete）前必须先获取 JIT Access。

> ⚠️ **操作警告**: restart / kubectl delete 类操作需提前通知客户，仅在 API Server 已处于 failed/unhealthy 状态时执行。

---

## 流程步骤

### Step 1 — 创建 ICM Ticket

访问: [portal.microsofticm.com/imp/v3/incidents/create?tmpl=O2h2V3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=O2h2V3)

- 填写 **subID** 和 **SR number**
- **assign to yourself**
- ⚠️ 必须在 **14 天内关闭** ICM（关闭时 region 可选 unknown）

### Step 2 — 创建 ESCORT 请求

在 ADO (vstfrd) 创建 Escort Request：

```
Title: Mooncake Escort Access Request - [Your Name]
Escort Requestor Name: <Your name>
Escort Requestor Team name: Support
Resource Requested: 16_Others
Purpose: Customer Support
WorkItem Source: IcM
WorkItem ID: <ICM ticket ID from Step 1>
Requested Start Time: <ASAP or scheduled time>
Estimated duration: <estimate>

Description:
  Q1: What operations do you need to do through escort?
  A: AKS JIT Access — [describe specific action]

  Q2: Do you need access to any secrets or restricted data? (Y/N)
  A: No
```

### Step 3 — 等待 Escort Engineer 联系

`waps@21vianet.com` 会通过 **Teams** 联系你（7×24×365）。

Escort Engineer 会打开 shadow 并在 **Jarvis** 中操作：

```
Jarvis → Action → Mooncake → AzureContainerService AKS
→ Customer Control Plane Operations
→ [选择具体操作] → Get Access (填 ICM#) → Run
```

---

## Modern Path（GenevaActions 迁移后）

直接通过 Jarvis Action：

```
Action → Mooncake → AzureContainerService AKS
```

常用 sections：
- **Customer Control Plane Operations** — 需要 JIT
- **Resource Operations** — 部分无需 JIT

---

## 注意事项

- ICM 必须 14 天内关闭
- 对客户集群执行破坏性操作（restart、delete）前务必通知客户
- 操作完成后及时关闭 ICM
