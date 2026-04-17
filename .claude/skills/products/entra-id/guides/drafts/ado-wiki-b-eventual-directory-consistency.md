---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Eventual Directory Consistency in Microsoft Entra"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FEventual%20Directory%20Consistency%20in%20Microsoft%20Entra"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.AAD-Workflow
- cw.EntraId
- cw.comm-orgmgt
---
:::

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Account-Management](/Tags/AAD%2DAccount%2DManagement) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AzureAD](/Tags/AzureAD) [comm-orgmgt](/Tags/comm%2Dorgmgt)   

[[_TOC_]]

### Compliance note  

This wiki contains test/lab data only.

# Feature overview  

Microsoft Entra is a globally distributed service that provides identity and access management to millions of customers world-wide. To scale reliably and remain resilient during failures, Microsoft Entra uses an **eventually consistent** directory model.   A successful write to Microsoft Entra does not guarantee that an immediate read will reflect that change. 

When you create or update a directory object such as a user, application, service principal, or group membership, the write is accepted first and replicated asynchronously across directory replicas. During this replication window, it is normal for:

- A read request to not return the latest data for entities that have been recently updated.
- A newly created object to return a �Not Found�
- A recently updated property to not yet be visible

This behavior is expected and documented for Microsoft Entra and should be handled explicitly by client applications.

Microsoft Entra operates on top of a multi-region, multi-replica directory architecture designed for scale, availability, and fault tolerance. Reads are served from nearby replicas for performance, while writes are replicated asynchronously.

![Image showing how Entra replication works](../../../.attachments/AAD-Account-Management/2558445/DirectoryRepl.png)

We are making a change to Microsoft Entra Graph APIs by disabling the default app-only consistency behavior.  This is a breaking change for applications using app-only access with Microsoft Entra Graph APIs that rely on the default consistency behavior. App-only queries that are trying to read immediately after a write may return different results after this change. **Delegated (user-based) access is not affected**.

**Delegated access (app + user):**

- Requests run on behalf of a signed-in user
- Consistency across requests is often observed

**Application-only access (app-only):**

- Requests run without a user context
- Common for background jobs and automation
- Consistency across requests is not guaranteed by design

We will begin rolling out this change on **May 31, 2026** and expect it to be in fully in effect by **June 7, 2026**.

To prepare customer should review applications that use app-only access with Microsoft Entra Graph APIs. Identify queries that rely on default consistency behavior and update them. We recommend validating application behavior and completing any required updates before May 31, 2026 to avoid potential disruptions.

## Supportability documentation  

### Public documentation  

- Customer/Developer Guidance: [Designing for Eventual Consistency for Microsoft Entra](https://devblogs.microsoft.com/identity/designing-for-eventual-consistency-for-microsoft-entra/)
- More information: [Architecture overview - Microsoft Entra](https://learn.microsoft.com/en-us/entra/architecture/architecture#data-consistency)