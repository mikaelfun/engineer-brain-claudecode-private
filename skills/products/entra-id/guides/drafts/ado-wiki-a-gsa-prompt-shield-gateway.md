---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Global Secure Access AI Prompt Shield Gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGlobal%20Secure%20Access%20AI%20Prompt%20Shield%20Gateway"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Global Secure Access - AI Prompt Shield Gateway

## Overview

AI Gateway, part of Microsoft's Security Service Edge (SSE) solution, safeguards generative AI applications, agents, and language models. The Prompt Shield capability provides real-time protection against malicious prompt injection attacks.

Prompt Shield:
- Blocks adversarial prompts and jailbreak attempts before they reach AI models.
- Prevents unauthorized actions and sensitive data exfiltration.
- Works across any device, browser, or application for uniform enforcement.

## Prerequisites

- A valid [Microsoft Entra Internet Access license](https://learn.microsoft.com/en-us/entra/global-secure-access/overview-what-is-global-secure-access#licensing-overview).
- Windows devices that are Microsoft Entra joined or hybrid joined.
- [Global Secure Access Administrator role](https://learn.microsoft.com/en-us/entra/global-secure-access/reference-role-based-permissions#global-secure-access-administrator).
- [Conditional Access Administrator role](https://learn.microsoft.com/en-us/entra/global-secure-access/reference-role-based-permissions#conditional-access-administrator).

## Initial Configuration

1. [Enable the Internet Access traffic forwarding profile](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-manage-internet-access-profile#enable-the-internet-access-traffic-forwarding-profile) and configure user assignments.
2. Configure [TLS inspection settings](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-transport-layer-security-settings) and [TLS Inspection policies](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-transport-layer-security).
3. Install and configure the [Global Secure Access client](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-install-windows-client).

## Create a Prompt Policy

1. Sign in to [Microsoft Entra admin center](https://entra.microsoft.com/) as GSA Administrator.
2. Browse to **Global Secure Access** > **Secure** > **Prompt policies**.
3. Select **Create policy**, enter Name and Description.
4. On the **Rules** tab, select **Add rule**.
5. Configure: Rule Name, Description, Priority, Status, and set **Action** to **Block**.
6. Select **+ Conversation scheme** to choose target LLMs.
7. From **Type** menu, select the language model. If not listed:
   - Select **Custom**
   - Enter the **URL** of the service endpoint
   - Enter the **JSON path** for the prompt location in the request body
8. Select **Add**, then **Next**, then **Create**.

## Link to Security Profile

1. Browse to **Global Secure Access** > **Secure** > **Security profiles**.
2. Select or create a security profile.
3. Select **Link policies** tab > **+ Link a policy** > **Existing prompt policy**.
4. Select the Prompt Shield policy and **Add**.

## Create Conditional Access Policy

1. Browse to **Entra ID** > **Conditional Access** > **Create new policy**.
2. Configure Users, Target resources: **All internet resources with Global Secure Access**.
3. For **Session**, select **Use Global Secure Access Security Profile** with the profile created above.
4. Select **Create**.

## Supported Models

### Preconfigured Models
Copilot, ChatGPT, Claude, Grok, Llama, Mistral, Cohere, Pi, and Qwen.

### Custom Model Support
Any custom JSON-based LLM or GenAI app can be protected by configuring a custom type model with URL and JSON path.

## Known Limitations

- **Text only**: Prompt Shield currently supports only text prompts. It does not support files.
- **JSON only**: Only JSON-based generative AI apps are supported. URL-based encoding apps (like Gemini) are not supported.
- **Truncation**: Prompts over 10,000 characters are truncated.
- **Rate limits**: The system applies rate limits when scanning requests. When reached, subsequent requests are blocked.

## Cross-Team Support Boundaries

This product crosses multiple support boundaries:
- **Main components**: CSS Azure Networking in the GSA Internet section (Entra Portal)
- **Conditional Access portion**: CSS Identity
- **Microsoft Purview component**: CSS team supporting Microsoft Purview

## ICM Escalations

| Area | IcM Path |
|------|----------|
| Data Path | Global Secure Access / GSA Datapath |
| Control Plane | Global Secure Access / GSA Control Plane |

## Public Documentation

- [Protect Enterprise Generative AI apps with Prompt Shield (preview)](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-ai-prompt-shield)
