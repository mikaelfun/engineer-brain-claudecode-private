---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Components/Architecture/General/Arc Autonomous"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FComponents%2FArchitecture%2FGeneral%2FArc%20Autonomous"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Problem: To enable Azure Arc autonomy, the Arc CP must run outside of public Azure.

Solution: Arc Autonomous lets customers operate Arc-enabled infrastructure and services without requiring a connection to the Azure public cloud.

- The Arc Data Plane (Arc DP) is where the Arc-enabled infrastructure and services are hosted in a diverse array of environments.
- The Arc Control Plane (CP) operates the Arc DP, but it runs in the cloud

# Autonomous != Disconnected

The Arc data plane *must* be disconnected from public Azure and can be operated using the autonomous Arc control plane.

The Arc control plane *may* be disconnected. A subset of customers will allow the autonomous Arc control plane to be connected to Azure for things like telemetry and diagnostics.
There is also a scenario for connect/disconnect (e.g. ship docking at a port).

# Internal Environments

There are three high-level supported autonomous environments for external customers:

1. Autonomous (connected)
1. Autonomous + Air-Gapped (disconnected)
1. Autonomous + Air-Gapped (disconnected) + Secret

| Scenario /Functionality      | Autonomous | Autonomous + Air-Gapped | Autonomous + Air-Gapped + Secret |
|:-----------------------------|:----------:|:-----------------------:|:--------------------------------:|
| Autonomous Operations        | X          | X                       | X                                |
| Update, diagnostics, support | Online     | Offline                 | Offline                          |
| Telemetry                    | X          | -                       | -                                |
| Ruggedized for defense       | -          | -                       | X                                |
| Secret clearances            | -          | -                       | X                                |

# External Environments

## ArcA Engineering System

- Arc-A automated testing in the cloud
- Main's PR gate is an end-to-end build and test of ArcA
  - Simple DevEx: "git push" or "queue new build"
  - DevEx Velocity: Easy to test N changes in parallel
- After passing the gate, every PR to main is eligible to be bundled and automatically tested by a bot for extended testing and evaluated for merging

## Edge Engineering System

There is a vision for a unified Edge engineering system (e.g., end-to-end automated in the cloud with both Arc-A and Azure Stack HCI).

## Resource Provider development and testing

Enable developers of Azure Resource Providers (RPs) to use a slim, OneBox Azure environment (i.e. ArcA) to do their development.

## Dialtone fleet

The Dialtone team runs a layer of critical services that needs to run in the event of an Azure and Autopilot (aka Pilot Fish) outage (e.g., DNS, IcM). They have transitioned to an Azure Stack HCI fleet of machines, and are now exploring using Arc-enabled services on top of that fleet to get the benefits of developing on top of the Azure runtime without creating a cyclic dependency on the Azure services that depend on their layer of services.
