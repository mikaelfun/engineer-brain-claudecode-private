# Disk Data Box POD: Connectivity & Access — 排查工作流

**来源草稿**: ado-wiki-a-Unable-to-Access-DataBox-Local-WebUI.md, ado-wiki-connecting-support-session-data-box.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: 无法访问 Data Box Local WebUI
> 来源: ado-wiki-a-Unable-to-Access-DataBox-Local-WebUI.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **检查硬件**
   - 确认设备正确接线
   - 检查背面 System Fault LED 未亮起

2. **检查网络连通性**
   - 从同网络计算机 ping MGMT IP: `ping 192.168.100.5`
   - ping 不通 → ping 同网络其他服务器确认是否隔离问题

3. **ping 通但无法访问 WebUI**
   - 确认使用 HTTPS + IP 地址（非主机名）：`https://192.168.100.10`
   - 检查 Data Box IP 是否与网络中其他设备冲突

4. **直连排查**
   - 使用交叉线连接 MGMT 端口
   - 配置笔记本网卡: 静态 IP `192.168.100.5`，子网 `255.255.255.0`
   - 访问 `https://192.168.100.10`

5. **以上均无效 → 冷重启 → 仍失败 → 硬件问题，需创建新订单**

---

## Scenario 2: 连接 Data Box Support Session
> 来源: ado-wiki-connecting-support-session-data-box.md | 适用: Mooncake ✅ / Global ✅

### 第一步：确定 Data Box 版本

```kusto
cluster('ssemprod.kusto.windows.net').database('DataboxService').DeviceTelemetry
| where SerialNumber == "<serial>" and JobName == "<jobname>"
| where Data contains "DeviceFriendlySoftwareName"
| project PreciseTimeStamp, SerialNumber, Data
| take 5
```

### 版本分支

**Data Box 2.9 或更早**
```powershell
set-item wsman:\localhost\Client\TrustedHosts <IP>
$Pwd = ConvertTo-SecureString <password> -AsPlainText -Force
$Cred = New-Object System.Management.Automation.PSCredential("~\PodSupportAdmin", $Pwd)
$podPs = new-PSSession -Computer <IP> -ConfigurationName Minishell -Credential $Cred
Invoke-Command -Session $podPs -ScriptBlock {Enable-HcsSupportAccess}
Invoke-Command -Session $podPs -ScriptBlock {Get-HcsSupportAccessKey}
```

**Data Box 3.0 ~ 4.0** — 账户改为 `~\StorSimpleAdmin`，其余类似

**Data Box 4.1+** — 需要 UseSSL + 证书/SkipCACheck：
```powershell
$sessOptions = New-PSSessionOption -SkipCACheck -SkipCNCheck -SkipRevocationCheck
$podPs = new-PSSession -Computer <IP> -ConfigurationName Minishell -Credential $Cred -UseSSL -SessionOption $sessOptions
```

### 通用后续步骤
1. 解密密码: https://hcssupport/
2. 使用解密密码以 `StorSimpleSupport` 账户进入 SupportSession