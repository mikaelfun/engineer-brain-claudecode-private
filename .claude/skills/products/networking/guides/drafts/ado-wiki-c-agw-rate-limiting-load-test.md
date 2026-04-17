---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/WAF for Application Gateway/How To/AGW Rate Limiting"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FHow%20To%2FAGW%20Rate%20Limiting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Simulating HTTP Requests for Load Testing (AGW Rate Limiting)

This guide is intended for testing in **your** own environment to better understand or monitor autoscaling or rate-limiting on resources that offer those features.  

## Installing Apache Benchmark

Installation commands for most Linux machine:
```bash
Debian: sudo apt install apache2-utils -y
Red Hat: sudo dnf install httpd-tools -y
Others: sudo yum install httpd-tools -y
```
> Common Linux Distros
> - Debian: Ubuntu, Mint, Kali  
> - Red Hat: CentOS, Rocky, Fedora  

## Test Environment Setup

In this environment using a Client, Application Gateway V2 WAF with rate-limiting, and a VM backend target. Application Gateway used in testing was created following these guides:
- [Create Application Gateway](https://learn.microsoft.com/en-us/azure/application-gateway/quick-create-portal)
- [Create WAF Policy](https://learn.microsoft.com/en-us/azure/web-application-firewall/ag/create-waf-policy-ag)
- [Create Rate-Limiting Rules](https://learn.microsoft.com/en-us/azure/web-application-firewall/ag/rate-limiting-configure?tabs=browser)

## Testing Script

```bash
#!/bin/bash

clear
date

read -p "Enter # of total requests: " numrequests
read -p "Enter # of parallel requests: " numconcur
read -p "Using HTTPS? (Y/Yes): " confirm
read -p "Enter IP address or hostname(www.contoso.com): " strhost

PROTO=""
if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        PROTO="https"
else
        PROTO="http"
fi

ab -n $((numrequests)) -c $((numconcur)) -rk $PROTO://$strhost/
```

**Interpreting results:**
- `Failed Requests: 0` — all requests succeeded
- `Non-2xx responses: 50` — rate limiting was triggered on AppGW (WAF returned 429 or 403)
- Verify with AppGW metrics in portal

## Uninstall Apache Benchmark

```bash
Debian: sudo apt auto-remove apache2-utils -y
RedHat: sudo dnf autoremove httpd-tools -y
Others: sudo yum autoremove httpd-tools -y
```

## Tools and References

**Apache Benchmark (ab)** — https://httpd.apache.org/docs/2.4/programs/ab.html

Common `ab` options:
- `-n` — number of requests
- `-c` — number of parallel requests
- `-p` — file with data for POST
- `-T` — content-type
- `-r` — don't exit on socket error
- `-k` — enable HTTP keepalive

Example: `ab -n 1000 -c 10 -p ./generated.json -T application/json -rk https://appgw.example.com/`

**WSL (Windows Subsystem for Linux)** — https://learn.microsoft.com/en-us/windows/wsl/install
