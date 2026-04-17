# B2C CPIM Troubleshooting - Jarvis & Kusto (Mooncake)

> Source: OneNote - B2C Troubleshooting Jarvis/Kusto pages
> Status: draft

## Jarvis

- Jarvis endpoint example: https://jarvis-west.dc.ad.msft.net/13A915B2
- Filter by: B2C tenant name or correlationID from error message
- Check `resultdescription` field for error details

## Kusto

- CPIM Kusto cluster (Mooncake): `https://cpimmcprod.kusto.chinacloudapi.cn`
- Project access: CpimMC Kusto Viewers (ID: 20902)
- Database: CPIM
- See Jarvis tables for reference on available tables and filtering

## Usage

1. Get correlationID from B2C error response (x-ms-cpim-trans header or error page)
2. Search Jarvis logs using tenant name or correlationID
3. Check resultdescription for root cause
4. For deeper analysis, query CPIM Kusto cluster with correlation ID
