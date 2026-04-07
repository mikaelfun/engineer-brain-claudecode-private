---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/Tools/Portal extension analyzer"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/Tools/Portal%20extension%20analyzer"
importDate: "2026-04-05"
type: troubleshooting-guide
---

The Portal extension analyzer lets you browse through diagnostics collected from the **Azure Portal**. It can be accessed at [Home - Extension Analyzer](https://extensionanalyzer.azure-test.net/).

To use the extension analyzer, a **session id** is required. This can be retrieved from the `x-ms-client-session-id` header on a request to ARM that is coming from the Azure Portal.

The extension analyzer collects **information about the user**, **what blades the user accessed within the session**, **the operations generated to ARM**, and **any JavaScript exception thrown while browsing on the session**.
