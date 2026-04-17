# ARM 部署错误码查找与诊断流程

> Source: https://learn.microsoft.com/azure/azure-resource-manager/troubleshooting/find-error-code

## 错误类型

| 类型 | 阶段 | 特征 |
|------|------|------|
| Validation errors | 部署前 | 语法错误，IDE 可检测 |
| Preflight validation errors | 命令执行时 | 参数值不合法，资源未部署 |
| Deployment errors | 部署过程中 | 需与 Azure 环境交互才能发现 |

## 验证命令

### CLI
```bash
az deployment group validate --resource-group {rg} --template-file {file}
```

### PowerShell
```powershell
Test-AzResourceGroupDeployment -ResourceGroupName {rg} -TemplateFile {file}
```

### 其他作用域验证

| Scope | CLI | PowerShell |
|-------|-----|------------|
| Subscription | `az deployment sub validate` | `Test-AzDeployment` |
| Management Group | `az deployment mg validate` | `Test-AzManagementGroupDeployment` |
| Tenant | `az deployment tenant validate` | `Test-AzTenantDeployment` |

## 查看部署错误

### Portal
1. Resource Group → Activity Log → 筛选失败操作
2. Resource Group → Settings → Deployments → Error details

### CLI
```bash
# 查看部署操作
az deployment operation group list --name {deployment} --resource-group {rg} --query "[*].properties"

# 查看部署结果
az deployment group show --resource-group {rg} --name {deployment}
```

### PowerShell
```powershell
Get-AzResourceGroupDeploymentOperation -DeploymentName {deployment} -ResourceGroupName {rg}
Get-AzResourceGroupDeployment -DeploymentName {deployment} -ResourceGroupName {rg}
```

## Bicep 语法检查
```bash
bicep build main.bicep
```
输出包含行号、列号和错误消息，如：
```
/main.bicep(22,51) : Error BCP064: Found unexpected tokens in interpolated expression.
```

## IDE 支持
- VS Code + Bicep Extension（`.bicep` 文件）
- VS Code + ARM Tools Extension（`.json` 模板）
