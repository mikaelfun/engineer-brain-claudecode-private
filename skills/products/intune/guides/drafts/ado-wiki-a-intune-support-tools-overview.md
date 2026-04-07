---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Tools"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FTools"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**Page Owner:** Leon Zhu (yihzhu@microsoft.com)

This page provides an overview of the tools available to Intune CSS support engineers. Each tool links to its dedicated wiki page with detailed setup instructions and usage guidance.

## Getting Started

- **Approved Support Tools** — Official list of CSS-approved support tools (`aka.ms/support-tools`).
- **Permissions Cheat Sheet** — One-stop reference listing all permissions, accesses, tools, and distribution lists an Intune support engineer may need.

## Case Management & CRM

- **DFM (Dynamics for Microsoft)** — The current support case CRM used by Microsoft support. Covers access to WW and EU instances, SAP coding, and Root Cause Tree (RCT) selection for case resolution.
- **DfM Knowledge** — Links to the DfM Knowledge Wiki, Quick Start Guide, and Feedback/Known Issues resources.
- **CaseBuddy** — Integrates with DfM and DTM to help with case management tasks, including filtering and finding cases related to specific SME areas.

## Data & Diagnostics

- **Kusto** — Instructions for requesting read access to the Intune Kusto database, setting up Kusto Explorer, and information about cluster regions (NA, EU, etc.).
- **Kusto Dashboard** — Guide to the Intune Kusto Diagnostic Dashboard (`aka.ms/IntuneTSDB`) on Azure Data Explorer, with 20+ tabs covering device policy, enrollment, compliance, Autopilot, Windows Update, MAM, Graph API errors, and more.
- **Azure Support Center (ASC)** — Used for investigating authentication, targeting, conditional access, RBAC, and licensing issues. Enables searching users, devices, and groups and reviewing sign-in logs via Tenant Explorer.
- **Assist365** — A support tool for viewing select customer data including subscriptions, policies, devices, users, assignments, and RBAC for troubleshooting. Commercial cloud only.

## Log Collection & Analysis

- **One Data Collector (ODC)** — The primary log capture tool for Intune on Windows and macOS. Collects a wide range of troubleshooting data via PowerShell scripts.
- **Powerlift** — Access logs collected from Microsoft products by end users (Company Portal, Intune app, Tunnel VPN, Edge MAM, Outlook mobile, Authenticator, Defender ATP).
- **CMTrace** — A log viewer originally from Configuration Manager that provides formatting and error highlighting.
- **LogMachine** — An advanced internal-only log viewer (successor to CMTrace) for viewing, merging, filtering, highlighting, and parsing Configuration Manager log files.
- **SyncML Viewer** — A third-party tool for reviewing OMA-DM channel communication between Windows clients and the Intune cloud service. Useful for verifying policy delivery and diagnosing MDM issues.
- **Android Bug Report** — Comprehensive OS-level logs from Android devices, useful when troubleshooting how the Android OS handles device management operations.

## Lab & Testing Environments

- **My Workspace (MyWorkspace)** — Quickly provision lab environments for testing via `aka.ms/myworkspace`. Covers quota management, creating custom or template workspaces, nested virtualization, and Remote Desktop connections.
- **Test Tenants** — Information about the Test Tenant Management process for obtaining test environments.
- **EUDB-AVD** — Guide for accessing and using the European Union Data Boundary Azure Virtual Desktop environment.

## Network & Connectivity

- **AFD Connectivity Checker** — A tool created by Intune PG to help customers validate they have correctly allowlisted Intune-related Azure Front Door (AFD) endpoints in their environment.

## Developer & Productivity Tools

- **VSCode Extensions** — Recommended VS Code extensions as replacements for the now-blocked Notepad++, including Base64 encoding/decoding, Find All In File, and Log Highlight.
- **Scripts** — Utility scripts for Intune support, including `IntuneNetworkEndpointsCheck.ps1` for testing connectivity to public Intune endpoints.
