---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Azure Copilot Enabling BootDiagnostics_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FAzure%20Copilot%20Enabling%20BootDiagnostics_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Copilot Enabling Boot Diagnostics

## Overview

Azure Copilot is embedded in the Boot Diagnostics blade to provide AI-powered insights for VM boot issues. It intercepts customers facing boot problems and provides accurate analysis through screenshot and serial log parsing.

## Integration Point

- Copilot nudge embedded on Boot Diagnostics blade (dynamically shown based on screenshot or serial log tab)
- Users can also ask sample Screenshot and serial log related questions from any blade or through the global copilot entry button

## Backend Plugins

- **ComputeScreenshotAnalyzerPlugin** - For image-based analysis; responses grounded on rule engine with proper mitigation steps
- **ComputeSerialLogAnalyzerPlugin** - For log parsing and insight generation based on serial log rule engine

## Scenarios

### Scenario 1: Screenshot Analysis (Windows & Linux)

User opens Boot Diagnostics -> clicks Copilot nudge "Analyze with Copilot" or asks via global copilot entry point.

Sample questions:
- "What is wrong with my VM's boot screen?"
- "Why is my VM not booting?"
- "Can you help analyze my screenshot and suggest actions to address the issue?"
- "Why is my Linux VM not booting up properly?"

### Scenario 2: Linux VM Serial Log Analysis (Linux Only)

Sample questions:
- "What are the issues identified in my serial log?"
- "Suggest steps to resolve this out-of-memory error I see in the log."
- "Help me analyze my serial log"

## Troubleshooting

Start with the [Copilot Basic Workflow](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1244975).

If the issue is with the Boot Diagnostics handler, file an ICM:

- **Handler ID:** microsoft_azure_computehub__helpmechoosecomputehandlerterminal
- **ICM Template:** [Create ICM](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=82J3F2)
- **ICM Owning Service:** AzureRT

Include: Agent Name, Steps to reproduce, Session ID, Screenshots, Browser HAR trace.

## Dependencies

- AITS Plugins (ComputeScreenshotAnalyzerPlugin, ComputeSerialLogAnalyzerPlugin)
- Azure Portal Integration (Compute extension team)
- Data Access via OBO token flow using HelpRP
- CRP Service team approval for BootDiagnostic API

## Contacts

- **SME:** Alberto Balderas Platas (albald@microsoft.com)
- **Feature PM:** Bila Akpan (Samwimbila.Akpan@microsoft.com)
- **Beta:** Johnny Coleman (johnnyc@microsoft.com)
