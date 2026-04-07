---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Introduction to ALDO"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FIntroduction%20to%20ALDO"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Introduction to ALDO

**Azure Local Disconnected Operations (ALDO)** is a strategic solution designed to extend Azure capabilities into environments with limited or no connectivity to the public cloud. It enables organisations to deploy and operate Azure services locally, ensuring continuity, compliance, and control in disconnected or highly regulated scenarios.

## What is ALDO?

ALDO is part of the broader Azure Local initiative and is purpose built for scenarios where cloud connectivity is intermittent, restricted, or entirely unavailable. It leverages a local control plane and a curated set of Azure services to deliver a consistent management experience, even in fully offline environments.

## Key Objectives
- **Enable Azure in disconnected environments** such as remote industrial sites, defence installations, or regulated sectors like healthcare and finance.
- **Support local operations** with a familiar Azure portal experience, ARM templates, and CLI tooling.
- **Ensure operational independence** through local lifecycle management, update orchestration, and observability tooling.
- **Maintain security and compliance** with support for PKI, certificate rotation, and integration with external Active Directory.

## Core Components

- **Lifecycle Manager (LCM)** — Manages component updates and health.
- **Orchestration Service (ECE)** — Coordinates deployment and configuration.
- **Update Services (URP1 & URP2)** — Handle package delivery and installation.
- **Health & Scheduler Services** — Monitor system state and schedule tasks.
- **Admin Lifecycle Manager (ALM)** — Supports administrative workflows.
- **Observability & Remote Support** — Enable diagnostics and supportability in offline mode.
- **Cluster-aware Updating (CAU)** — Ensures safe updates across nodes.
- **External Dependencies** — Includes integration with AD, certificate services, and optional supplemental packages.

## Deployment and Readiness

ALDO deployments are currently progressing through staged previews, with public preview milestones scheduled throughout 2025 and general availability targeted for early 2026. Readiness efforts are coordinated via Azure DevOps and structured around epics, user stories, and tasks.
