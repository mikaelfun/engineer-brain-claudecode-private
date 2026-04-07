---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/Learning Resources/Concepts/AMA Linux: Concept: Proxy Settings Precedence"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FLearning%20Resources%2FConcepts%2FAMA%20Linux%3A%20Concept%3A%20Proxy%20Settings%20Precedence"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
This concept document will explain how AMA will decide which proxy setting to use in the scenario in which multiple proxy settings are defined.

# Current Logic
      
*   Proxy evaluation logic
    *   Step 1: Are proxy settings defined in Arc?
        *   Eval: {ArcDirectory}\Config\localconfig.json
        *   YES
            *   Is AMA in Arc proxy bypass list? (Logic added in 1.34)
                *   YES � Skip to step 2
                    *   [BUG](https://github.com/Azure/azure-linux-extensions/pull/2038/files): Pattern never finds a match (estimated fix in 1.36 - roll back to 1.33 as a workaround, if required)
                *   NO � Use Arc proxy settings
        *   NO
            *   Skip to step 2
    *   Step 2: Are proxy settings defined in AMA extension settings?
        *   Eval: {AMADirectory}\RuntimeSettings\{latest}.settings
        *   YES
            *   What is the proxy mode?
                *   Proxy mode = none
                    *   Which logic are we using here? For example � do we stop here and use direct or do we eval OS? PENDING Answer from PG/PM.
                        *   Skip to step 3
                        *   Use direct communication
                *   Proxy mode = application
                    *   Use AMA proxy settings
        *   NO
            *   Skip to step 3
    *   Step 3: Are proxy settings defined in the OS?
        *   Eval Cpprestsdk (Linux): environment variables
            *   http_proxy
            *   https_proxy
        *   YES
            *   Use OS defined proxy settings
        *   NO
            *   Use direct communication