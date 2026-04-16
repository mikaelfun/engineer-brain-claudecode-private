# Disk Data Box Disk: Data Copy & Import — 排查工作流

**来源草稿**: ado-wiki-data-box-disk-faqs.md, ado-wiki-data-box-disk-internal-error-portal.md, ado-wiki-databox-disk-upload-to-container.md, ado-wiki-write-protected-error-data-box-disk.md, onenote-databox-disk-data-preparation.md, onenote-databox-disk-process-flow.md
**Kusto 引用**: 无
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: Data Box Disk 写保护错误
> 来源: ado-wiki-write-protected-error-data-box-disk.md | 适用: Mooncake ✅ / Global ✅

### 症状
解锁后出现: "ERROR: The media is write protected. Exiting…"

### 排查步骤

1. 确认已使用 `DataBoxDiskUnlock.exe` 正确解锁
2. 尝试拖放文件（排除应用特定问题）
3. 在不同设备上测试（排除主机策略）
4. 连接其他 USB 磁盘测试读写
5. 确认使用管理员账户
6. 右键 → 属性 → 检查/启用写入权限
7. 尝试获取文件夹所有权
8. 禁用杀毒软件
9. **Diskpart 清除只读属性**:
   ```cmd
   diskpart
   list disk
   select disk N
   attributes disk clear readonly
   ```
10. 以上均无效 → 创建 ICM 给 Data Box Data Path 团队

---

## Scenario 2: Data Box Disk 数据准备与复制流程
> 来源: onenote-databox-disk-data-preparation.md | 适用: Mooncake ✅ / Global ✅

### 标准流程

1. **开箱连接** — 验证 1-5 SSDs + USB 线缆
2. **解锁磁盘**
   - Windows: 下载 `https://aka.ms/databoxdisktoolswin` → 管理员运行 `DataBoxDiskUnlock.exe` + passkey
   - **⚠️ 重启后必须重新解锁**，不能通过标准 BitLocker 提示输入
3. **按结构复制数据**

   | 目标类型 | 复制到 | 规则 |
   |---------|--------|------|
   | Block Blobs | `BlockBlob/<container-name>/` | 子文件夹 = 容器名 |
   | Page Blobs | `PageBlob/<container-name>/` | 子文件夹 = 容器名 |
   | Azure Files | `AzureFile/<share-name>/` | 子文件夹 = 文件共享名 |

   **⚠️ 直接复制到 BlockBlob/PageBlob 根目录 → 上传到 $root 容器**
   **⚠️ 直接复制到 AzureFile 根目录 → 失败并上传为 block blobs**

4. **运行验证工具**
   - 执行 `DataBoxDiskValidation.cmd`
   - Option 2（含 checksum）推荐但耗时
   - 每次运行间须先 Reset (Option 3)

---

## Scenario 3: Portal 显示 Internal Error
> 来源: ado-wiki-data-box-disk-internal-error-portal.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. 进入 ASC → Resource Explorer → Data Transfer Status 检查复制状态
2. 检查 Active ICM tab 是否已有 ICM
3. 有 ICM → 检查状态和调查详情，通知客户
4. 无 ICM → 创建 ICM 给 Data Box Data Path Engineering Team
5. 根据 ICM 更新持续通知客户

---

## Scenario 4: 数据上传到指定容器
> 来源: ado-wiki-databox-disk-upload-to-container.md | 适用: Mooncake ✅ / Global ✅

### 关键规则
- 下单时只指定 Resource Group 和 Storage Account
- 容器结构由复制时的文件夹命名决定
- 文件夹命名 = 目标容器名：`BlockBlob/<container-name>/<folder-structure>`
- 使用现有容器：子文件夹与现有容器同名即可

---

## Scenario 5: Data Box Disk 完整生命周期 (Mooncake)
> 来源: onenote-databox-disk-process-flow.md | 适用: Mooncake ✅

### MS-Managed Shipping 时间线

| 阶段 | Portal 状态 | 典型耗时 |
|------|------------|----------|
| 创建订单 | Ordered | 分钟 |
| 准备磁盘 | Processed | ≤5 工作日 |
| 发货 | Processed/Delivered | 2-3 工作日 |
| 客户准备数据 | Delivered | 客户决定 |
| 退回磁盘 | Picked up | 2-3 工作日 |
| DC 数据复制 | Data Copy in Progress | <1 工作日 |
| 完成 | Completed/CompletedWithErrors | <1 工作日 |

### 关键注意事项
- **Mooncake 默认邮箱无法接收通知** — 客户须添加有效外部邮箱
- **数据复制完成后磁盘立即进入擦除阶段** — 如需排查须立即联系
- 自管理配送需客户邮件联系运营团队安排取件