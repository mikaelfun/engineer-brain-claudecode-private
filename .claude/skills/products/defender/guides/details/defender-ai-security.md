# DEFENDER AI 安全 (Defender for AI) — Comprehensive Troubleshooting Guide

**Entries**: 1 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-b-tsg-ai-model-security-common-queries.md, ado-wiki-b-tsg-azure-foundry-agents-posture.md, ado-wiki-b-tsg-scc-ai-inventory-ui.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Defender For Ai
> Sources: ado-wiki

**1. Defender for AI 威胁防护告警中的 prompt 证据在 Azure portal 或 XDR 中显示为 ***（星号）**

- **Root Cause**: 客户已注册但未在 portal 中审批开启 prompt evidence 功能（该功能需要显式 opt-in 审批）
- **Solution**: 联系 defender4aipreview@microsoft.com 申请开启 prompt evidence 审批
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Defender for AI 威胁防护告警中的 prompt 证据在 Azure portal 或 XDR 中显示为 ***（星号） | 客户已注册但未在 portal 中审批开启 prompt evidence 功能（该功能需要显式 opt-in 审批） | 联系 defender4aipreview@microsoft.com 申请开启 prompt evidence 审批 | 🟢 8.5 | ADO Wiki |
