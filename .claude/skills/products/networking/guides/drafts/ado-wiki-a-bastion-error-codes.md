---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Bastion/Error Codes"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FError%20Codes"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## Description
Azure Bastion Error Codes — reference table for client/tunnel/upload errors.

## Error Codes

| Code | Message |
|------|---------|
| ERROR_CLIENT_201 | Bastion Host is busy. Wait a few minutes and try again. |
| ERROR_CLIENT_202 | Target machine taking too long to respond (timeout). |
| ERROR_CLIENT_203 | Target machine encountered an error and closed the connection. |
| ERROR_CLIENT_207 | Target machine unreachable or credentials incorrect. |
| ERROR_CLIENT_208 | Target machine currently unavailable. |
| ERROR_CLIENT_209 | Connection conflict with another connection. |
| ERROR_CLIENT_20A | Connection closed due to inactivity. |
| ERROR_CLIENT_20B | Target machine forcibly closed the connection. |
| ERROR_CLIENT_301 | Login failed — reconnect and try again. |
| ERROR_CLIENT_303 | Target machine denied access — check account permissions. |
| ERROR_CLIENT_308 | Browser appeared disconnected (network issue / slow connection). |
| ERROR_CLIENT_31D | User has exhausted simultaneous connection limit. |
| ERROR_CLIENT_DEFAULT | Internal Bastion Host error. |
| ERROR_CLIENT_PORTAL | Session must be initiated from Azure Portal. |
| ERROR_TUNNEL_201 | Too many active connections — wait and retry. |
| ERROR_TUNNEL_202 | Target machine taking too long to respond (network issue). |
| ERROR_TUNNEL_203 | Server error — retry or contact admin. |
| ERROR_TUNNEL_204 | Requested connection does not exist — check connection name. |
| ERROR_TUNNEL_205 | Connection in use; concurrent access not allowed. |
| ERROR_TUNNEL_207 | Bastion Host not reachable — check network. |
| ERROR_TUNNEL_208 | Bastion Host not accepting connections — check network. |
| ERROR_TUNNEL_301 | Not logged in — log in and retry. |
| ERROR_TUNNEL_303 | No permission for this connection — check allowed users. |
| ERROR_TUNNEL_308 | Connection closed (browser appeared disconnected). |
| ERROR_TUNNEL_31D | Simultaneous connection limit exhausted. |
| ERROR_TUNNEL_DEFAULT | Internal Bastion Host error — notify admin or check logs. |
| ERROR_UPLOAD_100 | File transfer not supported or not enabled. |
| ERROR_UPLOAD_201 | Too many concurrent file transfers. |
| ERROR_UPLOAD_202 | Target machine taking too long (file transfer timeout). |
| ERROR_UPLOAD_203 | Target machine error during transfer. |
| ERROR_UPLOAD_204 | Transfer destination does not exist. |
| ERROR_UPLOAD_205 | Destination locked — wait for in-progress tasks. |
| ERROR_UPLOAD_301 | Not logged in for file upload. |
| ERROR_UPLOAD_303 | No permission to upload — check system settings. |
| ERROR_UPLOAD_308 | File transfer stalled (network issue). |
| ERROR_UPLOAD_31D | Too many files being transferred. |
| ERROR_UPLOAD_DEFAULT | Internal Bastion Host error during file transfer. |
