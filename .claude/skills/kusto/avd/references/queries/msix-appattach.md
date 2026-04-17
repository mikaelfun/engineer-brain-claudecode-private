---
name: msix-appattach
description: MSIX App Attach 诊断查询
tables:
  - RDOperation
parameters:
  - name: HostPoolName
    required: true
    description: 主机池名称
  - name: UserName
    required: false
    description: 用户名（用于注册查询）
---

# MSIX App Attach 查询

## 用途

诊断 MSIX App Attach 的 Staging、Registration 和 Deregistration 操作。

## 查询 1: MSIX 操作概览

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {HostPoolName} | 是 | 主机池名称 |

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where TIMESTAMP >= ago(24h)
| where Name contains "msix" or Name contains "Msix" or Name contains "appattach"
| where HostPool == "{HostPoolName}"
| where Name contains "ProcessMsixPackage" 
    or Name contains "StageMsixPackages" 
    or Name == "RegisterMsixPackages" 
    or Name == "DeregisterMsixPackages"
| where Props !contains "\"NumExpectedPackages\":0"
| project TIMESTAMP, UserName, Name, ResType, ResSignature, ResDesc, Props
| order by TIMESTAMP desc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| Name | 操作名称 |
| ResType | 结果类型 (Success, Error) |
| ResDesc | 结果描述 |
| Props | 附加属性（包含包信息） |

---

## 查询 2: 按用户查询 MSIX 注册

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where HostPool == "{HostPoolName}"
| where Name == "RegisterMsixPackages" 
| where UserName contains "{UserName}"
| where TIMESTAMP >= ago(12h)
| project TIMESTAMP, UserName, ResType, ResDesc, Props, HostInstance
| order by TIMESTAMP desc
```

---

## 查询 3: MSIX Staging 失败

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where TIMESTAMP >= ago(24h)
| where HostPool == "{HostPoolName}"
| where Name contains "StageMsixPackages"
| where ResType != "Success"
| project TIMESTAMP, HostInstance, Name, ResType, ResSignature, ResDesc, Props
| order by TIMESTAMP desc
```

---

## 查询 4: MSIX 注册错误分析

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where TIMESTAMP >= ago(7d)
| where HostPool == "{HostPoolName}"
| where Name contains "Msix"
| where ResType != "Success"
| summarize Count = count() by Name, ResType, ResSignature
| order by Count desc
```

## MSIX App Attach 操作说明

| 操作 | 说明 |
|------|------|
| ProcessMsixPackage | 处理 MSIX 包 |
| StageMsixPackages | 暂存 MSIX 包（VM 启动时） |
| RegisterMsixPackages | 注册 MSIX 包（用户登录时） |
| DeregisterMsixPackages | 注销 MSIX 包（用户注销时） |

## 关联查询

- [session-host.md](./session-host.md) - Session Host 日志
- [health-check.md](./health-check.md) - 健康检查状态
