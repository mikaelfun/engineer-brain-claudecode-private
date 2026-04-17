# ADFS Publish to Extranet via WAP (Lab Setup)

> Source: OneNote POD Notebook — ADFS Case Study
> Status: draft

## Overview

Steps to publish ADFS to be accessible from external network using WAP (Web Application Proxy) on VMAS lab environment.

## Prerequisites

1. Internet-facing VMAS accessible from external network
2. Personal public domain name (provided after VMAS apply)
3. Independent public IP address (provided after VMAS apply)
4. Public SSL certificate for ADFS service

## Key Configuration Notes

- AD domain and public domain can differ (e.g., AD: atlas.com, Public: v-atliu.msftonlinelab.com)
- ADFS service name must use public domain suffix for DNS resolution
- VMAS workspace has one independent public IP shared by all VMs
- Use port mapping to redirect extranet traffic to WAP server

## Steps

1. Finish basic setup: DC, ADFS server, AAD Connect server, WAP server
2. Contact VMAS support team (CNVMASSPRT@microsoft.com) to:
   - Create A record for public IP → public domain
   - Configure port mapping:

| VM Name | VM Private IP | Protocol | Port |
|---------|--------------|----------|------|
| WAP | 192.168.x.x | TCP/UDP | 443 |
| WAP | 192.168.x.x | TCP/UDP | 80 |
| WAP | 192.168.x.x | TCP | 49443 |

## References

- [Best practices for securing AD FS](https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/deployment/best-practices-securing-ad-fs)
