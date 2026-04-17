---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Components/Layer 2 - Runtime/Operating System"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FComponents%2FLayer%202%20-%20Runtime%2FOperating%20System"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Contract

The Autonomous Runtime depends on functionality from the Operating System.

- Compute: Processes, Containers, Windows Job objects.
- Networking: Container networking, DNS server.
- Storage: NTFS, WCIFS (Windows Container FS).
- Security: Virtual service accounts, ACLs, certificates.

The hosted services on top of the Autonomous Runtime depend on functionality from the Operating System.

- ReFS: Blob storage
- Extensible Storage Engine (ESE): Cosmos DB
- IIS: Azure Resource Manager (ARM)

The OS of the ArcA VM at release will be Windows Server 2022 LTSC.

# Containers

Most Arc CP services run as containers, with a handful running as processes. Specifically, Windows-on-Windows (WoW), process-isolated (i.e. shared kernel) containers.

We may use Hyper-V isolated (i.e. isolated kernel) containers in the future for securing groups of services and Linux-on-Windows (LCOW), but there are performance challenges to address.

# Why containers?

- Homogeneous Lifecycle Operations: If all apps run as containers, the container interface becomes a common interface for service lifecycle operations, regardless of service implementation.
- Isolation: ArcA packs dozens of services into a small environment and we need to prevent these services from interfering with each other (resource, runtime, and network isolation).
  - Resource isolation: Prevent services from starving each other of resources (e.g. CPU, memory, IOPs). This functionality is provided by Windows Job Objects.
    - Pre-containers, resource controls on processes was offered via Windows Job Objects (e.g. CPU, memory).
    - Process-isolated containers are built on top of this technology i.e. you can think of them as Windows Job Objects++.
    - Process-isolated containers offer more resource isolation than regular processes e.g. storage and network bandwidth controls.
  - Runtime isolation: Azure services use a variety of application runtimes. (e.g. CRT, .NET, Go, Node.js, IIS)
    - Each service's app runtime dependency is isolated inside of the container (vs. managing all these installed SxS on the container host).
  - Network isolation: Each container runs in its own network compartment (a feature of Job objects).
    - They don't see the container host networking, only the container network and the container vNIC attached to the network.

# Service isolation via Containers

1. All containers have an associated Windows Job object for resource control of the group of processes running inside.
2. Each container sees its own filesystem and registry namespace, providing storage isolation.
3. The service binaries and their dependencies, such as the application runtime (e.g. .NET, Node.js, Go, etc.), are stored in the isolated filesystem and loaded by the isolated process(es), providing runtime isolation.
4. Each container runs in its own network compartment, with its own virtual NIC that only sees the container network, providing network isolation.

# Networking

1. Each container is connected to the container network via its virtual NIC, which is attached to an L2 virtual switch. The container network has its own IP subnet where unique IP addresses are assigned from to each container vNIC.
2. When the vSwitch is created, a vNIC is created with it that acts as the gateway for the container network.
3. Any inbound or outbound traffic to/from the container network undergoes network address/port translation, either at the L2 or L3 layer.
4. The built-in WS DNS server binds to <gateway vNIC IP>:53. It is used by containers to resolve the DNS name to IP address of other containers on the container network.

# Storage

NTFS is used on all volumes except:

- ReFS: The autonomous implementation of Azure Blob takes a dependency on ReFS functionality for some of its operations.
- WCIFS: Windows Container Isolation File System - a virtual overlay of the host FS that creates an isolated file system on top of the container's image that is transient (all changes are discarded after container termination).

# Security

## Virtual accounts

Arc-A uses local managed service accounts.

- Local == Non-domain (not a GMSA).
- No password management required.
- Do not need to explicitly create the account.
- First-class support for these accounts by SCM.

## ACLs

Arc-A depends on ACLs against these virtual account identities to isolate for authorized access.

## Certificates

Certificate storage, parsing, validation, etc.
