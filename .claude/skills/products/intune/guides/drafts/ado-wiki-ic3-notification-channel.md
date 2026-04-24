---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Intune SideCar/IC3 Notification Channel"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FIntune%20SideCar%2FIC3%20Notification%20Channel"
importDate: "2026-04-23"
type: guide-draft
---

# IC3 Notification Channel (Fast Channel) Guide

## Overview
IC3 (Intelligent Conversation and Communications Cloud) is the new push notification channel for Windows IME, replacing WNS (Windows Notification Service) for improved reliability.

## Architecture
- IC3 is embedded as a thread in IME agent process
- On startup, IME registers with IC3 service backend
- Feature enablement controlled via ECS flighting

## Notification Paths
1. IC3 (Primary) - new fast channel
2. WNS (Fallback) - legacy channel

## Channels
- URI #1: Remote actions, device enrollment, noncompliance alerts (MDM)
- IME Extension: Classic apps, custom compliance, scripts (IME)
- URI #3: EPM elevation rules, inventory policies (MMPC)
