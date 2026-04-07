---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Rack Scale/Readiness/Navigating Azure Local and Nexus Work Items in ADO"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Rack%20Scale%2FReadiness%2FNavigating%20Azure%20Local%20and%20Nexus%20Work%20Items%20in%20ADO"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**Created by: Carlos Natera
Last Updated: August 19, 2025**


## Introduction

This wiki article is designed to help our team efficiently navigate the Azure Local (AL) and Nexus work items in Azure DevOps (ADO). These work items include features, bugs, enhancements, and other tasks related to the product development. Navigating the hierarchy can be challenging due to the nested structure and varying top-level items, but by understanding the organization, using queries, and leveraging tags, you can find what you need "quickly".

The primary goals are:
- Explain the work item hierarchy.
- Provide key links to ADO resources.
- Detail the meaning and usage of tags (based on guidance from the Rack Scale product group).
- Offer tips for querying and filtering work items.

This article is based on the current structure as of August 19, 2025. If the hierarchy or tags evolve, update this page accordingly.

## Work Item Hierarchy

Work items in the AzureForOperatorsIndustry project follow a general hierarchical structure, but there are exceptions. The typical flow is:

- **Objective** (Top-level): High-level goals or initiatives.
  - **Key Results** or **Sub-Objectives**: Measurable outcomes or nested objectives.
    - **Epics**: Broad categories of work, often spanning multiple features.
      - **Features**: Specific deliverables or capabilities.
        - **User Stories**, **Tasks**, **Bugs**: Granular items like implementation steps, fixes, or enhancements.

**Exceptions**:
- In some cases, **Epics** serve as top-level items without an overarching Objective. Examples:
  - [Epic 1996881](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_workitems/edit/1996881)
  - [Epic 1312290](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_workitems/edit/1312290)
- This can cause standard tree queries to miss items. Always cross-check with full searches or the recently updated list.

To visualize the tree:
- Use parent-child links in ADO queries.
- Use the Tree Query for Hierachy Navigation query provided below.

## Key ADO Links

- **Recently Updated Work Items**: View the latest changes across Nexus and Rack Scale.
  - [Link](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_workitems/recentlyupdated/)

- **Tree Query for Hierarchy Navigation**: This query attempts to flatten the tree structure (Objectives > Epics > Features > etc.). Note: It may miss top-level Epics.
  - [Query Link](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/_queries/query/0c2b7910-5803-4880-9141-48cc1eae2de7/)

- **Full Project Board**: Landing page of the AzureOperatorsIndustry project. 
  - [Project Link](https://dev.azure.com/msazuredev/AzureForOperatorsIndustry/)

Tips for using these:
- In the query editor, add filters like `Work Item Type = Feature OR Bug` to focus on specific types.
- Use the "Tree" view in queries to expand/collapse hierarchies.
- Export queries to CSV/Excel for custom sorting or pivoting (e.g., by tags or assigned to).

## Understanding Tags

Tags are crucial for filtering and categorizing work items. Every feature typically includes a set of standard tags, plus domain-specific ones added by teams.

### Standard Tags (Required for Most Features)
These are applied consistently across the project:

- **AL:Public**: Used for all features required for Azure Local Rack Scale (ALRS) public preview.
- **ATT-IT**: Required to support AT&T-specific needs.
- **class:business**: Customer-facing; must be noted in release notes upon completion (e.g., customer-requested features).
- **class:architectural**: Internal architecture-related; no need to include in customer release notes.
- **Semester:Br**: Planned for completion in the Br semester (adjust for other semesters like Kr or Se).

### Domain-Specific Tags
Teams add these for their areas. Examples:

- **AL:VMCRUD**: Related to VM API features (Create, Read, Update, Delete).
- **dom:tenantvm**: Falls under the Tenant VM domain team.
- **dom:uc-engineering**: Under the Undercloud Engineering domain team.
- **dom:int-network**: Internal networking domain.
- **dom:Storage**: Storage-related domain.
- **ALRS**: Specific to Azure Local Rack Scale.
- **nexus**: Nexus-specific items.
- **Incident Repair Item**: Bugs or fixes from incidents.
- **Security**: Security-related enhancements or fixes.

Use tags in queries like `Tags Contains AL:Public` to filter relevant items.

### Full List of Current Tags
Here is an alphabetical list of all unique tags in the project (as of the provided data). Use this for reference when building queries.

- AKS
- AL:AzVerify
- AL:BCDR
- AL:BOM
- AL:BeyondGA
- AL:EdgeCredentials
- AL:GA
- AL:ImageManagement
- AL:K8sStorage
- AL:LiveMigration
- AL:NotExistsInALM
- AL:Portal
- AL:Private
- AL:Public
- AL:VMCRUD
- AL:VMDataDisk
- AL:VMNET
- AL:VMSecurity
- AL:Versioning
- ALBaseObservability
- ALL-Enablement
- ALMlstn:August
- ALMlstn:July
- ALMlstn:June
- ALRS
- ATT-IT
- AzureLocal
- Blocked
- CRI Bug-NFA
- Consumer
- DOM:Portal
- Feature
- Fishbull:Amber
- Fishbull:Green
- Fishbull:Red
- Frigate:DesignNeeded
- Frigate:HighEffort
- Frigate:Krypton
- Frigate:NotKrypton
- GA+
- Incident Repair Item
- NC 3.1.x | NF 2.3
- NexusLarge-NetworkCloudRP-SecCabinetReview
- NexusLarge-SecCabinetReview
- PartnerAsk
- Paused
- Product:Resource
- Release Operational
- Release Operations
- SecCab-AnA
- SecCab-CredIso
- SecCab-Detect
- SecCab-MinUnASurf
- SecCab-SupplyChain
- Security
- Semester: Br
- Semester:Br
- Semester:Kr
- Semester:Se
- StretchGoal
- VM
- Windows
- attlab
- backlog
- backlog-1.5
- backlog:AKS
- class:architectural
- class:business
- cloud:debt
- cloud:defect
- cloud:feature
- cloud:risk
- component-group-1
- component-group-2
- convergence-preview
- dom:Storage
- dom:devengr
- dom:int-network
- dom:rp-dev
- dom:simulator
- dom:tenantk8s
- dom:tenantvm
- dom:uc-engineering
- gethelp
- hci-public-api-impact
- hotfix 1.3
- must-commit
- nexus
- nexusidentity
- nfaproxy
- nfasvc
- nnf-svc
- observability
- parent
- prd:PMAlignmentPending
- prioritized
- prost:feature
- proxyrpsvc
- reductionImpact
- rpteam-junebacklog
- secg-champ:mike
- vendor

## Tips for Navigating and Querying

1. **Start with the Tree Query**: Use the provided query as a base, then add filters (e.g., by tags, assigned to, or state like "Active").
2. **Search for Exceptions**: For top-level Epics, use a separate query: `Work Item Type = Epic AND Tags Contains ALRS OR nexus` (no parent filter).
3. **Filter by Tags**: Examples:
   - Public preview features: `Tags Contains AL:Public`
   - Customer-facing: `Tags Contains class:business`
   - Bugs: `Work Item Type = Bug AND State = Active`
4. **Recently Updated**: Check this daily for hot items.
5. **Export and Analyze**: Export to CSV, then use Excel to pivot by tags or hierarchy levels.
6. **Custom Queries**: Create personal queries in ADO and share via links.
7. **Hierarchy Gaps**: If something seems missing, check parent links manually or ask the domain team (e.g., via tags like dom:tenantvm).

If you encounter issues or need updates, ping the Rack Scale product group or edit this wiki.

