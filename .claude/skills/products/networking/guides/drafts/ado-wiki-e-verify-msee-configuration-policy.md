---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Review/How to verify MSEE Configuration Policy"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FReview%2FHow%20to%20verify%20MSEE%20Configuration%20Policy"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

## Description

This article gives some examples of MSEE Configuration Policy Verifier tools.

## Tools

### Tool used to verify MSEE Configuration Policy

- PhyNet Config Policy Verifier: `https://phynet.osdinfra.net/ConfigPolicyVerifier/ConfigQuery/Query/{device-name}`
  - Shows Gold config: This is the configuration that should be applied on the device.
  - Shows Running config: This is the actual configuration running on the device.
  - Useful to check if the device is missing expected configuration.
  - Run force apply device config on Jarvis to fix on MSEEs
  - Works for TOR as well

**Added to Network Assistant for Express Route Scenario.**

### Retrieving the Running Config(MSEE) on Wanetmon Portal

- TOR: `https://wanetmon.cloudnet.core.windows.net/device?id=dc/se/net/{device-name}&target=latestconfiguration`
- MSEE: `https://wanetmon.cloudnet.core.windows.net/device?id=dc/er/net/{device-name}&target=latestconfiguration`

## Contributors

Pedro Perez, Sergio Velho, Pedro Tavares
