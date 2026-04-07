---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Defender for AI/[TSG] - Posture for AI resources"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FDefender%20for%20AI%2F%5BTSG%5D%20-%20Posture%20for%20AI%20resources"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# [TSG] Defender for AI — Posture for AI Resources

## Overview

AI posture benefits are part of **Defender for CSPM** — no additional activation needed for existing customers. Agentless and frictionless.

## Recommendations

### Azure
- Azure AI Services resources should restrict network access
- Azure AI Services resources should have key access disabled (disable local authentication)
- Diagnostic logs in Azure AI services resources should be enabled
- Azure AI Agent should be configured with operational instructions
- Connected AI agents should be configured with instructions on how to invoke them
- Prompt shields should be enabled on model deployment used by AI Agents

### AWS
- AWS Bedrock agents should use guardrails when allowing access to generative AI applications
- AWS Bedrock should use AWS PrivateLink

### GCP (Preview)
- A Private Service endpoint should be used for Vertex AI Online endpoints
- Root access should be disabled on Workbench instances
- Public IP addresses should be disabled on Workbench instances
- Customer-managed keys should be used to encrypt data at rest in Vertex AI DataSets
- Cloud Monitoring should be used on GCP Workbench instance
- Idle shutdown should be enabled on Workbench instances

**Recommendation issues TSG:** [Recommendations Platform](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/7230/Recommendations-automated-remediation-scripts)

## Attack Paths for AI Resources

- Internet exposed Azure VM with high severity vulnerabilities allows lateral movement to Azure Open AI
- Exposed VM with vulnerabilities has access to a suspected GenAI grounding data source
- Internet exposed AI application has access to sensitive data
- Internet exposed VM instance has high severity vulnerabilities and permissions to AWS Bedrock
- Internet exposed APIs allows lateral movement to Azure AI Foundry
- Internet exposed APIs allows lateral movement to Azure AI Foundry project
- Internet exposed APIs allows lateral movement to Azure logic app used by AI agent
- Internet exposed APIs allows lateral movement to Azure search service used by AI agent
- Internet exposed APIs allows lateral movement to Critical Azure AI Foundry coordinator agent grounded with sensitive data
- Internet exposed APIs allows lateral movement to Azure AI Foundry coordinator agent
- Internet exposed container with high severity vulnerabilities allows lateral movement to Azure AI Foundry coordinator agent grounded with sensitive data

**Attack paths TSG:** [TSG Attack Paths](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/1409/-TSG-Attack-Paths)

## Security Explorer

Covered resources: Azure OpenAI, AWS Bedrock, GCP Vertex AI, Azure AI Foundry

**TSG:** [TSG Cloud Security Explorer](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/1410/-TSG-Cloud-Security-Explorer)

## Security Explorer Templates for AI

- **AI-BOM: AI workloads and models in use** — Returns all AI workloads and artifacts with active generative AI models. Note: Azure OpenAI and AWS Bedrock have different UI views.
- **Generative AI vulnerable code repositories that provision Azure OpenAI** — Repos with known GenAI vulnerabilities provisioning Azure OpenAI.
- **Containers running container images with known Generative AI vulnerabilities** — Container images with known GenAI vulnerabilities with active container instances.

## Special Insights

### Used for AI
Identified based on:
1. Presence of AI libraries running on the resource
2. Access to AI-specific resources on the compute

### Used for AI Grounding
Identified based on (any one factor triggers the insight):
1. [Low confidence] Resource accessible from AI Application
2. [High confidence] Grounding resources detected via threat protection mechanism
3. [High confidence] ML connection — data stores connected to Azure ML
4. [High confidence] AWS OpenSearch connected to AWS Bedrock Knowledge base

### Coordinator AI Agent
Agents acting as main entry point, operating independently, coordinating with ≥3 other agents.

### Grounded With Sensitive Data
Agents connected to a sensitive data source through one of their tools.

### Used By AI Agents
Agents, Search Services, and Logic Apps being used as tools by one or more AI agents.
