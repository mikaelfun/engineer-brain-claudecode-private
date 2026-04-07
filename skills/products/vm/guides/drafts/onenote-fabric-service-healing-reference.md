# Azure Service Healing (Auto-Recovery) Reference

**Source**: MCVKB 5.3 | **Product**: VM | **ID**: vm-onenote-141

## Overview
Service Healing is Azure's auto-recovery mechanism for virtual machines. Enabled across all VM sizes, offerings, and regions.

## Health Check Layers

### Layer 1: Role Instance (PaaS only)
- Load balancer pings web endpoint every **15 seconds**
- Consecutive failures → remove from rotation, mark unhealthy

### Layer 2: Guest Agent
- Guest agent health check every **15 seconds**
- Failure → restart role instance

### Layer 3: Virtual Machine
- Host Agent pings Guest Agent every **15 seconds**
- Allows up to **10 minutes** for VM to respond before recovery action
- Recovery for Web/Worker Role: recycle VM with clean OS disk
- Recovery for IaaS VM: **reboot** (preserving disk state)
- **Note**: IaaS VMs health checked via hypervisor state (no automatic guest agent injection)

### Layer 4: Physical Server
- Fabric Controller performs periodic health checks via Host Agent
- Consecutive failures → **reboot** physical server
- If still unhealthy → **live-migrate** VMs to different healthy server
- Failed server → taken out of rotation → sent for diagnosis/repair

## Key Metrics
- **MTTD** (Mean Time to Detect): Health checks at 15-second intervals
- **MTTR** (Mean Time to Recovery): Varies by failure layer

## Predictive Failure Detection
- Host Agent collects hardware health info (disk bad sectors, memory errors, performance counters)
- Heuristics predict imminent failures
- Preventive VM migration before failure occurs

## Big Data Analytics
- Terabytes of diagnostic logs analyzed via Cosmos (map-reduce)
- Pattern identification in failures → bug fixes and feature improvements
