---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/Feature: EnableApplicationgatewayNetworkIsolation"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20EnableApplicationgatewayNetworkIsolation"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Internal Design for EnableApplicationgatewayNetworkIsolation

## Description

The "private application gateway" feature is currently in public preview. To deploy it, you must enroll in the public preview feature EnableApplicationGatewayNetworkIsolation.

Once enrolled, the design within gateway instances will change not only for private-only application gateways but also for all subsequent deployments, including public, public+private, and basic SKU application gateways.

## Internal Design

### Control Plane and Data Plane Isolation from NIC level

Two NICs are created for each gateway instance: eNIC and Mgmt NIC.
- **eNIC**: Deployed in customer managed VNet/Subnet, handling customer data plane traffic.
- **Mgmt NIC**: Deployed in PG managed subscription/VNet/Subnet, handling gateway internal control plane traffic.
- In front of eNIC: internal SLB appgwILB (for private frontend IP), external SLB appgwLoadBalancer (for public frontend IP).
- In front of Mgmt NIC: external SLB appgwMgmtLoadBalancer (for communication with internal public endpoints like gateway manager and monitoring service).

### Control Plane and Data Plane Isolation from Guest OS level

Inside gateway instance guest OS, control plane and data plane are separated through Linux network namespace.

- **Control plane**: Runs in Linux default network namespace (management namespace).
- **Data plane**: Runs in custom namespace named `customer`.
- Connected through **veth pair** (virtual Ethernet pair connecting two network namespaces).
- Communication between two namespaces only happens within `169.254.128.0/17` address space through veth pair interface.
- Customer namespace **cannot** initiate connection to management namespace through veth pair.
- Management namespace can initiate connection to customer namespace but only for limited TCP ports: `37291, 65527, 65533, 65534, 65535`.

## Troubleshooting Highlights

- Data plane is simpler (eliminates most NSG/UDR limitations on gateway subnet).
- Control plane introduces new setup steps (management namespace + customer namespace) → issues may occur during setup.
- Each instance has two NICs → ensure you're checking the correct NIC in internal dashboards (VFP).

### Identify whether NetworkIsolation is enabled

**From Kusto:**
```kql
cluster('hybridnetworking.kusto.windows.net').database('GatewayManager').ApplicationGatewaysExtendedLatestProd
| where SnapshotTime >= ago(30d)
| where CustomerSubscriptionId == "XXX"
| where GatewayName == "XXX"
| project SnapshotTime, NetworkIsolationEnabled, ManagementPublicIp, ManagementNetworkAddressPrefixes
```

**From ASC/Portal:** Check ASC Resource Explorer for NetworkIsolation status.

### DNS behavior change

Custom DNS behavior changes when NetworkIsolation is enabled. Refer to internal wiki: Custom DNS Internal Exceptions.
