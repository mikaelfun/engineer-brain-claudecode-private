---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/TLS Probes Behavior between App GW and Web App"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FTLS%20Probes%20Behavior%20between%20App%20GW%20and%20Web%20App"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Validation of Probes - TLS 1.3 Handshake Between Azure Application Gateway and Azure Web App

[[_TOC_]]

## Overview
This document provides a step-by-step validation process for confirming a secure TLS 1.3 handshake between an Azure Application Gateway and an Azure Web App. The verification uses DNS resolution and PCAP analysis to ensure encrypted communication and compliance with security standards.

## Tasks
- Perform DNS resolution using nslookup for web app.
- Capture and analyze PCAP for TCP and TLS handshake.
- Confirm negotiated TLS version and cipher suite.

## Key Validation Steps

### Step 1: DNS Resolution

```
nslookup <webapp>.azurewebsites.net
```

Result:
- Resolved IP: (Web App IP)
- Aliases: waws-prod-*.sip.azurewebsites.windows.net

### Step 2: PCAP Analysis

- Source: App GW Instance IP
- Destination: Web App IP
- Port: 443

Verify handshake is clean and successful.

### Step 3: TLS Handshake Breakdown

- **Client Hello**: App GW proposes TLS 1.3 with supported cipher suites.
- **Server Hello**: Web App confirms TLS 1.3 and selects TLS_AES_256_GCM_SHA384.

> **Note:** Record layer may show TLS 1.2 for compatibility, but negotiated version is TLS 1.3.

## Final Confirmation

TLS 1.3 handshake successfully negotiated, ensuring secure communication.
