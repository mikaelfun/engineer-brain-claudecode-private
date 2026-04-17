# VM Network Bandwidth/Throughput Testing with NTTTCP

> Source: [Test VM network throughput using NTTTCP](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-bandwidth-testing)

## Overview

Use Microsoft NTTTCP tool to test network bandwidth between Azure VMs. Minimizes non-network resource usage for accurate results.

## Prerequisites

- Two VMs of **same size** in same proximity placement group or availability set
- Use **internal IP addresses** (exclude load balancers from test)
- Note VM core count for thread calculation: `threads = cores x 2`

## Windows

```cmd
# Install: Download ntttcp.exe from https://github.com/microsoft/ntttcp/releases/latest

# Firewall rule on receiver:
netsh advfirewall firewall add rule program=c:\tools\ntttcp.exe name="ntttcp" protocol=any dir=in action=allow enable=yes profile=ANY

# Receiver (300s test):
ntttcp -r -m [cores x 2],*,<receiver-IP> -t 300

# Sender:
ntttcp -s -m [cores x 2],*,<receiver-IP> -t 300
```

## Linux

```bash
# Install:
git clone https://github.com/Microsoft/ntttcp-for-linux
cd ntttcp-for-linux/src && sudo make && sudo make install

# Receiver:
ntttcp -r -m [cores x 2],*,<receiver-IP> -t 300

# Sender:
ntttcp -s -m [cores x 2],*,<receiver-IP> -t 300
```

## Cross-Platform (Windows ↔ Linux)

Enable no-sync mode:
- Windows: add `-ns` flag
- Linux: add `-N` flag

## Tips

- Start with short 10s test to verify setup
- Run 300s for accurate results
- Check output for throughput (MB/s), retransmits, and CPU usage
