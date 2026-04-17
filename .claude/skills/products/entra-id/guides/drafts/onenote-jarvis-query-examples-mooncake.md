# Jarvis Query Examples for Mooncake (EvoSTS / MSODS)

> Source: OneNote - Troubleshooting Tools/General Tools/Jarvis query example

## EvoSTS Authentication Trace Logs

### PerRequestTableIfx (Authentication Request Logs)

- Endpoint: `CA Mooncake`
- Namespace: `AadEvoSTSCHINA`
- Event: `PerRequestTableIfx`
- Filter: `Tenant contains "<tenant-id>"`
- Sort: `orderby env_time asc`

### Key Columns

| Column | Description |
|--------|-------------|
| `UserAuth` | Filter `== True` for user authentication events |
| `ITData` | Input token data (refresh token, password, etc.) |
| `OTData` | Output token data (access token, ID token, refresh token) |

### OTData Token Decoding

Format: `TokenType,ValidFrom,ValidUntil,AuthTime,ResourceId,...`

Example entry with 3 tokens:
```
1|ClientAndUserJsonWebToken,2019-02-02T01:05:17Z,2019-02-02T02:10:17Z,...
|UnsignedIdToken,,2019-02-02T02:10:17Z,...
|RefreshToken,2019-02-02T01:10:17Z,2019-02-16T01:10:17Z,...
```

| Token Type | Valid From | Valid Until | Notes |
|-----------|-----------|------------|-------|
| Access Token | T-5min (before auth) | +1h | Starts 5 min before authentication time |
| ID Token | Auth time | +1h | |
| Refresh Token | Auth time | +14 days | Renewed if used within 14 days, max 90 days |

## MSODS Audit Logs

> Since 2020/04/20, logs in msodsgallatin are split into different namespaces.
> Must select **all namespaces starting with `msods`**.

- For audit operations (user changes, directory modifications), use MSODS namespace.
- Filter by Tenant ID or object ID.

## Tips

- Use short time ranges for precise investigation.
- Combine ITData + OTData analysis to trace token lifecycle.
- For token refresh chain analysis, look for RefreshToken in both ITData (input) and OTData (output).
