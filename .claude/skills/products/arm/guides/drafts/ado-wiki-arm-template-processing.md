---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/ARM Templates, Bicep & Deployments/ARM template processing"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20(ARM)%2FArchitecture%2FARM%20Templates%2C%20Bicep%20%26%20Deployments%2FARM%20template%20processing"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## ARM Template Processing Flow

```mermaid
graph TD;
 A((PUT request))
 B[Common API checks]
 C[De-serialize Payload and validate against schemas]
 A-->B
 B-->C
 subgraph TemplateProcessing[Template Processing]
  D[Parameter processing]
  E[Custom function processing]
  F[Variable processing]
  D-->E
  E-->F
  subgraph ResourcesProcessing[Build deployment resources]
   G[Copy loops]
   H[Functions processing]
   F-->G
   G-->H
  end
  I[Build dependency map]
  J{Is the request for deployment validation?}
  K[Expand nested deployments]
  L[Do not expand nested deployments]
  H-->I
  I-->J
  J-->|Yes|K
  J-->|No|L
  subgraph ARMpreflight[ARM Preflight]
   M[RBAC preflight]
   N[Policy preflight]
   O[Capacity preflight]
   M-->N
   N-->O
  end
  K-->M
  L-->M
  subgraph RPpreflight[RP Preflight]
   P[Send preflight request to each RP endpoint]
  end
  O-->P
  Q{Is the request for deployment validation?}
  subgraph DeploymentSequencer[Start Deployment Sequencer]
   R[Deployment first job]
   S[Deployment Resource jobs: one for each deployment resource]
   T[Deployment clean up job if it the mode is set to mode]
   U[Deployment Last job: calculate outputs, log EventServiceEntries]
   V[Nested deployment PUT calls the whole process again recursively]
   R-->S
   S-->T
   T-->U
   S-.->V
  end
  Q-->|No|R
  P-->Q
end
Y((Validation completes))
Z((Deployment completes))
C-->D
Q-->|Yes|Y
U-->Z
```

### Processing Stages

1. **Common API checks** - Initial validation of the request
2. **De-serialize & validate against schemas** - Payload validation
3. **Template Processing** - Parameter → Custom function → Variable processing
4. **Build deployment resources** - Copy loops → Functions processing
5. **Build dependency map** - Determine execution order
6. **Preflight** - ARM preflight (RBAC → Policy → Capacity) → RP preflight
7. **Deployment Sequencer** - First job → Resource jobs → Cleanup → Last job

### Key Points
- Validation-only requests expand nested deployments but stop after preflight
- Full deployments proceed through the sequencer after preflight
- Nested deployments recursively invoke the entire processing pipeline
- Deployment cleanup job runs if deployment mode is set to "Complete"
