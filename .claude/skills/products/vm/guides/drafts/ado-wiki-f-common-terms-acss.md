---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Center for SAP Solutions (ACSS)/Trainings/Common Terms_ACSS"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Center%20for%20SAP%20Solutions%20(ACSS)%2FTrainings%2FCommon%20Terms_ACSS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Common Terms and Meanings

## Common Terms and Meanings for SAP

| Term | Meaning |
| ---- | ------- |
| Landscape | Refers to the complete set of SAP assets within the customer's IT environment, encompassing all environments that are in production as well as those that are not. |
| System | The combination of the DBMS layer and application layer of, for example, an SAP ERP development system, an SAP BW test system, and an SAP CRM production system |
| Environment | One or more SAP components logically grouped to perform a business function, such as development, quality assurance, training, disaster recovery, or production |
| Component | An individual SAP application, such as ERP Central Component (ECC), Business Warehouse (BW), Solution Manager, or Enterprise Portal (EP). SAP components can be based on traditional ABAP or Java technologies or a non-NetWeaver based application such as Business Objects. |
| AnyDB | Any 3rd party database chosen to run SAP (non-HANA) |
| SAP System Identification (SID) | This is a unique three-character code assigned to each SAP System which consists of a database server and several application servers. |
| ABAP Central Services (ASCS) | A core SAP application service that consists of two parts: the Message Server and the Enqueue Server. |
| Enqueue Replication Server (ERS) | A part of the ASCS server. It keeps an up-to-date replica of the lock table, ensuring that if something unfortunate happens to the ASCS instance, the state of the table locks remain safeguarded. |

SAP Landscapes are a way of organizing SAP servers into different tiers that are defined by how the system is used. Typical SAP deployments are divided into three different landscapes: DEV (Development), QAS (Quality Assurance), and PRD (Production).

## Common Terms and Meanings for SAP deployments on Azure

| Term | Meaning |
| ---- | ------- |
| NetWeaver | SAP NetWeaver is an open integration and web-based application platform. It serves as the technical foundation for many SAP applications. |
| HANA | SAP HANA (High-performance ANalytic Appliance) is an in-memory database that processes data with near-zero latency, enabling real-time analytics and smart applications |

## Common Terms and Meanings for Azure Center for SAP solutions

| Term | Meaning |
| ---- | ------- |
| Virtual Instance for SAP Solutions (VIS) | Logical Representation of an SAP system in Azure |
| Location | Refers to the location of the logical VIS resource |
| App location | Refers to the region in which the VM infrastructure is deployed |
| Workloads Extension | Responsible for discovery and registration of the SAP system |
| Monitoring Extension | Once registration is complete the monitoring extension is installed and monitors the health of the SAP system |
