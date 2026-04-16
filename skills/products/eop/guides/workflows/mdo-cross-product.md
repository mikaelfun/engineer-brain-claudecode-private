# EOP MDO 跨产品功能 (Teams/MDA/Graph) — 排查工作流

**来源草稿**: ado-wiki-a-mdo-protection-for-teams.md, ado-wiki-a-secops-best-practices.md, ado-wiki-a-graph-api-oauth-concepts.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: MDO Protection for Teams 配置验证
> 来源: ado-wiki-a-mdo-protection-for-teams.md | 适用: Mooncake ❌ (21V 无 Safe Links/Attachments for Teams)

### 配置检查清单
1. **Safe Attachments (SPO/ODB/Teams)**:
   - Defender portal > Safe Attachments > Global settings > Turn on for SharePoint, OneDrive, and Teams
2. **Safe Links for Teams**:
   - 确保 Teams integration On (自定义策略)
   - Teams 中 URL 不重写，保护是 time-of-click
3. **ZAP for Teams**:
   - Defender portal > Microsoft Teams protection > Toggle ZAP On
   - 设置 Quarantine policy
   - 审查 Exclusions
4. **Quarantine 管理**: 确认管理员可查看/释放/删除 Teams 消息和文件
5. **Unsafe link warnings**: Teams admin center > Message settings > Messaging safety > Toggle On
6. **User reported settings**: Defender portal > User reported settings > Microsoft Teams section

### License 要求
| 功能 | All Teams | MDO P1 | MDO P2 |
|------|-----------|--------|--------|
| Built-in virus protection | Yes | Yes | Yes |
| Safe Links (time-of-click) | | Yes | Yes |
| ZAP for Teams | | Yes | Yes |
| Advanced hunting on Teams | | | Yes |

---

## Scenario 2: Teams 消息 FP/FN 处理
> 来源: ado-wiki-a-mdo-protection-for-teams.md | 适用: Mooncake ❌

### 排查步骤
1. **File FP/FN**: 参考 SPO/ODB malware FP 处理流程 (aka.ms/spofp)
2. **URL FP/FN**:
   - 用户通过 "Report incorrect security detections" 和 "Report a security concern" 报告
   - 管理员通过 Defender portal 审查和提交
