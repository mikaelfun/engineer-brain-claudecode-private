# AVD AVD Teams 多媒体 - multimedia-redirection - Quick Reference

**Entries**: 3 | **21V**: partial
**Keywords**: camera-redirection, heap-memory, memory-leak, mmr, multimedia-redirection, rdpcorecdv, salesforce, termservice
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | High utilization of heap memory by Terminal Services Service Host Process (TermS... | Potential memory leak in RdpCoreCDV related to camera redirection and multimedia... | Have customers turn off camera redirection and multimedia redirection to see if ... | 🔵 7.0 | ADO Wiki |
| 2 | MMR extension shows not loaded in first browser tab | Known initialization issue in first tab | Open a second browser tab | 🔵 7.0 | MS Learn |
| 3 | VoIP call not being redirected through Multimedia Redirection (MMR) even though ... | The actual calling URL (e.g. my.connect.aws used by Salesforce) was not register... | 1. Install latest MMR from https://aka.ms/avdmmr/msi. 2. Use MMR extension Advan... | 🔵 6.0 | ADO Wiki |

## Quick Triage Path

1. Check: Potential memory leak in RdpCoreCDV related to cam `[Source: ADO Wiki]`
2. Check: Known initialization issue in first tab `[Source: MS Learn]`
3. Check: The actual calling URL (e.g. my.connect.aws used b `[Source: ADO Wiki]`
