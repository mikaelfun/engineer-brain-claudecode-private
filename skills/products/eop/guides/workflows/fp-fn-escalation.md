# EOP FP/FN 调查与升级流程 — 排查工作流

**来源草稿**: ado-wiki-a-Troubleshooting-FP-FN.md, ado-wiki-a-Triage-FPFN-Diagnostics.md, onenote-fnfp-escalation-process.md, ado-wiki-a-fnfp-pcms-reviews.md, ado-wiki-b-emea-fp-fn-communication-template.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: 使用 FPFN 诊断工具排查
> 来源: ado-wiki-a-Triage-FPFN-Diagnostics.md | 适用: Mooncake ❌ (Assist 诊断不支持 21V)

### 排查步骤
1. 获取 Submission IDs
   - 方法1: 运行 "Review Submission Activity" 诊断获取
   - 方法2: 从客户处获取
2. 运行 "Defender for Office 365 Message Explorer" 诊断
   - 支持 Submission ID 或 Network Message ID (最多20个)
3. 审查关键字段:
   - **Submitted as**: 提交类型 (Junk/Phish/Not-junk)
   - **Final verdict before submission**: 提交前原始判定
   - **Rescan verdict after submission**: 重新扫描结果
   - **Triage status**: 是否经人工或系统审查
   - **Action needed**: 建议的下一步

### 决策: 是否需要升级
**不需要升级**:
- Rescan verdict 与提交原因一致 (filter 已自动修正)
- FP 是因 spoof/impersonation 判定而非内容
- FN 是因配置覆盖 (SCL=-1 等)
- 被识别为 newsletter (除非客户不同意 BCL 判定)

**需要升级**:
- 提交未到达后端
- 原始邮件不可用
- 尚未被 grading team 审查
- Grader 标记为 "false submission" (认为 filter 判定正确)
- 缺少 M365 headers 的无效提交

---

## Scenario 2: FPFN 升级流程
> 来源: onenote-fnfp-escalation-process.md | 适用: Mooncake ✅ (走 ICM 模板)

### 升级步骤
1. 检查 FN/FP tracking list 是否有重复模式
2. 通过 Assist 365 提交:
   | 路径 | 类型 | 严重级别 |
   |------|------|----------|
   | Exchange Online/Analysts (FPFN) | CFL/PSI/CRITSIT | Sev 2 IcM |
   | Exchange Online/Analysts (FPFN) | ISSUE | Sev 3 IcM |
3. 必须提供信息 (至少一项):
   - Network Message IDs (NMIDs)
   - Entity: Email sample / URL / File sample / Domain
   - Sonar Submission ID
4. 21V/Gallatin 走专用 ICM 模板:
   - `https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=a11R3e`
   - 选择 China/Gallatin Cloud Instance

### 严重性矩阵
| 场景 | 影响 | 升级级别 |
|------|------|----------|
| FP 标准 | 单个发件人被阻止 | Issue (Sev 3) |
| FP 重大/多租户 | 自有域全面被阻止 | PSI/CFL (Sev 2) |
| FN 标准 | 单条 spam 到达 Inbox | Issue (Sev 3) |
| FN 重大/多租户 | 大规模钓鱼未拦截 | PSI/CFL (Sev 2) |

---

## Scenario 3: PCMS Review 审查要点
> 来源: ado-wiki-a-fnfp-pcms-reviews.md | 适用: Mooncake ✅

### 审查清单
1. 确认 SAP 与 FNFP scope 对齐
2. 无升级的 FNFP Case:
   - [ ] 客户是否提供了必要信息 (SubmissionID/NMID/URLs)
   - [ ] Case Owner 是否运行了 FPFN 诊断
   - [ ] 诊断结果是配置问题还是需要升级
3. 有升级的 FNFP Case:
   - [ ] 检查 IcM 进展
   - [ ] Mitigated → 是否已告知客户
   - [ ] Still active → 推动进展
