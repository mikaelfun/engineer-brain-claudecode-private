# Disk Data Box POD: Ordering & Shipping — 排查工作流

**来源草稿**: ado-wiki-data-box-ordering-faqs.md, ado-wiki-data-box-refund-waiver.md, ado-wiki-erase-data-box-pod-cli.md, ado-wiki-xml-file-creation-export.md
**Kusto 引用**: 无
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: 订单常见问题
> 来源: ado-wiki-data-box-ordering-faqs.md | 适用: Mooncake ✅ / Global ✅

### 常见 FAQ

| 问题 | 回答 |
|------|------|
| 能否更改存储账户？ | 不能，须创建新订单并退回原设备 |
| 源国家不在列表中？ | Data Box 服务不可用 → 用支持国家分支下单或自管理配送 |
| 多久能收到？ | 库存可用则 10 天内发货，90 天未满足自动取消 |

### 预估时间线
- 下单: 分钟级
- 设备分配准备: 1-2 工作日
- 运输: 2-3 工作日
- 客户复制数据: 视数据量
- 退回运输: 2-3 工作日
- DC 处理: 1-2 工作日
- 上传数据: 视数据特征

---

## Scenario 2: 退款/费用减免申请
> 来源: ado-wiki-data-box-refund-waiver.md | 适用: Mooncake ✅ / Global ✅

### 重要原则
- **不要承诺**退款/credit/waiver
- 仅 PM leads 在审查后才能批准
- PM 只考虑 Data Box 服务费用和运输费
- Azure Storage 消费/网络/IO 费用由 Azure Storage 团队处理

### 申请流程

1. 收集信息:
   - Support Request #, Subscription ID, Job Name
   - Device Type, Customer Company Name
   - Issue Start & End Date, Claimed Refund Amount
   - ICM# (设备故障时)
2. 邮件发送至 **dbxorefundapprovals@microsoft.com**
3. CC **asdta@microsoft.com** 和 support 邮箱
4. 需要时创建与 Azure Billing 的协作任务

---

## Scenario 3: CLI 擦除数据（复制作业卡住时）
> 来源: ado-wiki-erase-data-box-pod-cli.md | 适用: Mooncake ✅ / Global ✅

### 场景
复制作业卡在 paused 状态，无法从 WebUI 恢复/取消/准备发货。

### 操作步骤

1. **进入 Mini Shell**
   ```powershell
   $Pwd = ConvertTo-SecureString <Customer_Password> -AsPlainText -Force
   $Cred = New-Object System.Management.Automation.PSCredential("~\StorSimpleAdmin", $Pwd)
   $sessOptions = New-PSSessionOption -SkipCACheck -SkipCNCheck -SkipRevocationCheck
   $ps = New-PSSession -Computer <databox_IP> -ConfigurationName Minishell -Credential $Cred -UseSSL -SessionOption $sessOptions
   Enter-PSSession $ps
   ```

2. **启用支持访问** → `Enable-HcsSupportAccess` → 解密密码 (https://hcssupport/)

3. **进入 Support Session** → 使用解密密码以 `StorSimpleSupport` 登录

4. **执行数据擦除**
   ```powershell
   $Pwd = ConvertTo-SecureString <Customer_Password> -AsPlainText -Force
   Start-PodReprovision -OOBEPassword $Pwd
   ```

---

## Scenario 4: Export 订单 XML 文件创建
> 来源: ado-wiki-xml-file-creation-export.md | 适用: Mooncake ✅ / Global ✅

### 关键要点
- XML 标签区分大小写
- 开闭标签必须匹配
- 格式不正确会导致导出失败
- 无效的 blob/file 前缀 → 不会导出任何数据
- 参考: [Tutorial to export data from Azure Data Box](https://learn.microsoft.com/en-us/azure/databox/data-box-deploy-export-ordered?tabs=sample-xml-file#create-xml-file)