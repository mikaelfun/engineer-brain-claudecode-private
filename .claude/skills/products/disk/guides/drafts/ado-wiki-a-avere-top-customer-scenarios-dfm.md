---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - HPC Cache/Top Customer Scenarios That Prompt Support Cases in DfM"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAvere%20-%20HPC%20Cache%2FTop%20Customer%20Scenarios%20That%20Prompt%20Support%20Cases%20in%20DfM"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Top Customer Scenarios That Prompt Support Cases in DfM

Below are common scenarios where customers typically open support cases for Avere FXT / vFXT or related cache-services:

1. **Initial configuration issues**
   Setting up the cache cluster, initial settings, or bootstrapping steps that fail.

2. **Problems creating or building the cache**
   Failures during cache construction, initialization, or cache validation.

3. **Problems adding storage targets**
   Issues connecting, mounting, or validating core filers / storage backends.

4. **Configuration options (DNS, NTP, directory services, extended groups)**
   Misconfiguration of network services or identity services (e.g. Active Directory, LDAP).

5. **Azure permissions & role issues preventing cache builds**
   Insufficient RBAC roles or Azure policy preventing resource creation or access.

6. **Network Security Groups (NSGs) misconfiguration**
   Blocking traffic between cache nodes, storage targets, or infrastructure services.

7. **Network links to on-premises resources failing**
   VPN, ExpressRoute, or WAN connectivity problems between the cache and on-prem storage.

8. **Firewalls blocking traffic**
   Firewalls between the cache and storage targets or essential network services (NTP, DNS, etc.).

9. **Stuck revokes, HA barriers, or storage target communication issues**
   Cache invalidation failures, replication or HA barriers, or core filer connectivity problems.

10. **GUI issues, feature requests, or degraded cache state blocking GUI changes**
    Problems with the management interface or internal state that prevents configuration via GUI.

11. **Performance problems or high client latency**
    Slow responses, bottlenecks, latency spikes under load.

12. **Terraform / automation issues**
    Failures in scripts or infrastructure as code for building, configuring, or deleting cache-related resources.
