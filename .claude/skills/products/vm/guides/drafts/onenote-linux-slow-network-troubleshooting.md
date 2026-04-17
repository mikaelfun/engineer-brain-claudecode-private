# Linux VM Slow Network Performance Troubleshooting

**Source**: MCVKB 3.11 | **Product**: VM | **ID**: vm-onenote-136

## Scenario
Customer reports slow network performance on Linux VM(s). Azure Platform has been eliminated as cause. Expected throughput does not exceed VM size limits.

## Data Collection

1. Time in UTC (start and end of issue/test)
2. Detailed description of slow operation
3. Virtual topology info (Load Balancers, VNETs, subnets)
4. Guest OS info:
   - `uname -a` (kernel version)
   - `waagent --version` (Linux Agent version)
   - `sudo modinfo hv_vmbus` (LIS version)
5. Disk layout
6. Guest OS logs: `sudo tar -cvf /var/tmp/varlogs.tar /var/log && gzip /var/tmp/varlogs.tar`

## Troubleshooting Steps

### 1. Verify Application is Running
```bash
ps -eaf | grep -i apache | grep -v grep
```

### 2. Verify Port Binding
```bash
lsof -iTCP -sTCP:LISTEN -P -n | grep -i apache
# Or check config:
grep Listen /etc/httpd/conf/httpd.conf
# Or use netstat:
netstat -lpn | grep -i http
```

### 3. Find VM DIP
```bash
ifconfig eth0
```

### 4. Common Scenarios
- Network packets not arriving to source/destination
- TCP packet delays
- TCP Keep-Alives not used
- DNS lookups slow → application suffers
- Web page takes long time to load

## Key Checks
- Confirm application is up and listening on expected port
- Verify NSG rules allow traffic
- Check for DNS resolution issues
- Analyze TCP retransmissions with tcpdump
