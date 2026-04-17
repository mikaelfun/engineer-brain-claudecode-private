# Purview/RMS Kusto 查询模板

本目录包含 Azure Purview、Azure RMS (Azure Information Protection) 相关的预定义查询模板。

## 查询索引

| 查询 | 用途 | 文档 |
|------|------|------|
| mip-request-analysis.md | MIP 请求日志分析 | [📄](./mip-request-analysis.md) |
| rms-auth-tracking.md | RMS 认证追踪 | [📄](./rms-auth-tracking.md) |
| dlp-jarvis-urls.md | DLP Jarvis 查询 URL | [📄](./dlp-jarvis-urls.md) |

## 使用说明

1. 替换查询中的占位符参数（如 `{tenantId}`, `{correlationId}`）
2. 根据实际时间范围调整 `{starttime}` 和 `{endtime}`
3. 可根据需要添加额外筛选条件
