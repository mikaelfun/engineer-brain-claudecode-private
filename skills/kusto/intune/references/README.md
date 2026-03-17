# References 格式定义

本目录包含 Intune Kusto 查询的参考资源，包括集群信息、查询模板和表定义。

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
Intune China,https://intunecn.chinanorth2.kusto.chinacloudapi.cn,intune,设备管理、策略、应用日志,Mooncake
MSODS Mooncake,https://msodsmooncake.chinanorth2.kusto.chinacloudapi.cn,MSODS,MSODS 审计日志（许可证操作）,Mooncake
```

### 字段说明

| 字段 | 说明 | 示例 |
|------|------|------|
| cluster_name | 集群显示名称 | Intune China |
| cluster_uri | 集群 URI | https://intunecn.chinanorth2.kusto.chinacloudapi.cn |
| database | 数据库名称 | intune |
| description | 集群用途描述 | 设备管理、策略、应用日志 |
| environment | 环境 (Mooncake/Public) | Mooncake |

## 使用方式

1. **查找集群**: 根据服务类型在 `kusto_clusters.csv` 中查找对应集群
2. **选择表**: 在 `tables/` 目录中查找相关表定义
3. **选择查询**: 在 `queries/` 目录中查找预定义查询模板
4. **执行查询**: 使用 `fabric-rti-mcp` 的 `kusto_query` 工具执行
