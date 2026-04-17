---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Archive/Agents and Log Analytics/Azure Monitoring Agent (AMA)/[Product Knowledge]  MDC Pipeline using Azure Monitoring Agent (AMA)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Archive/Agents%20and%20Log%20Analytics/Azure%20Monitoring%20Agent%20(AMA)/%5BProduct%20Knowledge%5D%20%20MDC%20Pipeline%20using%20Azure%20Monitoring%20Agent%20(AMA)"
importDate: "2026-04-05"
type: troubleshooting-guide
note: "Archived content. Defender for Servers (AMA-based) retired in 21V August 2025."
---

# MDC Pipeline Architecture: MMA vs AMA

## MMA (Log Analytics Agent) Pipeline

The Log Analytics agent (MMA) provided a **single agent platform** responsible for all security data. The MDC pipeline using MMA was simple — one agent handled everything.

**(Retired August 2024)**

---

## AMA (Azure Monitor Agent) Pipeline

AMA works differently from MMA:

- **AMA** is responsible for **sending data** to the workspace.
- **ASA (Azure Security Agent)** is responsible for **collecting security-specific data**.
- If only AMA is installed without ASA, there will be **no security data to send**.

### Auto-Provisioning

Once Auto-Provisioning is enabled in MDC, the MDC pipeline **automatically installs both AMA and ASA**.

The pipeline components installed automatically:
1. **AMA** — Azure Monitor Agent (data transport)
2. **ASA** — Azure Security Agent (security data collection)
3. **DCR** — Data Collection Rule (routing configuration)

> Note: The AMA pipeline is more complex than MMA but all components are automatically provisioned by MDC when Auto-Provisioning is enabled.

---

## Key Distinction

| Agent | Role |
|-------|------|
| MMA (retired) | Single agent: collects + sends all data |
| AMA | Transport layer only — sends data to workspace |
| ASA | Collection layer — gathers security-specific data for AMA to send |
