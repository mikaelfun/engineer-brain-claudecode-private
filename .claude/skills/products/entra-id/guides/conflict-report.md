# Entra ID — 跨源矛盾检测报告

> 生成时间: 2026-04-18 | 模式: 增量 (48 新条目)

## 摘要

扫描 48 条新增条目（全部来自 contentidea-kb），跨 16 个 topic。

| 指标 | 数值 |
|------|------|
| 矛盾项 | 4 (全部 severity=low) |
| 近重复 | 2 对 |
| 严重矛盾 | 0 |

## 矛盾详情

### 1. ADFS Service Start Failure (adfs)
- **IDs**: entra-id-3676, entra-id-3684
- **类型**: rootCause 措辞差异
- **处理**: 合并为单条，保留 VM snapshot 场景补充

### 2. CloudSync Error (directory-sync)
- **IDs**: entra-id-3681, entra-id-3687
- **类型**: rootCause 措辞差异
- **处理**: 合并为单条

### 3. AD Attribute Update — Large userCertificate (ad-onprem)
- **IDs**: entra-id-3683, entra-id-3688
- **类型**: rootCause 措辞差异
- **处理**: 合并为单条

### 4. BitLocker Recovery Escrow for Hybrid AADJ (device-registration)
- **IDs**: entra-id-3666, entra-id-3667
- **类型**: 同一问题的两种表述（问句 vs 陈述句）
- **处理**: 合并为 FAQ 格式

## 近重复项

| Topic | IDs | 描述 |
|-------|-----|------|
| intune-integration | 3677, 3685 | MDM Terms of Use |
| wam-oneauth | 3680, 3686 | AAD Broker Plugin |

## 结论

无严重矛盾。所有冲突均为同源(contentidea-kb)近重复条目的措辞差异，在综合阶段合并处理。
