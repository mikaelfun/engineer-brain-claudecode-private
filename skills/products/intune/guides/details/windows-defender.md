# Intune Defender for Endpoint 集成 — 综合排查指南

**条目数**: 4 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-Microsoft-Defender-for-Endpoint.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: A Microsoft Defender For Endpoint
> 来源: ADO Wiki — [ado-wiki-a-Microsoft-Defender-for-Endpoint.md](../drafts/ado-wiki-a-Microsoft-Defender-for-Endpoint.md)

**About Microsoft Defender for Endpoint**
- Android
- iOS/iPadOS
- Windows 10
- Windows 11

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Endpoint security feature (Application Guard, Firewall, SmartScreen, Encryption, Exploit Guard, A... | The security feature functionality is outside Intune scope. Intune only handl... | Verify Intune policy applied correctly via registry. If settings are correct but feature not work... | 🟢 8.5 | ADO Wiki |
| 2 | Customer has Defender licensing but MEM Portal / Endpoint Security blade is inaccessible — cannot... | Tenant is missing the Intune_Defender service plan which is required for Defe... | Investigate the tenant's products and entitlements — verify Intune_Defender service plan is provi... | 🔵 7.5 | ADO Wiki |
| 3 | MDE Attach tenant onboarding fails — tenant not found in MMPC, MDEAttachOnboardingState is neithe... | Failure in the onboarding flow from PartnerTenantService → MMPCSync → MMPC wh... | 1) Check MDEAttachEnabled and MDEAttachOnboardingState via GenevaAction JIT access 2) If MDEAttac... | 🔵 7.5 | ADO Wiki |
| 4 | Intune 中 Microsoft Defender for Endpoint（含 Tamper Protection）在 21V 无法集成 | 依赖 Microsoft Defender for Endpoint（MDE），MDE 不支持 21V | 不支持；不要在 21V 配置 MDE Connector；Tamper Protection 策略在 21V 无效 | 🔵 7.0 | 21V Gap |
