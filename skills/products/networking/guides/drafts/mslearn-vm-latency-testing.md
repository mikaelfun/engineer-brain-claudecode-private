# VM Network Latency Testing

> Source: [Test network latency between Azure VMs](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-test-latency)

## Overview

Use dedicated tools (not Ping/ICMP) to measure TCP/UDP network latency between Azure VMs.

## Recommended Tools

| OS | Tool | Protocol |
|----|------|----------|
| Windows | [Latte](https://github.com/microsoft/latte) | TCP/UDP |
| Linux | [SockPerf](https://github.com/mellanox/sockperf) | TCP/UDP |

**Why not Ping?** Ping uses ICMP which is deprioritized by Azure networking. TCP/UDP tools provide results that match actual application performance.

## Best Practices for Low Latency

- Enable **Accelerated Networking** on VMs
- Deploy VMs in **Azure Proximity Placement Group**
- Use latest OS version
- Use larger VM sizes

## Windows — Latte

```cmd
# Receiver:
latte -a <receiver-IP>:<port> -i 65100

# Sender:
latte -c -a <receiver-IP>:<port> -i 65100
```

Firewall rule needed on receiver:
```cmd
netsh advfirewall firewall add rule program=c:\tools\latte.exe name="Latte" protocol=any dir=in action=allow enable=yes profile=ANY
```

## Linux — SockPerf

Install:
```bash
git clone https://github.com/mellanox/sockperf
cd sockperf/ && ./autogen.sh && ./configure --prefix= && make && sudo make install
```

Run:
```bash
# Receiver:
sudo sockperf sr --tcp -i <receiver-IP> -p 12345

# Sender:
sockperf ping-pong -i <receiver-IP> --tcp -m 350 -t 101 -p 12345 --full-rtt
```

## Testing Methodology

1. Take baseline measurements after deployment
2. Test effects of configuration changes (Accelerated Networking, VM size, PPG)
3. Compare new results to baseline
4. Repeat tests whenever changes are deployed
