---
title: Deploy OMA-URIs to Target CSP via Intune
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-configuration/deploy-oma-uris-to-target-csp-via-intune
product: intune
date: 2026-04-18
---

# Deploy OMA-URIs to Target CSP via Intune

## Overview
Guide for deploying custom OMA-URI profiles to target Windows CSPs through Intune.

## Key Concepts
- CSP Scope: User scope (./User/Vendor/MSFT/...) vs Device scope (./Device/Vendor/MSFT/...)
- OMA-URI: Path string for custom Windows 10 configuration
- Built-in Intune policies use same OMA-DM mechanism under the hood

## Troubleshooting Custom Policies
1. Policy not reaching client: Check MDM diagnostic logs and Windows Event log
2. Policy reached but not applied: Check DeviceManagement-Enterprise-Diagnostics-Provider Admin log; verify OMA-URI syntax
3. Policy removal: May NOT revert setting to default (CSP-dependent); Wi-Fi/VPN/cert/email profiles ARE removed

## Migration Reference (GP to MDM)
Use MMAT (MDM Migration Analysis Tool) to analyze existing Group Policy for MDM transition.
