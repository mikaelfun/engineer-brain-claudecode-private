---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Processes/Escalation/IcM/ICM Quality: Step by Step Flow"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FProcesses%2FEscalation%2FIcM%2FICM%20Quality%3A%20Step%20by%20Step%20Flow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ICM Quality: Step by Step Flow

## Escalation Flow
1. Collect logs from customer → follow public docs → try Q&A Bot → discuss with TA/SEE
2. If unresolved → create AVA thread with detailed issue description and troubleshooting steps
3. Involve SMEs → if SME acknowledges → SME works on issue; if not → tag regional SME → escalate to PG/EEE
4. Post-investigation → if unresolved → discuss in Triage → open CRI in correct queue

## Guidance for Quality
- CRI must include latest status and valid logs (refer to Logs Required for Escalation TSG)
- Try to repro in lab before escalating
- Every CRI/AVA should attach ONE issue only
- AVA requests needing PG attention get automatic notifications

## Common Quality Issues
- Logs missing or expired
- Directly copy-pasting customer questions → paraphrase into technical questions
- Network issues in customer environment → address by CSS SMEs, discuss in triage
- Flag RCA only when actually needed

## FAQ
- **PG mitigates ICM when**: fix applied, ICM idle 2+ days, by-design confirmed, workaround provided, work item created
- **Multiple ICMs for same ticket**: only for complex issues needing multiple PG teams (check with EEE/PG first)
- **Tagging PG directly**: first use InvolvePG, then tag directly if no response
- **Case owner as SME raising AVA**: still recommended to check with another SME first
- **Weekend AVA with customer pressure**: indicate Priority/Criticality and Business Impact in Ava, tag PG SMEs (Sev3 has no weekend coverage)
- **Finding right team**: use Mapping for Purview Components TSG, check PG involvement in AVA, or ask EEE in Triage
- **Customer refuses new case for different issue**: open multiple IcMs for same case but one issue per ICM
- **Expected PG response time in AVA**: SLA is 48 hours, auto-notification after 24 hours idle

## SME & EEE Contacts by Region
| Region | AVA SMEs | EEEs |
|--------|----------|------|
| EMEA | carlossilva, yazanabusair, mlezanska | pemar, v-sahilgupta |
| AMER | tifische, tgrenell | vimals |
| APGC & India | yuzhang4 | rongli |
