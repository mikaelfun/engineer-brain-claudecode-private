# SyncML Response Status Codes Reference

Source: MCVKB/Intune/Windows/SyncML response status code.md

## Success Codes (1xx-2xx)

| Code | Name | Description |
|------|------|-------------|
| 101 | IN_PROGRESS | Operation in progress |
| 200 | OK | Success |
| 201 | ITEM_ADDED | Item added successfully |
| 202 | FOR_PROCE | Accepted for processing |
| 204 | NO_CONTENT | No content returned |
| 205 | RESET_CONTENT | Reset content |
| 206 | PARTIAL_CONTENT | Partial content |
| 207 | CONFLICT_RESOLVED_WITH_MERGE | Conflict resolved via merge |
| 208 | CONFLICT_RESOLVED_WITH_CLIENTS_COMMAND_WINNING | Client command wins |
| 209 | CONFLICT_RESOLVED_WITH_DUPLICATE | Resolved with duplicate |
| 210 | DELETE_WITHOUT_ARCHIVE | Deleted without archiving |
| 211 | ITEM_NOT_DELETED | Item was not deleted |
| 212 | AUTHENTICATION_ACCEPTED | Auth accepted |
| 213 | CHUNKED_ITEM_ACCEPTED | Chunked item accepted |
| 214 | OPERATION_CANCELLED | Operation cancelled |
| 215 | NOT_EXECUTED | Not executed |
| 216 | ROLL_BACK_OK | Rollback successful |

## Redirect Codes (3xx)

| Code | Name |
|------|------|
| 300 | MULTIPLE_CHOICES |
| 301 | MOVED_PERMANENTLY |
| 302 | FOUND |
| 303 | SEE_ANOTHER_URI |
| 304 | NOT_MODIFIED |
| 305 | USE_PROXY |

## Client Error Codes (4xx) - Most Common in Troubleshooting

| Code | Name | Notes |
|------|------|-------|
| 400 | BAD_REQUEST | Invalid request format |
| 401 | INVALID_CREDENTIALS | Auth failure |
| 403 | FORBIDDEN | Access denied |
| **404** | **NOT_FOUND** | **CSP node does not exist - very common** |
| 405 | COMMAND_NOT_ALLOWED | Command not supported for this node |
| 406 | OPTIONAL_FEATURE_NOT_SUPPORTED | Feature not available |
| 408 | REQUEST_TIMEOUT | Request timed out |
| 409 | CONFLICT | Conflict detected |
| **418** | **ALREADY_EXISTS** | **Node already exists (Add fails)** |
| 419 | CONFLICT_RESOLVED_WITH_SERVER_DATA | Server data wins |
| 420 | DEVICE_FULL | Device storage full |
| 425 | PERMISSION_DENIED_ACL | ACL permission denied |

## Server Error Codes (5xx)

| Code | Name | Notes |
|------|------|-------|
| **500** | **COMMAND_FAILED** | **Generic command failure** |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |
| **507** | **ATOMIC_FAILED** | **Atomic transaction failed** |
| 508 | REFRESH_REQUIRED | Refresh needed |
| **516** | **ATOMIC_ROLLBACK_FAILED** | **Atomic rollback also failed** |
| 517 | ATOMIC_RESPONSE_TOO_LARGE | Response too large |

## Common Troubleshooting Patterns

- **418 + 404 in Sequence**: PauseQualityUpdates Add returns 418 (AlreadyExists), then Rollback returns 404 (NotFound) - indicates rollback prerequisites not met
- **500 for policy delivery**: Check if CSP URI is correct and supported on device OS version
- **405**: Command type (Add vs Replace) mismatch for the target CSP node
