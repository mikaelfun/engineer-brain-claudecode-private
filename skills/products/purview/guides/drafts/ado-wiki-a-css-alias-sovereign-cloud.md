---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Training/Sovereign Cloud TSG/CSS alias for Sovereign Cloud"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTraining%2FSovereign%20Cloud%20TSG%2FCSS%20alias%20for%20Sovereign%20Cloud"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Microsoft domain can't be accessed in Sovereign clouds (Fairfax & Mooncake). Everyone has to use JIT & escort sessions.

## Team level Access

| Team | Security Groups | Require SAW | Require AME | Require CME/USME | JIT & Escort session | Kusto Access | Geneva | Subscription access |
|--|--|--|--|--|--|--|--|--|
| Engineering | AME\TM-Babylon | **Yes** | **Yes** | Optional | **Yes** | JIT & Escort | JIT & Escort | JIT & Escort |
| CSS | AME\TM-Babylon-CSS [Yet to create] | **Yes** | **Yes** | Optional | **Yes** | JIT & escort | JIT & Escort | No |
