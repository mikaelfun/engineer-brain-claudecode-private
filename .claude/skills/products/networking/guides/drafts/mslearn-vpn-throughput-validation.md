# VPN Throughput Validation Guide

> Source: [How to validate VPN throughput to a virtual network](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-validate-throughput-to-vnet)

## Throughput Calculation

Expected throughput = min(VM throughput, VPN Gateway SKU limit, ISP bandwidth)

1. Determine application baseline throughput requirements
2. Check [VPN Gateway SKU throughput limits](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways#gwsku)
3. Check [Azure VM throughput by size](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes)
4. Check ISP bandwidth
5. Bottleneck = component with lowest bandwidth → upgrade that component

**Note**: VPN Gateway throughput is aggregate of ALL S2S/VNet-to-VNet/P2S connections.

## Testing Tools

### iPerf (Cross-platform, up to 3 Gbps on Windows)

**Setup:**
```cmd
# Open firewall port
netsh advfirewall firewall add rule name="Open Port 5001" dir=in action=allow protocol=TCP localport=5001

# Server side
iperf3.exe -s -p 5001

# Client side (32 parallel connections, 30 seconds)
iperf3.exe -c <Server-IP> -t 30 -p 5001 -P 32

# Save results
iperf3.exe -c <Server-IP> -t 30 -p 5001 -P 32 >> output.txt

# Cleanup
netsh advfirewall firewall delete rule name="Open Port 5001" protocol=TCP localport=5001
```

### Latte (Windows latency testing)

```cmd
# Receiver
latte -a <ReceiverIP>:<port> -i 65100

# Sender
latte -c -a <ReceiverIP>:<port> -i 65100
```

### SockPerf (Linux latency testing)

```bash
# Install (Ubuntu)
sudo apt-get install build-essential git autotools-dev automake -y
git clone https://github.com/mellanox/sockperf && cd sockperf
./autogen.sh && ./configure --prefix= && make && sudo make install

# Server
sudo sockperf sr --tcp -i <ServerIP> -p 12345 --full-rtt

# Client
sockperf ping-pong -i <ServerIP> --tcp -m 1400 -t 101 -p 12345 --full-rtt
```

## Important Notes

- Test during **non-peak hours** — saturation skews results
- Test **both directions** (reverse client/server roles)
- Ensure no NVA between VM and gateway during testing
- NSG/ACL must allow test port traffic
- For poor results, see [TCP/IP performance tuning for Azure VMs](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-tcpip-performance-tuning)

## Slow File Copy Troubleshooting

Even with good throughput test results:
- **Single-threaded copy** (Windows Explorer, RDP drag-drop): Use multi-threaded tools like Richcopy (16-32 threads)
- **Disk I/O bottleneck**: Check VM disk read/write speeds

## Latency Diagnostics

- Tools: WinMTR, TCPTraceroute, ping, psping
- High latency before MS Network backbone → investigate with ISP
- High latency within msn.net hops → contact MS support
