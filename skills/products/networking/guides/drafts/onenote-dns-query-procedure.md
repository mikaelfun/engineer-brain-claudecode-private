# DNS Query Procedure and Useful Links

> Source: MCVKB/Net/7.1 DNS query procedure and useful links
> Status: draft (from OneNote)

## DNS Query Flow

Azure VM DNS queries follow CNAME chain resolution through multiple levels:
1. VM sends DNS query to Azure DNS forwarder (168.63.129.16)
2. Forwarder forwards to iDNS / Azure DNS server
3. CNAME chain is resolved through intermediate records

## Jarvis Dashboards

### DNS Forwarder Log
- **URL**: https://jarvis-west.dc.ad.msft.net/4EB6BA13
- Check DNS forwarder behavior, throttling, dropped queries

### Cloud DNS Query
- **URL**: https://jarvis-west.dc.ad.msft.net/63748810
- Check queries on cloud DNS server

### iDNS Query
- **URL**: https://jarvis-west.dc.ad.msft.net/FCC1E3F5
- Check queries on iDNS (internal DNS for VNet)

## Related Issues
- DNS forwarder throttling: 200 in-flight / 500 QPS per VM limit (see networking-onenote-019)
- iDNS hostname collision: last-started VM wins A record (see networking-onenote-018)
