# ADFS/WAP ETL Trace Collection and Analysis

> Source: Mooncake POD Support Notebook - ADFS and WAP Case Study
> Quality: draft | Needs: cleanup, script attachment

## Overview

Script-based trace collection for ADFS and WAP troubleshooting when customers cannot install third-party tools (Fiddler, Network Monitor) on production servers.

## Collected Artifacts

| File | Description |
|------|-------------|
| `adfs.etl` | Every request received by ADFS server, including claim rules processing |
| `wap.etl` | WAP Server acting as normal application proxy (WAP server only) |
| `mino_http.etl` | HTTP-level request details (can be decoded directly by Insight client) |
| `http_service.txt` | Listening endpoints |
| `http_sslcert.txt` | SSL certificate bindings |
| `nettrace.etl` | Network Monitor trace |

## Collection Steps

1. Download script to server, rename to `.bat`
2. Right-click → Run as Admin
3. Reproduce the issue
4. Press any key in CMD to stop capture
5. Output saved to `C:\AdfsWapTrace`

## Analysis Notes

- `adfs.etl` cannot be decoded by local Insight client. Must copy to ADFS server and use:
  ```cmd
  netsh trace convert input=adfs.etl output=adfs.txt
  ```
  Or install Insight client on ADFS server.
- Recommended viewer: **TextAnalysisTool.NET** (included in Insight client)
- `mino_http.etl` can be opened directly in local Insight client
- `nettrace.etl` → Network Monitor

## Relationship to Other Guides

- Related to ADFS debug logging guide (entra-id-onenote-007): Debug logs are event-based; ETL traces provide deeper HTTP/protocol-level visibility
- ETL traces are especially useful when debug logs alone are insufficient or when HTTP-level analysis is needed
