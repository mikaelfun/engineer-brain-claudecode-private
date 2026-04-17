---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Processes/Agent CoPilot/Agent CoPilot Guidance"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FProcesses%2FAgent%20CoPilot%2FAgent%20CoPilot%20Guidance"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Copilot Guidance

## What is Agent CoPilot?
Agent Copilot (formerly called DfM CoPilot) can help and assist you with all technical questions and problems related to Microsoft Purview.

## When to use Agent CoPilot?
- If you have technical question or an error you need assistance to troubleshoot related to Microsoft Purview.
- If you have questions about the product requirements, limitations, How-to scenarios.

> **Note:** We currently don't __fully__ support content for __Operational__ questions such as:
> - How to handle case transfer FTS?
> - How to open collab?

> For some of these prompts, you might get answers, but it is not yet __fully__ supported.

## How to use Agent CoPilot?
From DFM App, On the right handside, you will find an Icon for it.

### What are the filters for our services?
We have 2 filters that we can use for Microsoft Purview - Governance asks.
1. To search public documentation content, use the filter "Azure Core"
2. To search internal wiki (TSGs, How-To) content, use the filter "DnAI Azure Purview"

### Prompts Library:
- How to troubleshoot <brief issue description>?
    - E.g. How to troubleshoot scan failure with Internal Server Error when using Self-Hosted Integration Runtime?
    - E.g. How to troubleshoot assets missing after the scan?
    - E.g. How to troubleshoot HTTP Error 403 when querying assets using HTTP GET function using <REST API/SDK>?

- How to <ask>?
   - E.g. How to collect logs to troubleshoot scan failure issues?
   - E.g. How to collect browser traces to troubleshoot UX issues?
   - E.g. Do we support creating additional Purview accounts within a tenant? What is the Purview account limit for a tenant?

- What is/are <ask>?
    - E.g. What is the current limitation of a Purview accounts within a tenant?
    - E.g. What is the pre-requisites to configure Salesforce connector to scan assets?

**In general, the more context you have in your prompt, the better the result will be.**
Always try to include:
- Product name.
- Issue description.
- error message or error code.

## Best practices for using CoPilot prompt

### Ask a Question

- Q&A does not have context of the support case.
- Copilot is a conversational AI. Within a session, you can continue the conversation without repeating the original details.
- Each session has 15 interactions. Clear Chat when you start a new topic.
- Copilot works best when prompted with natural language prompts.
- Much less effective with keyword or incomplete statement.
- Make use of Filters to exclude irrelevant product wiki.
    - Azure core -> Public doc + core service wiki
    - DnAI Azure Purview -> Microsoft Purview wiki

>**Recommendation:** To get best results from the copilot. For the input prompt, Re-phrase customer's verbatim after understanding the issue and DO NOT use customer's verbatim as it is.

## Best practices when submitting thumbs down feedback

1. Include the filter names you used. e.g. (Azure core), (DnAI Azure AI, ML, & Iot), etc...
2. Include what was the expected outcome of the prompt? using text and links to internal TSGs or public docs.

> **Important:** Please include **verbatim** in your feedback. This will help us identify the actionable items to improve our copilot.
