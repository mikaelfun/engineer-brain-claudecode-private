---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Common/DNS PacketData parser extension in Chrome"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FDNS%20PacketData%20parser%20extension%20in%20Chrome"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# DNS PacketData Parser Extension in Chrome/Edge

[[_TOC_]]

# Description

The current process to parse DNS PacketData in Jarvis logs requires third-party tools, causing delays and potential errors. This guide explains how to install and use a browser extension to parse DNS PacketData directly in Jarvis.

# Steps

## Install the Extension

**Extension Source:**
- ADO Repo: [Networking-DNS-Recursive-PrivateRR](https://msazure.visualstudio.com/One/_git/Networking-DNS-Recursive-PrivateRR?path=%2Fsrc%2Ftools%2FPacketParsingChromeExtension)
  - Download via Options → "Download as Zip"
- For new Jarvis Portal (portal.microsoftgeneva.com):
  ```
  \\reddog\Builds\branches\git_networking_dns_recursive_privaterr_master_latest\retail-amd64\Tools\DnsPacketParsingChromeExtension
  ```

Unzip the downloaded file before installing.

## Install in Chrome

1. Go to More Tools → Extensions
2. Drag and drop the unzipped folder into the Extensions page

## Install in Edge

1. Go to Settings → Extensions
2. Enable **Developer mode** (toggle ON)
3. Drag and drop the unzipped folder

## Important: Disable Jarvis Preview Feature

For the extension to work in Jarvis, you must **turn OFF** the "Use Jarvis Preview" feature in Jarvis settings.

# Usage

Once installed, Jarvis DNS log entries (e.g., Query Received, Recurse Query Out) will automatically show parsed PacketData inline — no need for external tools.

**Contributors:** Mays Algebary
