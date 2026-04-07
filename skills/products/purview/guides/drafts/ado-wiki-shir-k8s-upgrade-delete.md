---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Scan/Self-Hosted IR in K8s/How to upgrade and delete SHIR in K8s"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FScan%2FSelf-Hosted%20IR%20in%20K8s%2FHow%20to%20upgrade%20and%20delete%20SHIR%20in%20K8s"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Upgrade and Delete SHIR in Kubernetes

## Upgrade SHIR

1. cd to IRCTL directory
2. Check version: `./irctl --version`
3. Upgrade: `./irctl --upgrade`
4. Upgrade takes 5-30 minutes

## Delete K8s SHIR

1. Run command: `./irctl delete`
2. This deregisters SHIR and deletes local resources
