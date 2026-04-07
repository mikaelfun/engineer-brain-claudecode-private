---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Microsoft Identity Manager/MIM 2016 Overview/Connectors/Lotus Domino"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FMicrosoft%20Identity%20Manager%2FMIM%202016%20Overview%2FConnectors%2FLotus%20Domino"
importDate: "2026-04-07"
type: troubleshooting-guide
---

Management Agent for Lotus Notes
--------------------------------

See the technical reference:
[Lotus Domino Connector | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-identity-manager/reference/microsoft-identity-manager-2016-connector-domino#overview-of-the-lotus-domino-connector)


From a high-level perspective, the following features are supported by the current release of the connector:
(no other versions are supported)

| Feature | Support |
| --- | --- |
| Connected data source | Server: Lotus Domino 8.5.x, Lotus Domino 9.x / Client: Lotus Domino 8.5.x, Lotus Notes 9.x |
| Scenarios | Object Lifecycle Management, Group Management, Password Management |
| Operations | Full and Delta Import, Export, Set and change password on HTTP password |
| Schema | Person (Roaming user, Contact), Group, Resource (Resource, Room, Online meeting), Mail-in database, Dynamic discovery of attributes, Support up to 250 custom certifiers with org & OU |

The Lotus Domino connector uses the Lotus Notes client to communicate with Lotus Domino Server. As a consequence of this dependency, a supported Lotus Notes Client must be installed on the synchronization server. The communication between the client and the server is implemented through the Lotus Notes .NET Interop (Interop.domino.dll) interface. This interface facilitates the communication between the Microsoft.NET platform and Lotus Notes client and supports access to Lotus Domino documents and views. For delta import, it is also possible that the C++ native interface is used (depending on the selected delta import method).

### Prerequisites

Before you use the Connector, make sure you have the following prerequisites on the synchronization server:
* Microsoft .NET 4.6.2 Framework or later
* The Lotus Notes client must be installed on your synchronization server
* The Lotus Domino Connector requires the default Lotus Domino LDAP schema database (schema.nsf) to be present on the Domino Directory server. If it is not present, you can install it by running or restarting the LDAP service on the Domino server.
* VC++ 14 runtime, both [x86](https://aka.ms/vs/17/release/vc_redist.x86.exe) and [x64](https://aka.ms/vs/17/release/vc_redist.x64.exe) versions of VC++ Redistributable

Deploying this connector may require customization of your Lotus Domino server. For deployments involving integrating MIM with Domino in a production environment, we recommend customers work with a deployment partner for help, guidance, and support for this integration.

#### Minimum Permissions

| Operation | Minimum Permissions |
| --- | --- |
| Read from the Name and Address Book (NAB) | Must not be member of a deny group that has an access control list (ACL) set on the NAB |
| Add, modify, or delete from the NAB | Must be a member of the administrator group |
| Set a password | Must be a member of the administrator group |

#### Communication Protocols and Ports

| Service | Protocol | Port |
| --- | --- | --- |
| C API | TCP | 1352 |
