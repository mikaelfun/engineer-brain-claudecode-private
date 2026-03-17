# References 格式定义

本目录包含 Purview/RMS Kusto 查询的参考资源，包括集群信息、查询模板和表定义。

## 目录结构

```
references/
├── kusto_clusters.csv      # 集群连接信息
├── queries/                # KQL 查询模板
│   ├── README.md           # 查询格式定义
│   └── *.md                # 各查询模板
└── tables/                 # 表结构定义
    ├── README.md           # 表格式定义
    └── *.md                # 各表定义
```

## kusto_clusters.csv 格式

CSV 文件格式如下：

```csv
cluster_name,cluster_uri,database,description,environment
Azure RMS MC,https://azrmsmc.kusto.chinacloudapi.cn,azrms,Azure RMS/MIP 请求日志,Mooncake
ESTS MC,https://estscnn2.chinanorth2.kusto.chinacloudapi.cn,ESTS,Azure AD 登录日志 (含 RMS 认证),Mooncake
```

### 字段说明

| 字段 | 说明 | 示例 |
|------|------|------|
| cluster_name | 集群显示名称 | Azure RMS MC |
| cluster_uri | 集群 URI | https://azrmsmc.kusto.chinacloudapi.cn |
| database | 数据库名称 | azrms |
| description | 集群用途描述 | Azure RMS/MIP 请求日志 |
| environment | 环境 (Mooncake/Public) | Mooncake |

## 使用方式

1. **查找集群**: 根据服务类型在 `kusto_clusters.csv` 中查找对应集群
2. **选择表**: 在 `tables/` 目录中查找相关表定义
3. **选择查询**: 在 `queries/` 目录中查找预定义查询模板
4. **执行查询**: 使用 `fabric-rti-mcp` 的 `kusto_query` 工具执行
