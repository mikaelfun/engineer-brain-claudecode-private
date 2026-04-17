# ACR DNS 与注册表创建 — 排查工作流

**来源草稿**: ado-wiki-acr-custom-domain.md
**Kusto 引用**: (无)
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: 自定义域名配置
> 来源: ado-wiki-acr-custom-domain.md | 适用: Mooncake ✅

### 注意事项
- 自定义域名功能**尚未完全支持**（通过 Nginx 反向代理实现）

### 前置条件
- 组织 DNS Zone
- SSL 证书
- ACR 实例作为后端

### 配置步骤

1. **上传 SSL 证书到 Key Vault**
2. **部署 Nginx Docker 容器到 Azure VM**
3. **配置 DNS CNAME 记录**（将自定义域名指向 VM 地址）
4. **验证**: docker login -u <username> -p <password> registry.contoso.com
