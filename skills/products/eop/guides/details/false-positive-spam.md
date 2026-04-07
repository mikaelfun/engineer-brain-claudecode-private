# EOP 合法邮件误判为垃圾邮件/钓鱼 (FP) - Comprehensive Troubleshooting Guide

**Entries**: 10 | **Draft sources**: 5 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Troubleshooting-FP-FN.md, ado-wiki-a-Triage-FPFN-Diagnostics.md, ado-wiki-b-Advanced-Spam-Filtering.md, ado-wiki-a-Safety-Tips.md, ado-wiki-a-fnfp-pcms-reviews.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: ASF features are legacy and
> Source: ado-wiki

**Symptom**: Advanced Spam Filter (ASF) features causing false positives, especially SPF Hard Fail
**Root Cause**: ASF features are legacy and cause FPs. SPF Hard Fail discouraged in favor of Spoof Intelligence.

1. Do NOT recommend ASF. Instead: proper SPF records with -all, DKIM for vanity domains, DMARC policy. Check X-CustomSpam header to identify triggered ASF rule. Disable problematic ASF options.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 2: EOP filtering engine misclassified the
> Source: ado-wiki

**Symptom**: Legitimate email incorrectly classified as High Confidence Phishing (HPHISH) and quarantined by Secure by Default (SBD)
**Root Cause**: EOP filtering engine misclassified the message as HPHISH; SBD always quarantines HPHISH regardless of admin overrides (allowed sender lists, Safe Senders, IP Allow Lists, ETRs)

1. 1) Run MDO Message Explorer diagnostic in Assist 365 to identify HPHISH classification reason. 2) Submit sample via Microsoft 365 Defender > Submissions > Allow messages like this to create temporary Tenant Allow/Block List entry. 3) Fix email authentication (SPF/DKIM/DMARC) if contributing to verdict.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 3: Security hardening change by Microsoft.
> Source: ado-wiki

**Symptom**: Email blocked or quarantined as malware by Common Attachment Filter detecting .COM file type, but the actual attachment is not a .COM file. A nested/attached message has a subject line ending in .COM.
**Root Cause**: Security hardening change by Microsoft. Defender for Office 365 applies stricter filetype evaluation to prevent bypass exploits. Subject lines ending in .COM in attached/nested messages now trigger...

1. This is by design. Review and release blocked items through existing quarantine workflows if appropriate. No customer remediation action required. Admin notifications will show the detected file type.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 4: Inbox rules (user custom filters)
> Source: ado-wiki

**Symptom**: Email delivered to Junk folder reported as FP, but X-Forefront-Antispam-Report shows SFV:NSPM and CAT:None (EOP did not classify as spam)
**Root Cause**: Inbox rules (user custom filters) moved the message to Junk. X-Microsoft-Antispam-Mailbox-Delivery shows ucf:1, dest:J, OFR:CustomRules.

1. Check X-Microsoft-Antispam-Mailbox-Delivery header for ucf:1/OFR:CustomRules. Not a true FP - advise customer to review inbox rules. No escalation to Analysts needed.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 5: EOP/MDO filtering engine incorrectly classifies
> Source: ado-wiki

**Symptom**: DocuSign emails are falsely flagged as malicious/phishing by Microsoft Defender for Office 365 (EOP/MDO), impacting multiple DocuSign clients receiving legitimate DocuSign emails
**Root Cause**: EOP/MDO filtering engine incorrectly classifies legitimate DocuSign emails as phishing or spam (false positive), potentially affecting multiple tenants simultaneously as a widespread FP event

1. 1. Follow standard FP/FN procedures
2. 2. If DocuSign provides samples, escalate to PG for investigation
3. 3. Engage TA/Manager to identify other DocuSign-related cases in queue
4. 4. If >2 cases with same issue, follow PSI procedures
5. 5. Keep DocuSign updated (no PII sharing across tickets)
6. 6. Do NOT lower severity if no samples available
7. 7. Severity lowering allowed only after 2 hours with no other cases identified or PG confirms mitigation

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 6: EOP URL scanning engine falsely
> Source: onenote

**Symptom**: Legitimate emails from China customers detected as malware due to URL scanning (e.g. cos.ap-beijing.myqcloud.com, inv-veri.chinatax.gov.cn, feishu.cn) - False Positive
**Root Cause**: EOP URL scanning engine falsely flagged China-specific URLs (Tencent Cloud COS, official gov.cn, Feishu) as malicious via Sonar heuristic/cluster/ML/TI blocks

1. File FP escalation via Assist 365 > Exchange Online Analysts (FPFN) with Network Message IDs
2. check Sonar AWB for existing tickets
3. reference ICM-528803532 for similar pattern
4. track in FN/FP pattern history for recurring pattern escalation

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8/10 - [OneNote]]`

### Phase 7: Sender domain incorrectly added to
> Source: onenote

**Symptom**: Legitimate emails blocked by domain blocklist (High confidence SPAM detection) - False Positive
**Root Cause**: Sender domain incorrectly added to EOP domain blocklist causing high confidence spam verdict

1. File FP escalation via Assist 365 > Exchange Online Analysts (FPFN)
2. provide NMIDs and domain details
3. check Sonar AWB for domain block status
4. reference ICM-528358493 for similar pattern

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8/10 - [OneNote]]`

### Phase 8: New Mail Bombing detection technology
> Source: ado-wiki

**Symptom**: Legitimate emails junked with spam verdict "detected as a Mail Bomb attack" (Mail Bombing detection false positive)
**Root Cause**: New Mail Bombing detection technology auto-tags subscription-type emails matching mail bombing patterns, catching legitimate subscriptions.

1. Use TABL Sender Allow for specific senders. To opt out entirely, escalate to Exchange Online/Analysts (FPFN) with diagnostic results.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 9: EOP anti-spam 过滤器误判，可能原因：1) SCL 评分过高;
> Source: mslearn

**Symptom**: 合法邮件被 EOP 错误标记为垃圾邮件（false positive），移至 Junk 文件夹或被隔离
**Root Cause**: EOP anti-spam 过滤器误判，可能原因：1) SCL 评分过高; 2) BCL 阈值设置过低; 3) 反钓鱼策略配置过严; 4) 组织配置问题（如 anti-spam policy 设置）

1. 1) 用户报告为 Not Junk，添加到 Safe Sender List
2. 2) 管理员从 Submissions 页面提交给 Microsoft 分析
3. 3) 在 Tenant Allow/Block List 创建临时允许条目
4. 4) 从隔离区释放邮件
5. 5) 根据提交结果调整组织配置

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 10: ASF 是 anti-spam policy 中的激进过滤设置，启用后会基于特定邮件属性（如
> Source: mslearn

**Symptom**: 启用 ASF (Advanced Spam Filter) 设置后，合法邮件被标记为 Spam 或 High confidence spam，出现意外的 X-CustomSpam header
**Root Cause**: ASF 是 anti-spam policy 中的激进过滤设置，启用后会基于特定邮件属性（如 HTML 中的 iframe/form/embed 标签、远程图片链接、数字 IP URL 等）增加 SCL 评分或直接标记为 spam。ASF 检测到的邮件无法作为 false positive 报告给 Microsoft

1. 1) 检查邮件 header 中的 X-CustomSpam 字段确认是哪个 ASF 设置触发
2. 2) 在 anti-spam policy 中将不需要的 ASF 设置关闭（Off）或设为 Test 模式
3. 3) ASF 在 Standard/Strict preset security policy 中默认不启用
4. 4) Test 模式可添加 X-header 或 BCC 用于评估影响

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Advanced Spam Filter (ASF) features causing false positiv... | ASF features are legacy and | -> Phase 1 |
| Legitimate email incorrectly classified as High Confidenc... | EOP filtering engine misclassified the | -> Phase 2 |
| Email blocked or quarantined as malware by Common Attachm... | Security hardening change by Microsoft. | -> Phase 3 |
| Email delivered to Junk folder reported as FP, but X-Fore... | Inbox rules (user custom filters) | -> Phase 4 |
| DocuSign emails are falsely flagged as malicious/phishing... | EOP/MDO filtering engine incorrectly classifies | -> Phase 5 |
| Legitimate emails from China customers detected as malwar... | EOP URL scanning engine falsely | -> Phase 6 |
| Legitimate emails blocked by domain blocklist (High confi... | Sender domain incorrectly added to | -> Phase 7 |
| Legitimate emails junked with spam verdict "detected as a... | New Mail Bombing detection technology | -> Phase 8 |
| 合法邮件被 EOP 错误标记为垃圾邮件（false positive），移至 Junk 文件夹或被隔离 | EOP anti-spam 过滤器误判，可能原因：1) SCL 评分过高; | -> Phase 9 |
| 启用 ASF (Advanced Spam Filter) 设置后，合法邮件被标记为 Spam 或 High co... | ASF 是 anti-spam policy 中的激进过滤设置，启用后会基于特定邮件属性（如 | -> Phase 10 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Advanced Spam Filter (ASF) features causing false positives, especially SPF H... | ASF features are legacy and cause FPs. SPF Hard Fail disc... | Do NOT recommend ASF. Instead: proper SPF records with -all, DKIM for vanity ... | 🟢 8.5 | [ADO Wiki] |
| 2 | Legitimate email incorrectly classified as High Confidence Phishing (HPHISH) ... | EOP filtering engine misclassified the message as HPHISH;... | 1) Run MDO Message Explorer diagnostic in Assist 365 to identify HPHISH class... | 🟢 8.5 | [ADO Wiki] |
| 3 | Email blocked or quarantined as malware by Common Attachment Filter detecting... | Security hardening change by Microsoft. Defender for Offi... | This is by design. Review and release blocked items through existing quaranti... | 🟢 8.5 | [ADO Wiki] |
| 4 | Email delivered to Junk folder reported as FP, but X-Forefront-Antispam-Repor... | Inbox rules (user custom filters) moved the message to Ju... | Check X-Microsoft-Antispam-Mailbox-Delivery header for ucf:1/OFR:CustomRules.... | 🟢 8.5 | [ADO Wiki] |
| 5 | DocuSign emails are falsely flagged as malicious/phishing by Microsoft Defend... | EOP/MDO filtering engine incorrectly classifies legitimat... | 1. Follow standard FP/FN procedures; 2. If DocuSign provides samples, escalat... | 🟢 8.5 | [ADO Wiki] |
| 6 | Legitimate emails from China customers detected as malware due to URL scannin... | EOP URL scanning engine falsely flagged China-specific UR... | File FP escalation via Assist 365 > Exchange Online Analysts (FPFN) with Netw... | 🟢 8 | [OneNote] |
| 7 | Legitimate emails blocked by domain blocklist (High confidence SPAM detection... | Sender domain incorrectly added to EOP domain blocklist c... | File FP escalation via Assist 365 > Exchange Online Analysts (FPFN); provide ... | 🟢 8 | [OneNote] |
| 8 | Legitimate emails junked with spam verdict "detected as a Mail Bomb attack" (... | New Mail Bombing detection technology auto-tags subscript... | Use TABL Sender Allow for specific senders. To opt out entirely, escalate to ... | 🔵 7.5 | [ADO Wiki] |
| 9 | 合法邮件被 EOP 错误标记为垃圾邮件（false positive），移至 Junk 文件夹或被隔离 | EOP anti-spam 过滤器误判，可能原因：1) SCL 评分过高; 2) BCL 阈值设置过低; 3) 反... | 1) 用户报告为 Not Junk，添加到 Safe Sender List; 2) 管理员从 Submissions 页面提交给 Microsoft 分... | 🔵 7.5 | [MS Learn] |
| 10 | 启用 ASF (Advanced Spam Filter) 设置后，合法邮件被标记为 Spam 或 High confidence spam，出现意外的 ... | ASF 是 anti-spam policy 中的激进过滤设置，启用后会基于特定邮件属性（如 HTML 中的 if... | 1) 检查邮件 header 中的 X-CustomSpam 字段确认是哪个 ASF 设置触发; 2) 在 anti-spam policy 中将不需要的... | 🔵 7.5 | [MS Learn] |
