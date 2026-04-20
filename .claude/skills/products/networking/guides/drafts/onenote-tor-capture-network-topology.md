---
title: TOR Capture and Network Physical Topology Guide
source: onenote
sourceRef: MCVKB/wiki_migration/======Net======/10.13[MCVKB] [Tool sharing (Everflow)] how to exec/Tor capture notes.md
product: networking
tags: [tor, everflow, kusto, paca, vpn-gateway, slb, mooncake]
21vApplicable: true
---

# TOR Capture and Network Physical Topology Guide

## Overview
Mooncake environment: use Kusto and Everflow to locate VM/VMSS physical position (T0 switch, NodeIP) for TOR-level packet capture.

## 1. Query VM T0 and NodeIP
Kusto clusters: azurecm.chinanorth2 + aznwchinamc.chinanorth2

Join chain: LogContainerSnapshot -> Servers -> DeviceInterfaceLinks -> DeviceStatic -> DeviceIpInterface
Filter by roleInstanceName contains VM_NAME
Output: Regions, Cluster, nodeId, containerId, roleInstanceName, ServerName, ServerPort, TOR, TORPort, AddressesV4

## 2. Query SLB Ring for VIP
Cluster: azslbmc, Database: azslbmdsmc
Table: VipRangesSnapshotEvent - filter by ipv4_is_in_range(VIP, VipRange)
Output: VipRange, RingName, env_cloud_roleInstance, NextHop

## 3. Query SLB MUX PA
Table: BgpPeerStateSnapshotEvent - filter by Ring
Output: MuxIP, Ring, Node, PeerIP, PeerName, Asn

## 4. Everflow Portal
- Beijing: https://bjs01n.netperf.chinacloudapi.cn/toposervice/web/everflow.html
- Shanghai: https://sha01n.netperf.chinacloudapi.cn/toposervice/Web/everflow.html

## 5. Geneva Links
- Paca mapping: 15600EE7
- Process tuple format: 6|17 SrcIP SRCPORT DSTIP DSTPORT OUT 1 (portal C1C8EE35)
- Unified flow: C2989437
