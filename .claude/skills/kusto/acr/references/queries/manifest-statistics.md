---
name: manifest-statistics
description: ACR Manifest 统计查询
tables:
  - WorkerServiceActivity
parameters:
  - name: registry
    required: true
    description: ACR 登录服务器名称（不含 .azurecr.cn）
---

# Manifest 统计查询

## 用途

统计 ACR 注册表中的 Manifest 数量、列出 Tags、分析镜像分布等。

## 查询 1: Manifest 数量统计

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {registry} | 是 | 注册表名称（不含 .azurecr.cn） |

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity
| where env_time > ago(7d)
| where OperationName == "ACR.Layer: ExecuteOperationOnListManifestsAsync"
| where RegistryLoginUri == "{registry}.azurecr.cn"
| extend numManifests = toint(substring(Message, 52, strlen(Message) - 11 - 52))
| summarize numManifests = sum(numManifests) by bin(env_time, 1d), RegistryId, 
         RegistryLoginUri, ImageType
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| numManifests | Manifest 数量 |
| ImageType | 镜像类型 |

---

## 查询 2: 列出 Tags

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity 
| where env_time > ago(2d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| extend Count = 1
| distinct Repository, Tag, Digest, Count
```

---

## 查询 3: 按仓库统计

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity
| where env_time > ago(7d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where isnotempty(Repository)
| summarize 
    TagCount = dcount(Tag),
    DigestCount = dcount(Digest),
    TotalSize = sum(BlobSize),
    LastActivity = max(env_time)
  by Repository
| order by TagCount desc
```

---

## 查询 4: 镜像类型分布

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity
| where env_time > ago(7d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where isnotempty(ImageType)
| summarize Count = count(), TotalSize = sum(BlobSize) by ImageType, MediaType
| order by Count desc
```

---

## 查询 5: 最近活动的仓库

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity
| where env_time > ago(1d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where isnotempty(Repository)
| summarize 
    ActivityCount = count(),
    LastActivity = max(env_time),
    Operations = make_set(OperationName, 5)
  by Repository
| order by LastActivity desc
| take 50
```

---

## 查询 6: 存储使用分析

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').WorkerServiceActivity
| where env_time > ago(7d)
| where RegistryLoginUri == "{registry}.azurecr.cn"
| where isnotempty(BlobSize) and BlobSize > 0
| summarize 
    TotalSizeGB = round(sum(BlobSize) / 1024 / 1024 / 1024, 2),
    UniqueBlobs = dcount(Digest),
    RepositoryCount = dcount(Repository)
  by bin(env_time, 1d)
| order by env_time desc
```

## 关联查询

- [registry-info.md](./registry-info.md) - 注册表信息
- [rp-activity.md](./rp-activity.md) - RP 活动日志
