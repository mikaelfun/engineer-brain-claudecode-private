# Intune Android MAM 与 App Protection — 排查速查

**来源数**: 1 | **21V**: 全部适用
**条目数**: 1 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Android LOB 应用集成 Intune MAM SDK 后 Gradle 构建失败 | SDK 版本与 IDE 构建工具、Android Gradle plugin 或 framework 版本不兼容；Gradle 包签名配置不正确；Azur... | 1. 检查 Azure App Registration 的 scope 和 permissions；2. 确认使用 Android Gradle plugin 3.0+ 和 Gradle 4.... | 🟢 8.5 | ADO Wiki |

## 快速排查路径
1. 1. 检查 Azure App Registration 的 scope 和 permissions；2. 确认使用 Android Gradle plugin 3.0+ 和 Gradle 4.1+；3. 尝试降低 SDK 库版本验证兼容性；4. 检查 ProGuard 规则是否包含 SDK 配置； `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/mam-android.md#排查流程)
