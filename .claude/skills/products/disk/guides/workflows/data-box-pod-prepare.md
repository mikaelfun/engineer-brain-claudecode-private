# Disk Data Box POD: Prepare to Ship — 排查工作流

**来源草稿**: ado-wiki-prepare-to-ship-phases.md, ado-wiki-change-shipping-address-data-box.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Prepare to Ship 卡住排查
> 来源: ado-wiki-prepare-to-ship-phases.md | 适用: Mooncake ✅ / Global ✅

### 各阶段进度与排查

| 阶段 | 进度 | 卡住 > 30min 处理方式 |
|------|------|---------------------|
| Device lock | 0%-1% | 取消重试 / 检查锁定状态 / 重启设备 |
| Checksum calculation | 2%-80% | 收集 support package → 联系 Datapath 团队 |
| Rules validation | 81%-85% | 收集 support package → 联系 Datapath 团队 |
| BOM publishing | 86%-90% | 收集 support package → 联系管理平台团队 |
| Packaging for BOM | 91%-95% | 收集 support package → 联系管理平台团队 |
| Producing Shipping Label | 95%-100% | 取消重试 / 检查锁定状态 / 重启设备 |

### Device Lock 阶段排查流程
```
卡在 0%-1%
├── 取消 prepare to ship → 重试
├── 取消 → 检查设备是否 locked → 解锁 → 重试
├── 取消 → 保持 locked → 重试
├── 重启设备 → 重试
└── 均无效 → 收集 support package → 联系管理平台团队
```

### Checksum 阶段
- 如持续不进展，可禁用 Checksum 选项继续 prepare to ship

---

## Scenario 2: 修改送货地址
> 来源: ado-wiki-change-shipping-address-data-box.md | 适用: Mooncake ✅ / Global ✅

### 步骤
1. 进入 Order details > Edit shipping address
2. 编辑并验证地址 → 保存

### 限制
- **仅在设备发出前可修改**
- 设备发出后需联系 Data Box Operations 团队