# Fabric VM State Transitions Reference

**Source**: MCVKB 5.8 | **Product**: VM | **ID**: vm-onenote-142

## Key Components
- **Fabric Controller**: Manages VMs for customers
- **Node**: Physical machine hosting VMs
- **Container**: Entity on node defining customer VM (creates VM in Hyper-V)
- **Role/Role Instance**: PaaS code definition; IaaS has one role instance per role
- **Tenant**: Collection of roles (= deployment)

## Node States

| State | Description |
|-------|-------------|
| **RAW** | Initial state in inventory; FC doesn't know node state yet |
| **Booting** | PXE request received, boot images sent |
| **Booted** | FC validates correct images → moves to Ready |
| **PoweredOff** | Node is powered off |
| **PoweringOn** | Waiting for power-on response |
| **Pxe** | Deploying maintenance OS |
| **Preparation** | Maintenance OS preparing node |
| **Deployment** | Downloading required images |
| **ActivateAgent** | Agent activation after reboot |
| **SettingMachineConfig** | MCF file being set (HE update) |
| **Ready** | Receiving heartbeats, ready for work |
| **CreatingContainer** | Creating a container on node |
| **StartingContainer** | Starting a container |
| **StoppingContainer** | Stopping a container |
| **DestroyingContainer** | Destroying a container |
| **Unhealthy** | No heartbeats (node crash, HostAgent crash, network loss) |
| **Recovering** | Attempting node recovery |
| **Dead** | Cannot interact with node |
| **OutForRepair (OFR)** | Bad hardware; service healing moves VMs off |
| **HumanInvestigate (HI)** | Needs human decision; service healing moves VMs off |
| **Excluded** | Temporarily removed from inventory |
| **Inspection** | After reconcile while in quarantine |

## Container States

| State | Description |
|-------|-------------|
| **Created** | Fetching OS image, creating VM in Hyper-V |
| **Started** | VM is running |
| **Stopped** | VM has stopped |
| **Destroyed** | After stopping |
| **Unresponsive** | No response from guest agent |
| **Unhealthy** | No Hyper-V heartbeat from guest OS (vmicheartbeat service) |

## Role States (PaaS)

| State | Description |
|-------|-------------|
| **Busy** | Executing OnStart method |
| **Aborted** | Unexpected app stop/failure |
| **Unresponsive** | No response |
| **Unhealthy** | Set by Guest Agent Runtime |
| **Stopped** | Customer role stopped |
| **Started** | Ready, added to load balancer |
| **Unknown** | FC initial state |
| **Stopping** | Customer action or unhandled exception |
| **Destroyed** | After destroy container workflow |

## Portal Display Mapping (PaaS)

| Portal | FC Workflow | Role State | Expected Time |
|--------|------------|------------|---------------|
| OS Starting | CreatingContainer / StartingContainer | Unknown/Created | ~10 min |
| Role Starting | StartingRole | Created/Busy | 0-15 min |
| Role Ready | Ready | Started | n/a |
| Role Stopping | StoppingRole | Started/Busy | 0-3 min |
| OS Stopping | StoppingContainer / DestroyingContainer | Started/Busy/Stopped | 1 min |
