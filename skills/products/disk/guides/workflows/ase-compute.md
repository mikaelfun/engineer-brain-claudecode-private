# Disk Azure Stack Edge: VM & Kubernetes — 排查工作流

**来源草稿**: [ado-wiki-a-identifying-ap5gc-cases-rerouting.md], [ado-wiki-ase-collect-vm-logs.md], [ado-wiki-ase-gpu-drivers-rhel.md], [ado-wiki-ase-k8s-admin-access.md], [ado-wiki-ase-k8s-memory-processor-limits.md], [ado-wiki-common-errors-kubernetes.md]
**Kusto 引用**: 无
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: AP5GC Case 识别与路由
> 来源: ado-wiki-a-identifying-ap5gc-cases-rerouting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 确认客户是否在 ASE 上运行 5G 工作负载 — 直接询问客户
2. 如果是 AP5GC/AKS 相关问题 → 路由到 Azure For Operators (A4O) Support Team
   - SAP: `Azure -> Azure Private 5G Core`
3. 原生 ASE Kubernetes (Microsoft-managed) → ASD 团队支持
4. AKS on ASE (custom deployment) → A4O 团队支持
   `[来源: ado-wiki-a-identifying-ap5gc-cases-rerouting.md]`

---

## Scenario 2: 收集 VM Guest 日志
> 来源: ado-wiki-ase-collect-vm-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 进入 ASE Support Session
2. 识别 VM: `get-vm | fl Name, Notes`
3. 导入日志收集模块
   ```powershell
   ipmo 'C:\Program Files\WindowsPowerShell\Modules\Microsoft.AzureStack.GuestLogCollectionTool\Microsoft.AzureStack.Common.Tools.GuestLogCollectionTool.PowershellModule.dll'
   ```
4. 创建日志目录: `mkdir C:\VmGuestLogs`
5. 设置变量并收集日志
   ```powershell
   $subscriptionid = Get-ArmSubscriptionId
   $clustername = hostname
   # Windows VM:
   Get-AzureStackGuestLogs -VmName <name> -ResourceGroupName <rg> -Subscriptionid $subscriptionid -Windows -ClusterName $clustername -OutputDirectory C:\VmGuestLogs -Verbose -SkipUncPathConversion -Force
   # Linux VM:
   Get-AzureStackGuestLogs -VmName <name> -ResourceGroupName <rg> -Subscriptionid $subscriptionid -Linux -ClusterName $clustername -OutputDirectory C:\VmGuestLogs -Verbose -SkipUncPathConversion -Force
   ```
   `[来源: ado-wiki-ase-collect-vm-logs.md]`

---

## Scenario 3: RHEL VM 手动安装 GPU 驱动
> 来源: ado-wiki-ase-gpu-drivers-rhel.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. SSH 登录 VM
2. 启用 RHEL repos → 安装 kernel 依赖 → 重启 VM
3. 下载 NVIDIA 驱动安装程序
4. 运行安装: `sudo sh NVIDIA-Linux-x86_64-$DRIVER_VERSION.run`
5. 验证: `nvidia-smi`
   `[来源: ado-wiki-ase-gpu-drivers-rhel.md]`

---

## Scenario 4: 获取 Kubernetes Admin 访问权限
> 来源: ado-wiki-ase-k8s-admin-access.md | 适用: Mooncake ✅ / Global ✅

### 前置条件
**重要**: 先与 Engineering (DBE Container Compute Team) 确认后再操作

### 排查步骤
1. 通过 PowerShell 连接 ASE CLI
   ```powershell
   winrm quickconfig
   $ip = "<device_ip>"
   Set-Item WSMan:\localhost\Client\TrustedHosts $ip -Concatenate -Force
   Enter-PSSession -ComputerName $ip -Credential $ip\EdgeUser -ConfigurationName Minishell
   ```
2. 运行 `Enable-HcsSupportAccess` 获取加密密钥
3. 使用 Support Password Decrypter 解密
4. 通过 File Explorer / PowerShell / CMD 获取 kubeconfig
   `[来源: ado-wiki-ase-k8s-admin-access.md]`

---

## Scenario 5: 修改 Kubernetes 内存/处理器限制
> 来源: ado-wiki-ase-k8s-memory-processor-limits.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 连接 PowerShell 接口
2. 检查当前值: `Get-AzureDataBoxEdgeRole`
3. 修改: `Set-AzureDataBoxEdgeRoleCompute -Name <Name> -MemoryInBytes <value> -ProcessorCount <count>`
4. 超过 60% 限制（最高 65%）: 需设置环境变量 `setx /M maxComputeRoleMemoryPercentage 65` 并重启
   - 默认内存: 25%, 默认处理器: 30%, 推荐范围: 15-60%
   `[来源: ado-wiki-ase-k8s-memory-processor-limits.md]`
