# MS Tunnel VPN Network Trace per User Session

## Prerequisites
- Access to MS Tunnel Gateway server(s) (Red Hat Linux)
- Affected user's Object ID from Entra ID portal

## Method 1: mst-cli (Preferred)

1. Get user Object ID from Microsoft Entra ID portal
2. User connects to MTG VPN (confirm Connected state)
3. On **each** MTG server, find the server handling the connection:
   ```bash
   mst-cli server show user <object-ID>
   ```
4. Locate IPv4 address from output
5. Start capture:
   ```bash
   mst-cli server capture <client-ip> ./Net_date.pcap
   ```

## Method 2: Manual (if mst-cli has issues)

1. Get user Object ID
2. Get client IP:
   ```bash
   mst-cli server show user <object-ID>
   ```
3. Enter the container:
   ```bash
   podman exec -it mstunnel-server bash
   ```
4. Find the VPN sub-interface:
   ```bash
   occtl show users | grep "<client-IP>" | awk '{print $6}'
   ```
5. Capture traffic:
   ```bash
   tcpdump -i <interfaceName> -w <file.name>
   ```
6. Copy file out of container:
   ```bash
   podman cp mstunnel-server:<capture-file> <destination-folder>
   ```

## Reference
- [Red Hat Enterprise Linux 8 Documentation](https://access.redhat.com/documentation/zh-cn/red_hat_enterprise_linux/8)

## Source
- OneNote: Linux/Capture Network Trace based on User Session
