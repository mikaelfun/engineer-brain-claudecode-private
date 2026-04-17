# Accelerated Networking Diagnostics

> Source: MCVKB 3.3 | Author: Lina Guo | Updated: 2019-11

## Architecture

With SR-IOV (Accelerated Networking) enabled:
- **Control plane** packets still pass through vSwitch
- **Data plane** packets bypass vSwitch via FPGA GFT component

## Jarvis Dashboards

### 1. Inbound/Outbound Traffic for AccelNet NIC

Use **vfpPortGftMetrics** namespace to monitor per-port traffic:
- Filter by: MacAddress, Node, Container
- Achieves per-port monitoring for AccelNet NICs

### 2. Verify GFT Flow Offloading on FPGA

Check if GFT component on FPGA is offloading flows (cluster-level).

### 3. Verify GFT Offloading for Specific VM

Check GFT offloading for a specific VM on a physical node.

## Key Points

- AccelNet uses SR-IOV to bypass vSwitch for data plane
- Must use GFT metrics (not standard vSwitch metrics) for monitoring
- vfpPortGftMetrics namespace is the key data source
