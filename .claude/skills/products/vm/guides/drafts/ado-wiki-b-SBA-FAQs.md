---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Skill Based Assignment (SBA)/SBA FAQs"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/Processes/Skill%20Based%20Assignment%20%28SBA%29/SBA%20FAQs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# SBA FAQs (Intelligent Assignment / Skill Based Routing)

## Q: How does SBA affect me as an engineer?

The way engineers receive cases in DfM remains the same. Logic changed June 12, 2024 to increase accuracy. Engineers focus more on troubleshooting based on their skills. Internal misroute rate today: ~4%; external: ~8%.

## Q: What are Skill Domain, Sub Domain, Skill Group, and Skill?

| Term | Definition |
|---|---|
| **Skill** | Granular unit of volume; organized into ML models reviewed by SBR team |
| **Skill Group** | Aggregates related granular skills; engineers decorated at Skill Group level qualify for all skills within |
| **Skill Sub Domain** | Aligns multiple skill groups to teams/business entities (e.g., Connectivity, Config, Management) |
| **Skill Domain** | Major product/service family (e.g., Azure VM, Networking, Identity) — aligns to PCG level |

## Q: What is a Skill Model?

ML dataset used to predict skills for incoming cases. VDM associates the SAP with a skill model; ML compares keywords with case title and customer verbatim to identify the best matching skill. Multiple skills predicted with confidence scores; highest confidence = **Top Skill**.

## Q: How to see the skill of a case/collab?

- **Option 1**: [Adding Skills Based Views](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1533662) (Case Buddy Alpha)
- **Option 2**: Regular CB version (needs VPN) — case only, not collab
- **Option 3**: [Viewing Case/Collab skill in CRM (VDM)](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1533665)

## Q: How to change the skill of a case/collab?

- **Within same Skill Group**: [Steps to change case skill on CRMGlobal](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1533664)
- **Outside current Skill Group**: Change the SAP of the case/collab → transfer back to queue → ML re-predicts skill

## Q: Will reopened old cases get a skill assigned?

**No.** By design, reopened cases sent to queue will NOT get a skill unless the SAP was changed before transfer to queue.
