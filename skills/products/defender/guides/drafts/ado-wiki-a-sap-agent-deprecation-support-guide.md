---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Third Party Connectors/SAP/SAP agentless/Agent Deprecation"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Data%20Ingestion%20-%20Connectors/Third%20Party%20Connectors/SAP/SAP%20agentless/Agent%20Deprecation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# SAP Agent-Based Connector Deprecation - Support Guide

**Last Updated**: 03/02/2026
**Audience**: CSS Technical Support

---

## What's Changing?

Microsoft is **deprecating the containerized (agent-based) SAP data connector** for Microsoft Sentinel.

- **End of Support Date**: September 16, 2026 (Log Analytics V1 end of life)
- **New Deployments**: Only agentless connector available after October 31, 2025
- **Reason**: SAP RFC SDK discontinuation + customer demand for simpler integration

---

## Timeline

| Date | Event |
|------|-------|
| **October 31, 2025** | New deployments restricted to agentless connector only |
| **September 16, 2026** | End of support for agent-based connector (Log Analytics V1 end of life) |

---

## Why Agentless?

| Feature | Agent-Based | Agentless |
|---------|-------------|-----------|
| **Infrastructure** | Requires Docker/VM | No infrastructure needed |
| **Integration** | Custom agent | Native SAP Integration Suite |
| **Time to First Log** | Days | Hours |
| **Deployment Complexity** | High | Simplified |
| **Maintenance** | Manual updates, container management | Managed by SAP BTP |

**Key Benefits:**

- Native SAP integration using SAP Cloud Connector and Integration Suite (already present in most SAP landscapes)
- Future-proof architecture aligned with SAP and Microsoft security roadmaps
- Same pricing as agent-based connector (no cost impact)

---

## Customer Impact

### New Customers (Post October 31, 2025)

- **Only agentless option available** for new deployments
- Must meet agentless prerequisites (SAP Cloud Connector, Integration Suite)

### Existing Customers (Agent-Based)

- **Agent will continue to function until September 16, 2026**
- Migration required before end-of-support date
- Feature parity: Most impactful detections available in agentless; others covered via Sentinel for SAP community extensions

---

## Support Guidance

### When Customer Asks: "Should I use agent or agentless?"

**For NEW deployments**:
- **Recommend agentless** (agent option removed after Oct 31, 2025)
- Direct to: [Agentless deployment guide](https://learn.microsoft.com/en-us/azure/sentinel/sap/deploy-data-connector-agent-container?pivots=connection-agentless)

**For EXISTING agent-based deployments**:
- Customer can continue using agent until September 16, 2026
- **Strongly recommend planning migration** to agentless before end-of-support
- Migration typically takes hours, not days

### When Customer Asks: "What happens after September 16, 2026?"

- Agent-based connector will no longer be supported (Log Analytics V1 end of life)
- No bug fixes or security updates
- Customers must migrate to agentless to maintain support
- Migration guide available on Microsoft Learn

### When Customer Asks: "Will migration cost more?"

- **No cost impact** - agentless connector priced the same as agent-based
- Both use per-production-SID pricing model

---

**Full Migration Guide**: [Microsoft Learn - Migration Documentation](https://learn.microsoft.com/en-us/azure/sentinel/sap/deployment-overview?tabs=agentless)

---

## Key Support Scenarios

### Scenario 1: Customer wants to deploy new agent-based connector

- **Response**: Agent-based connector is deprecated. New deployments (after Oct 31, 2025) only support agentless option.
- **Action**: Guide customer to agentless deployment
- **Link**: [Agentless TSG](template.md)

### Scenario 2: Customer has issues with existing agent

- **Response**: Provide standard agent troubleshooting through September 16, 2026
- **Proactive Recommendation**: Plan migration to agentless before end-of-support
- **Action**: Troubleshoot immediate issue, then discuss migration timeline

### Scenario 3: Customer concerned about feature gaps in agentless

- **Response**: Most impactful built-in detections supported in agentless
- **Additional Coverage**: Other detections available through Sentinel for SAP community extensions
- **Action**: Review customer's specific detection requirements; engage PG if needed

### Scenario 4: Customer asks about SAP RFC SDK discontinuation

- **Response**: SAP is discontinuing RFC SDK, which is the underlying technology for agent-based connector. Agentless uses SAP Integration Suite, which is SAP's strategic platform.
- **Action**: Emphasize this is alignment with SAP's roadmap, not just Microsoft decision

---

## Important Notes for Support Engineers

- **Do NOT recommend agent-based deployment** for new customers
- **Always recommend agentless** whenever possible
- **Key Date**: September 16, 2026 - absolute end of agent support (Log Analytics V1 end of life)
- **No cost difference** between agent and agentless
- **Migration is straightforward** - typically hours, not days

---

## Escalation Path

For complex migration scenarios or customer concerns:
- **Service Tree**: Connectors Acceleration / Triage (for agentless)
- **Service Tree**: Microsoft Sentinel BizApps / Triage (for legacy agent issues)

---

## Resources

- [Agentless Deployment Guide](https://learn.microsoft.com/en-us/azure/sentinel/sap/deploy-data-connector-agent-container?pivots=connection-agentless)
- [Migration Guide](https://learn.microsoft.com/en-us/azure/sentinel/sap/deployment-overview?tabs=agentless)
- [Prerequisites](https://learn.microsoft.com/en-us/azure/sentinel/sap/prerequisites-for-deploying-sap-continuous-threat-monitoring)
- [Agentless Troubleshooting TSG](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel/10639/-TSG-SAP-Agentless)
- [E2E Agentless Tutorial (YouTube)](https://www.youtube.com/watch?v=PbO1S1E29Yk)

---

**Contributor**: Will King
**Date**: 03/02/2026
