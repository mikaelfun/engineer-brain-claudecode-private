# Kusto Skill Evolution Log

> 知识库变更审计日志。每次 schema 修正、query 模板更新、新 query 捕获都记录在此。

| Date | Product | File | Change | Trigger | Case |
|------|---------|------|--------|---------|------|
| 2026-04-07 | vm | tables/azurecm/ServiceHealingTriggerEtwTable.md | FaultCode type: string→long; AffectedUpdateDomain type: string→long; Example queries: NodeId→SourceNodeId | SCHEMA_MISMATCH during troubleshooter run | TEST-VM-PERFORMANCE |
