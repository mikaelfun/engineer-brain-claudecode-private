---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Learning Resources/Introduction to Windows 365/Windows 365 Reserve/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FLearning%20Resources%2FIntroduction%20to%20Windows%20365%2FWindows%20365%20Reserve%2FScoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scoping Questions

### 1. Environment & Configuration

*   Is this scenario using **Windows 365 Reserve** or standard Cloud PCs?
*   What **license SKUs** are assigned to the affected users?
*   How many **Reserve Cloud PCs** are configured in the tenant?
*   Is Reserve configured at the **tenant level or scoped to specific users/groups**?
*   What **provisioning policy** is associated with the Reserve Cloud PCs?
*   Are users also assigned a **primary Cloud PC**, or are they relying only on Reserve?
*   What **Windows version and build** are the Reserve Cloud PCs running?

### 2. User Scenario / UX

*   What exactly is the user trying to do when the issue occurs?
*   At what point does the experience deviate from what is expected?
*   Is the issue happening during **access, sign-in, assignment, or session launch**?
*   Are users seeing any **unexpected messages or missing access** related to Reserve?
*   Is the issue specific to the **Reserve experience**, or does it also affect primary Cloud PCs?

### 3. Scope & Impact

*   How many users are affected by this issue?
*   Are all affected users part of the same **group, policy, or license assignment**?
*   Is this blocking users from working, or is there a functional workaround?
*   Does the issue impact **new users only**, existing users, or both?
*   Is this affecting **production workloads** or a test/pilot group?

### 4. Reproducibility

*   Can the issue be reproduced consistently?
*   Does it happen every time, or intermittently?
*   Can the same behavior be reproduced with a **different user or Reserve Cloud PC**?
*   Does the issue occur across **multiple devices or browsers**, or only one?

### 5. Timing & Recent Changes

*   When was the issue first noticed?
*   Did anything change recently (licenses, policies, group membership, assignments)?
*   Were any **Reserve Cloud PCs added, removed, or reassigned** before the issue started?
*   Did this scenario work as expected previously?

### 6. Validation & Expected Behavior

*   What is the **expected behavior** from the customer's perspective?
*   How does the current behavior differ from that expectation?
*   Is the expectation based on **documentation, prior behavior, or a specific design assumption**?
*   Has the customer validated that Reserve is intended for this specific use case?

### 7. Logs, Evidence & Technical Data

*   Are there any **error messages or correlation IDs** shown to the user?
*   Do you see any related events in **Cloud PC activity or provisioning status**?
*   What is the current **assignment state** of the affected Reserve Cloud PCs?
*   Can you capture timestamps of when the issue occurs for backend correlation?

### 8. Workarounds & Mitigations

*   Have any workarounds been attempted (reassignment, re-login, policy change)?
*   Does assigning a **standard Cloud PC** resolve the issue temporarily?
*   Does removing and reassigning the **Reserve license or group** change behavior?
*   Is the customer able to continue working using an alternative access method?

### 9. Supportability & Next-Step Decisioning

*   Based on the scenario, does this look like a **configuration issue, limitation, or potential product bug**?
*   Is the behavior aligned with how **Reserve is designed to operate**?
*   Is this scenario documented as **supported or unsupported**?
*   Do we need to collect data for **product escalation**, or can this be resolved via configuration guidance?
