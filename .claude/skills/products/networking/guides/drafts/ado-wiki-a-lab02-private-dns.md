---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Training - Azure DNS/Azure DNS Labs/02 - Private DNS resolution"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/Training%20-%20Azure%20DNS/Azure%20DNS%20Labs/02%20-%20Private%20DNS%20resolution"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Lab 2: Private DNS resolution

# Learning Objectives

After completing this module, you will be able to:
- Create a Virtual Network and custom DNS server
- Create a Virtual Machine (VM) for your custom DNS
- Install DNS role for your VM
- Create Private DNS zone

# Step 1: Create a Virtual Network and custom DNS server

1. Create a Virtual Network.
2. Create a Virtual Machine for your custom DNS.
3. Install DNS role for your VM:
   ```cmd
   Install-WindowsFeature -Name AD-Domain-Services,DNS -IncludeManagementTools -Restart
   ```
4. Setup this Virtual Machine as the "Custom DNS server" for your Virtual Network.

# Step 2: Create Private DNS Zone

1. Create Private DNS Zone.
2. Link your Virtual Network to your Private DNS zone enabling auto-registration.
3. Create Records Manually.
   - After a few seconds you should see the record for your custom DNS server being automatically written to the zone.

> **Tip:** Auto-registration is triggered through DHCP. If anything goes wrong with auto-registration, check that the Virtual Network Link is enabled with auto-registration, restart your VM and check again.

# Step 3: Test your Private DNS zone

1. Create a virtual machine as DNS client in the same virtual network as your custom DNS VM. Set up the DNS role.
2. Check on your client virtual machine for resolution to external sites.
3. From nslookup/dig confirm requests are reaching your custom DNS.
4. Perform nslookup from Client Computer to any record in your private zone (this should NOT resolve with the private zone records since the client uses custom DNS server that doesn't forward to 168.63.129.16 yet).
5. Repeat but force the query over 168.63.129.16. This should resolve the private record:
   ```
   nslookup <myFQDN> 168.63.129.16
   ```
6. Configure a Forwarder on your custom DNS Server VM to point all queries to 168.63.129.16 (default forwarder).
7. Try resolving the private zone record now. The resolution to the Private DNS zone should work. If it does not, ensure that the client VM is rebooted.

**FAQ:**
- *Is the response from the Private zone Authoritative or Non-Authoritative?*
  The response is **Non-Authoritative** because the answer is not coming directly from the zone, but from the forwarding DNS server.

- *Lookup for a non-existent A record on your Private DNS Zone. What does it mean?*
  The response is **NXDOMAIN**, indicating the zone was checked but no record with that name exists.

Check [PrivateDNSRr](https://portal.microsoftgeneva.com/77F58BB4) for your queries.

# Return to the course

Return to the training material to continue the course.
