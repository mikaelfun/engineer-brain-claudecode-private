# Disk Mooncake Operations — 详细速查

**条目数**: 1 | **类型**: 📊 速查（无融合素材）
**生成日期**: 2026-04-07

---

### 1. Geneva Action cannot be triggered in national clouds (Mooncake/Fairfax): operations require escort a

**分数**: 🟢 9 | **来源**: [MCVKB] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: National clouds have stricter security policy. Geneva Actions with combined PSA+PSO+PSV claims use the most restrictive one (PSA) to map access policy. PSA maps to ElevatedPrivileged which requires escort in Mooncake and approval in Fairfax. Mixing scope levels (Storage-PSA, Storage-PSO, Storage-PSV) on same operation is incorrect.

**方案**: Adjust Geneva Action claims: each operation should have ONE role within a scope (not PSA+PSO+PSV combined). Create a read-only base class for basic operations. For urgent needs, use escort access (Get Access button) in Mooncake. Remove unscoped PlatformServiceViewer in favor of scoped Storage-* roles. ICM ref: 426906186.

**标签**: Geneva-Action, RBAC, national-cloud, Mooncake, Fairfax, PSA, escort-access, security

---

