---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Components/Architecture/Features/Observability"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Components/Architecture/Features/Observability"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Getting access + overview: [Accessing Kusto & DGREP | ArcA Observability](https://eng.ms/docs/cloud-ai-platform/azure-edge-platform-aep/aep-edge/azure-stack-hub/arc-autonomous/arca-observability/resources/kustodgrep/accessingkustodgrep)

Only request access to the read-only groups in CoreIdentity mentioned in the doc.

- ARCA-PPE-ReadOnly
- ARCA-PROD-ReadOnly

There are Kusto endpoints and DGREP endpoints listed in the above doc. I haven't had to use DGREP yet, so if you know about it, you can leave some more detail here. :)

There is a Grafana dashboard the PG covered in a [knowledge-sharing session](https://microsoft.sharepoint.com/:v:/r/teams/ASZ886/Shared%20Documents/Arc%20Autonomous/CSS%20Readiness/PP2%20Knowledge%20Share%20Recordings/Winfield%20Supportability%20-%20working%20sessions-20240606_163351-Meeting%20Recording.mp4?csf=1&web=1&e=ybaMCQ&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D). There was some confusion around how to get access that never was answered.

Grafana dashboard: [Project Winfield - Dashboards - Grafana](https://grafana-projectwinfield-huatdvg8gmb0hqen.eus.grafana.azure.com/dashboards/f/e0b43ca8-e86a-4760-b3f6-67848350a287/project-winfield)
