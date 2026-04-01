---
name: generate-kb
displayName: 生成知识库KB
description: "Case 关闭时生成 Knowledge Base 文章"
category: inline
stability: beta
requiredInput: caseNumber
estimatedDuration: 60s
promptTemplate: |
  Case {caseNumber} is being closed. Read all case data from the case directory and generate a Knowledge Base article. Save to the case directory under kb/kb-article.md.
---

# Generate KB Article

Read all case data and generate a structured Knowledge Base article for future reference.

## Steps

1. Read all files in the case directory (context/, emails/, teams/, troubleshoot/)
2. Synthesize a KB article covering:
   - Problem description
   - Root cause analysis
   - Solution/workaround
   - Related resources
3. Save to `{caseDir}/kb/kb-article.md`
