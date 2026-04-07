---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/How to "ALDO Readiness Content Guide Plan""
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/How%20to%20%22ALDO%20Readiness%20Content%20Guide%20Plan%22"
importDate: "2026-04-06"
type: troubleshooting-guide
---

ALDO Readiness Content Guide Plan
=================================

Overview
--------

The ALDO Readiness Content Guide Plan is designed to equip technical teams with the skills to manage ALDO�s unique architecture, deployment prerequisites, and operational constraints. It also helps management plan enablement efforts efficiently by building on existing Azure Stack Hub expertise.

Target Audience
---------------

This guide is intended for managers responsible for planning and overseeing ALDO readiness efforts, as well as BETA engineers who will be the first to deploy, validate, and support ALDO. It supports strategic enablement planning and delivers technical insights to ensure the BETA team is fully equipped to manage ALDO�s unique deployment and operational requirements.

Objective
---------

The ALDO solution is built on a broad set of core technologies and components. While many of these may be familiar to seasoned Azure Stack Hub support engineers, their implementation, configuration, and integration within ALDO differ significantly.

Scope of Readiness Material
---------------------------

### In Scope

*   ALDO specific deployment architecture and prerequisites
*   Local control plane operations and disconnected management
*   Integration of services such as AKS via Arc, Azure Container Registry (ACR), Azure Key Vault, and Azure Policy in disconnected scenarios
*   Security, identity, and certificate management (e.g., PKI requirements)
*   Operational tooling and observability in offline environments
*   ALDO specific support processes and known limitations

### Out of Scope

*   Generic Azure services and public cloud operations unrelated to ALDO
*   Connected Azure Local features currently not applicable to ALDO (e.g., Azure Backup, Azure Site Recovery, Azure Virtual Desktop, billing and metering)

Readiness Development Process
-----------------------------

### Azure Dev Ops (ADO)

Azure DevOps (ADO) will be used to coordinate the collaborative readiness effort. Work items are currently hosted under the �Supportability� organization within the �AzureStackWinfield� project.

### Work Item Standards and Labeling Approach

A simplified and pragmatic structure will be used for organizing readiness work items in ADO. The following conventions will guide the current effort:
*   **Epic**: Serves as the root-level container for the initiative.
*   **User Story**: Represents a major ALDO component or readiness topic.
*   **Feature**: Used to break down User Stories into subcomponents or specific focus areas.
*   **Task**: Tracks the actual creation or curation of readiness content.

### Component Mapping Process

The initial component list will be presented to the global BETA team and key stakeholders during this week�s �Azure Local Disconnected � Beta/Readiness/Supportability� call.

### Prioritization

Components and work items directly related to the Control Plane or Appliance will be assigned the highest priority.

### Feedback Incorporation

Feedback can be submitted by commenting directly on the relevant ADO work items, tagging contributors in the Teams channel, or raising suggestions during scheduled calls.

### Arbitration

Technical Advisors (TAs) are expected to play a dual role in the readiness initiative. Disagreements may occur regarding whether a component should be included, how it should be categorized, or what priority it should be assigned.

Readiness Material Development
------------------------------

The global BETA team will lead the creation of readiness content by referencing the Azure DevOps (ADO) work item list and selecting unassigned topics, prioritizing those marked as high priority.

### Example 1: New Content Creation

*   **Topic**: Introduction to ALDO (User Story)
*   **Task**: Content completed & available

### Example 2: Existing Content Reference

*   **Topic**: Storage (S2D) (User Story)
*   **Feature**: Thin Provisioning
*   **Task**: Content completed & available

Content Discovery Workflow
--------------------------

To drive efficiency and avoid duplicating effort, contributors are encouraged to follow this research workflow before creating new readiness content:
*   **Check our Wiki**: Review the existing content within our Wiki.
*   **Review Public Documentation**: Search Microsoft�s official public documentation.
*   **Explore the Azure Local Wiki**: Check the internal Azure Local Wiki.
*   **Leverage the BETA Community**: Reach out via the Teams channel or directly to fellow BETA engineers.