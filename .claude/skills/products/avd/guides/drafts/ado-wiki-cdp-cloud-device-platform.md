---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Learning Resources/Windows 365 Training/CDP - Cloud Device Platform"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Learning%20Resources/Windows%20365%20Training/CDP%20-%20Cloud%20Device%20Platform"
importDate: "2026-04-05"
type: reference-guide
---

# CDP - Cloud Device Platform Architecture

## Core Concepts

- A Cloud Device represents a virtualized compute resource abstracted from the hosting technology/systems.
- Cloud Devices are created from a declarative specification (Offering template + custom parameters).
- The platform manages creation, configuration, and lifecycle via policies, addons, and placement.
- Partner Business provides logical and security boundary per partner team.
- Each Partner Business has Resource Isolation Groups (RIG) specifying Entra Tenant and Azure Subscriptions.

## Workflows

- Composers: list of steps with templatized workflow output
- Steps: composable, discrete unit of execution with execute and rollback
- Termination: guaranteed timely termination
- Rollback: reverse order rollback on failure
- At Least Once / Monotonic Step Execution guarantees
- Allocator: real-time placement decisions for Cloud Devices into Pools
- Azure Resource Proxy: YARP-based proxy for ARM/Kronox APIs

## Scheduler Service

- Ordering: process work items one by one per Cloud PC
- Merging: avoid unnecessary execution (e.g., Provision+Deprovision+Provision => Provision)
- Velocity Control: rate limiting to downstream (e.g., Intune enroll tenant-level limit)
- Tenant Fairness: guarantee fairness to avoid starving
- Trust Level-Based Quota Control: suspicious tenants get daily provision quota of 30, velocity 8/min
- Pre/Post-validation of work items
- Translate between domain and protocol: Scheduler -> RAS -> Workspace -> Scheduler -> RAS

## Action Moderator Service

- Cloud PC Action interface (Create, List)
- Action Precheck: check CPC status before posting
- Product-Specific Logic: e.g., Frontline PowerOn requires license quota first
- Action Framework: creating, posting, pulling, callback, sync to reporting Kusto

## Resource Availability Service (RAS)

- Unified Cloud PC interface for Enterprise/FLD/1P/Business
- Work items calculation from policy/assignment/user/3P license notifications
- Fraud management: cleanup resources for confirmed fraud tenants
- Grace Period: delay deprovisioning
- Resize: change license and build work items
- Power status syncing from Azure VM to Cloud PC
- Primary and backup devices for fast DR

## Architecture

- Global stamp: partner metadata, CDN for guest OS binaries, region mapping
- All resource management stored within region
- Cellular stamp architecture planned
