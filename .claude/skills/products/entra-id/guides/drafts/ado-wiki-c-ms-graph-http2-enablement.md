---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/Microsoft Graph HTTP2 Enablement"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20API%2FMicrosoft%20Graph%20HTTP2%20Enablement"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Graph HTTP/2 Enablement

## Summary

On September 15, 2023, MS Graph engineering added HTTP/2 support on `graph.microsoft.com`. HTTP/2 is backwards compatible, requiring opt-in to take advantage of new capabilities. HTTP/2 is only used when both client and service negotiate mutual support.

## Key Differences from HTTP/1.x

- HTTP/2 is binary (not text-based)
- Fully multiplexed - one connection for parallelism
- Single TCP/IP connection
- Header compression to reduce overhead
- Header field names must be lower-cased before encoding (per HTTP/2 spec)

## Important Notes

- No security issues with HTTP/1.1; ~90% of clients continue using it
- No plans to remove HTTP/1.1 support
- When validating HTTP/2, pay specific attention to custom parsing and evaluation of HTTP headers (case-sensitivity of header field names)
