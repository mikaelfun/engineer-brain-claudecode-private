---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/EPIC on AVD"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FSandbox%2FIn-Development%20Content%2FEPIC%20on%20AVD"
importDate: "2026-04-06"
type: troubleshooting-guide
topic: Epic Hyperdrive on Azure Virtual Desktop (Healthcare)
---

# Epic Hyperdrive on Azure Virtual Desktop

## Overview

Epic Hyperdrive is a 3rd Party Web-Based app used in the Health Care Industry. CSS scope of support is **not changing** — engineers will **not troubleshoot or debug Epic Hyperdrive app**, but should help verify or narrow down if issues reported are specifically occurring only with this app.

**CSS Approach:**
1. Confirm if devices are **visible at OS level** (Control Panel / Device Manager)
2. If issue is **app-specific** → customer needs to engage vendors (Epic, FabulaTech, Imprivata)
3. If issue is seen at **OS level** → CSS performs regular AVD redirection troubleshooting

---

## Peripheral Devices in Clinical Settings

Typical peripheral devices essential for healthcare workflows:

| Device Type | Example |
|-------------|---------|
| Barcode Scanners | Honeywell Xenon 1950H Wired Barcode Scanner |
| Credit Card readers | Ingenico iPP 350 |
| E-Signature Pads | Topaz |
| Dictation Devices | Nuance Dragon PowerMic III |
| Label Printers | Zebra Printer ZQ620 |
| Scanning Devices (TWAIN) | Image scan pro 687ix |
| Webcams / Microphones | Logitech Web Camera C270 |

---

## Redirection Methods

| Method | Description |
|--------|-------------|
| **High-level redirection** | Intelligent intermediary; intercepts and optimizes communication for specific peripheral class. Best performance but requires driver and app support. |
| **Opaque low-level redirection** | Transports raw peripheral communication without optimization. Fallback scenario; performance not guaranteed. |

> Use high-level redirection whenever possible. Low-level is a fallback.

---

## Known Limitations (Important for Troubleshooting)

### 1. Linux Thin Client — Low-Level Device Redirection Not Supported

- **Impact**: Low-level device redirections for Linux Thin Clients are not functional
- **Root Cause**: Current Microsoft Linux SDK does not support low-level device redirection for Linux Thin Client providers
- **Workaround**: Use **FabulaTech Device Redirector** until Microsoft adds Linux SDK support
- **Roadmap**: Microsoft planned to add support to Linux SDK for low-level device redirection in H1 2025

### 2. TWAIN Scanner — High-Level Redirection Not Supported

- **Impact**: High-level TWAIN scanner redirections are incompatible with scanner redirections in AVD
- **Root Cause**: TWAIN scanner high-level redirection not supported
- **Workaround**: Low-level support on Windows Clients can redirect TWAIN scanners (latency may be an issue); or use **FabulaTech Device Redirector**
- **Roadmap**: Microsoft planned to add TWAIN scanner support to AVD in H1 2025

---

## Partner Solutions

### Imprivata

Enhances AVD sign-in experience for clinical workflows (dedicated devices, shared kiosk, virtual kiosks):
- Supports Windows Client environments and Linux Thin Clients
- Provides **Tap and Go** badge scenarios for quick sign-in/sign-out (SSO into Epic Hyperdrive)
- **Note**: Imprivata for Windows currently supports only Full Desktop experience (RemoteApp support expected in future)
- Contact: [Imprivata for Healthcare](https://www.imprivata.com/platform/for-healthcare)

### FabulaTech Device Redirector

Enhances peripheral device capabilities when native redirection is not possible:
- Use cases: Low-level device redirections for Linux Thin Clients, TWAIN scanner redirections for Windows and Linux
- Contact: [FabulaTech Device Redirector](https://www.fabulatech.com/device-redirector.html)

---

## Thin Client Partners

For peripheral redirection on 3rd party clients, see: [Connect to Azure Virtual Desktop with thin clients](https://learn.microsoft.com/en-us/azure/virtual-desktop/users/connect-thin-clients)
