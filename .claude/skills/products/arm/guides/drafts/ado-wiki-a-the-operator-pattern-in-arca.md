---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Components/Architecture/General/The Operator Pattern/The Operator Pattern in ArcA"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FComponents%2FArchitecture%2FGeneral%2FThe%20Operator%20Pattern%2FThe%20Operator%20Pattern%20in%20ArcA"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Operators

An operator consists of three components:

- The application or infrastructure to operate/manage.
- A language for expressing the desired (aka goal) state of the application or infrastructure declaratively.
- A reconciler that continuously runs the following reconciliation loop:
  - Read the current state.
  - Mutate the environment to converge its current state with the expressed desired state.
  - Report the current state declaratively.

# Oplets

In Arc-A we refer to an individual operator as an oplet. Oplets are a class-level construct. Several oplets may be hosted in the same process. Oplets run at two sub-layers of the Autonomous Runtime:

- Local Layer: Local Oplets are responsible for state scoped to the node that they're running on (e.g., configuring firewall rules).
- Infrastructure Services Layer: Global Oplets are responsible for singleton, cluster-wide state (e.g., configuring a storage account, which would have the same value on any node in the cluster).

# Extensibility

Oplets also provide extensibility for the ArcA control plane. The platform (Autonomous Runtime) team cannot implement every piece of control plane functionality required by any Azure service. Therefore, we allow service developers to extend the platform with custom oplets.

For example, if you need functionality to configure Cosmos DB accounts (global state) on behalf of other services, this can be provided by the Cosmos DB porters as an oplet.

Arc-A provides an Oplet SDK with constrained interfaces to ensure that both platform and service developers fall into a "pit of success."

# Goals & Observations

The oplet reconciliation loop is driven by converging the current state of the environment to a declarative goal state.

## Question

Where do oplets read their goal state from and write their observations of current state to?

## Answer

Knowledge Store (KS) — The metadata store for the ArcA control plane, with first-class support for the operator pattern.

# Knowledge Store

Provides key/value storage with strong consistency (linearizability), a hierarchical namespace, change notifications, and schema management.

- Backend implementation: The raw FileSystem as it meets all requirements (i.e., linearizability, hierarchical namespace, blob storage, change notifications, ACLs).
- Frontend Implementation: .NET client library for programmatically interacting with the store (ks.exe command-line utility for shell interaction).

# Putting it all together: KS & Oplets

Oplets in both the infrastructure services and local layers talk to the Knowledge Store in the local layer to read goal state and write current state observations.
