# Intune Defender for Endpoint 集成 — 排查速查

**来源数**: 2 | **21V**: 部分适用
**条目数**: 4 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Endpoint security feature (Application Guard, Firewall, SmartScreen, Encryption, Exploit Guard, A... | The security feature functionality is outside Intune scope. Intune only handl... | Verify Intune policy applied correctly via registry. If settings are correct but feature not work... | 🟢 8.5 | ADO Wiki |
| 2 | Customer has Defender licensing but MEM Portal / Endpoint Security blade is inaccessible — cannot... | Tenant is missing the Intune_Defender service plan which is required for Defe... | Investigate the tenant's products and entitlements — verify Intune_Defender service plan is provi... | 🔵 7.5 | ADO Wiki |
| 3 | MDE Attach tenant onboarding fails — tenant not found in MMPC, MDEAttachOnboardingState is neithe... | Failure in the onboarding flow from PartnerTenantService → MMPCSync → MMPC wh... | 1) Check MDEAttachEnabled and MDEAttachOnboardingState via GenevaAction JIT access 2) If MDEAttac... | 🔵 7.5 | ADO Wiki |
| 4 | Intune 中 Microsoft Defender for Endpoint（含 Tamper Protection）在 21V 无法集成 | 依赖 Microsoft Defender for Endpoint（MDE），MDE 不支持 21V | 不支持；不要在 21V 配置 MDE Connector；Tamper Protection 策略在 21V 无效 | 🔵 7.0 | 21V Gap |

## 快速排查路径
1. Verify Intune policy applied correctly via registry. If settings are correct but feature not working, transfer case to: Application Guard→Windows UEX, `[来源: ADO Wiki]`
2. Investigate the tenant's products and entitlements — verify Intune_Defender service plan is provisioned. Once provisioned: 1) Intune polls tenant base `[来源: ADO Wiki]`
3. 1) Check MDEAttachEnabled and MDEAttachOnboardingState via GenevaAction JIT access 2) If MDEAttachEnabled=true but OnboardingState failed, patch MDEAt `[来源: ADO Wiki]`
4. 不支持；不要在 21V 配置 MDE Connector；Tamper Protection 策略在 21V 无效 `[来源: 21V Gap]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/windows-defender.md#排查流程)
