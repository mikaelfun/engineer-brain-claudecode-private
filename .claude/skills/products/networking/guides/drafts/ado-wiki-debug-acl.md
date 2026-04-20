---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/Debug ACL"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/Debug%20ACL"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

<https://aka.ms/AnpDebugAcl>

# Known Issue
**Please be aware of the following:**
#95772

# Overview

This document outlines Debug ACL and how it can be used to troubleshoot ExpressRoute-related issues.

# What is Debug ACL?

Debug ACL is a tool in Jarvis Actions that allows a user to "count packets" inbound and outbound on an ExR MSEE interface. This allows you as an SE to get what is effectively a "packet capture" of sorts - at least enough to determine if traffic is ingressing/egressing the ExpressRoute as expected.

The functionality is simple - an [Extended Access Control List](https://www.cisco.com/c/en/us/support/docs/security/ios-firewall/23602-confaccesslists.html#extacls) is applied to a subinterface or tunnel interface on the ExpressRoute MSEE, with the rule filtered/defined with ALLOW rules as the SE requests (more on this below). When this happens, the MSEE will count packets that hit the specific ACL rules. 

# Why use Debug ACL?

While Debug ACL doesn't give you the raw packets - meaning you cannot see if a packet is a SYN/SYNACK/RST, etc - it does allow you to answer in a self-service fashion one of the more fundamental questions with ExpressRoute: **Are my packets getting to Azure, and are they getting back to on-prem** (or vice-versa)? Additionally, Debug ACLs are counted in hardware and won't be miscounted due to a drop, so are reliable. Packet captures taken on the device (legacy) are limited to 100MB in total (packets cannot be truncated) and may not capture all the data. Packet captures taken via mirroring (via Pythia or Everflow) come in out-of-order and may be dropped by the data center network.

However - it's extremely important that the *only* traffic between these two IPs and on this port/proto belong to the testing, else you will muddy the results and may get unexpected data. Thus, it is ideal to specify the ACL as narrowly as you can. This means, specify both source and destination IP (not the prefix) and the port. If you are using the debug ACL to answer whether the traffic is making it to Azure at all, use the ports for the traffic of interest. If you are attempting to answer if there is any loss happening between the customer edge and our edge, use a packet generator (such as iPerf or Ntttcp) and specify the relevant port. Do not use SMB for performance troubleshooting as the SMB TCP sessions cannot be easily started and stopped on demand. More information on debugging this is on the ER [Performance TSG](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/134205/ExpressRoute-Performance).

# Limitations

Debug ACL does not work with Microsoft Peering due to an ACL already being applied on the interface.
Debug ACL Runs for a fixed duration of 5 Minutes on ASC

## ACL Valid Duration

### Jarvis Action

Valid ACL duration (seconds): 1 to 1800 (30 minutes)

### ASC

Valid ACL duration (minutes): 5 minutes

In ASC, you are only allowed to run the test for 5 minutes. If you need to capture outside the provided time in ASC, you will need to use Jarvis actions.

# Example Output

## Cisco Example

```
Extended IP access list ACIS_port-channel20.126100_In
    10 permit tcp host 10.199.80.11 host 10.168.36.19 eq 3389 (120 matches)
    20 permit ip any any (224095 matches)
Extended IP access list ACIS_port-channel20.126100_Out
    10 permit tcp host 10.168.36.19 host 10.199.80.11 eq 3389 (120 matches)
    20 permit ip any any (173609 matches)
```
**PLEASE NOTE** the ACL applied via Jarvis Actions with traffic you are interested in is *always* on Priority 10. Priority 20 is the "Allow ANY" rule that allows all other traffic into the interface.

This Debug ACL has the following properties:

* Interface Name: port-channel20.126100
* IP Protocol: TCP
* IP Port: 3389
* On-Prem IP Address CIDR: 10.199.80.11
* Azure IP Address CIDR: 10.168.36.19

By creating this ACL, we can count all TCP/3389 traffic between `10.199.80.11/32` and `10.168.36.19/32` on subinterface `port-channel20.126100`

Notice the ACL has no DENY rules - we do not actually modify or change any traffic patterns or behaviors when running a Debug ACL. 

## Juniper Example

Debug ACL works the same way for Juniper MSEEs, but the output looks *slightly* different, but is self-explanatory:

```
Filter: ACIS_et-0/1/4.0_In                                    
Counters:
Name                                                Bytes              Packets
pkts                                               1232310               120

Filter: ACIS_et-0/1/4.0_Out                                   
Counters:
Name                                                Bytes              Packets
pkts                                               1110000               120
```

**Note:** the Juniper debug ACL does not have the allow any/any packet count that the Cisco debug ACL has by design. 


# How to Run Debug ACL

Running a Debug ACL is simple:

## Prerequisites

You must first gather the following information to run the test. This information is available in the Dump Circuit file in the ExpressRoute circuit properties view of ASC.

* Dump Circuit Output Information
   * MSEE Device Names
     * Cisco (ex: `ash-06gmr-cis-1` & `ash-06gmr-cis-2`)
     * Juniper (ex: `exr01.ash` & `exr02.ash`)
   * Peering Subinterface names
     * Cisco (ex: `PortChannel0.12345` or `TenGigabitEthernet1/2/3.12345`)
     * Juniper (ex: `xe-1/1/9:3.49`)
* Customer Repro Information
   * IP Protocol (TCP, UDP or ICMP)
   * IP Port (if using TCP/UDP (Ex: 3389)
   * On-Prem IP Address CIDR
   * Azure IP Address CIDR
* Test Duration

## Jarvis Actions

Be sure the customer is running a PsPing to the appropriate Azure IP, then run the Jarvis Action:

[Brooklyn > ExR Diagnostic Operations > Enable Debug ACL](https://portal.microsoftgeneva.com/?page=actions&acisEndpoint=Public&managementOpen=false&published=true&selectedNodeType=3&extension=Brooklyn&group=ExR%20Diagnostic%20Operations&operationId=enabledebugacl&operationName=Enable%20Debug%20ACL&inputMode=single&params={"devicename":"ash-06gmr-cis-1","interfacename":"PortChannel0.12345","ipprotocol":"Tcp","ipport":"3389","onpremipaddresscidr":"10.0.0.10","azureipaddresscidr":"10.100.100.100","aclvaliddurationseconds":"30","deviceregion":"Regional"}&actionEndpoint=Brooklyn%20-%20Prod&genevatraceguid=49e35246-ebc8-4f9b-b87a-f1af2275c2b2)

> NOTE: "Device Region" MUST be set to "Regional".

Remember, this operation only runs a Debug ACL on **one** MSEE device specified. You will need to run this operation TWICE - one for each MSEE (best to open two tabs, change the MSEE in the second tab, and click "Run" at the same time). The only field that changes in the second tab is the Device Name.

You will receive a result in each immediately with a link to blob storage that says "File will be available after X seconds" - it may take a slightly longer time than that for the file to show up. Try to download it after X seconds, and the file may be empty. If you keep hitting that URL over time, eventually a file will download that has the data in it. This generally happens within 

NOTE: It's recommended to run a "baseline" test prior to your "real" test, to ensure that there is no other traffic hitting this ACL that could confuse the results with "noise". Once you confirm the baseline shows no "matches" on the ACL rule, you should have the customer run a PsPing and run the real test.

Your outputs should show results similar to the following:

Cisco:
```
Extended IP access list ACIS_port-channel20.126100_In
    10 permit tcp host 10.199.80.11 host 10.168.36.19 eq 3389 (120 matches)
    20 permit ip any any (224095 matches)
Extended IP access list ACIS_port-channel20.126100_Out
    10 permit tcp host 10.168.36.19 host 10.199.80.11 eq 3389 (120 matches)
    20 permit ip any any (173609 matches)
```
**PLEASE NOTE** the ACL applied via Jarvis Actions with traffic you are interested in is *always* on Priority 10. Priority 20 is the "Allow ANY" rule that allows all other traffic into the interface.

Juniper:
```
Filter: ACIS_et-0/1/4.0_In                                    
Counters:
Name                                                Bytes              Packets
pkts                                               1232310               120

Filter: ACIS_et-0/1/4.0_Out                                   
Counters:
Name                                                Bytes              Packets
pkts                                               1110000               120
```
Notice we have `_In` and `_Out` ACLs here - this will show you packet counts inbound to the MSEE from the customer, and outbound from the MSEE to the customer. 


# Interpreting Results

Cisco only: 
**PLEASE NOTE** the ACL applied via Jarvis Actions with traffic you are interested in is *always* on Priority 10. Priority 20 is the "Allow ANY" rule that allows all other traffic into the interface. Every analysis example below assumes we're only concerned with these Pri 10 ACLs, unless otherwise noted:

Here are some common scenarios you might see:

* **Every ACL shows packet matches on both MSEEs**: This indicates healthy traffic inbound to and outbound from the MSEE on the customer's subinterfaces. If loss is occurring (client on-prem or in Azure sees no return traffic, etc) - it's happening downstream from the MSEE.
* **(If testing PsPing from On-Prem > Azure)`_In` ACLs show matches, but `_Out` ACLS show NO matches**: This indicates that traffic is getting inbound to Azure, but is not returning to on-prem. Check for return-path routing issues (is the customer advertising the appropriate prefixes to us? Is there a UDR overriding prefixes? etc).
* **(If testing PsPing from Azure > On-Prem) `_In` ACLs show NO matches, but `_Out` ACLs show matches**: This indicates that traffic is getting to on-prem, but is not getting back. Customer needs to work with their provider to find out why traffic isn't being routed to Azure via the ExR.
* **One MSEE shows NO matches (even on Pri 20), while the other shows good matches**: This indicates that one MSEE isn't receiving or passing any traffic. It could be offline (BGP/ARP down, etc).

# Contributors

* @<B0B19791-83EB-4561-9380-2B186BDF9BC7>
* @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78>
* @<AAD67C1A-C862-4157-995E-B930B4652CED> 
