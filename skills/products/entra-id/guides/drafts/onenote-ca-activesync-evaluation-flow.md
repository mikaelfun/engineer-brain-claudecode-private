# Conditional Access ActiveSync Evaluation Flow

## Summary
Exchange ActiveSync (EAS) CA policy evaluation differs significantly from standard CA evaluation. The CA policy is evaluated at **Exchange level**, not at AAD level.

## Flow
1. User types email/password in ActiveSync client (e.g., Android native mail)
2. Credentials sent to Exchange Online → Exchange calls AAD to validate password
3. AAD validates credential and generates a **successful sign-in record** (CA is skipped at this stage — by design)
4. After authentication, Exchange Online calls AAD to **check for EAS-specific CA policies**
5. If CA policy blocks the user, Exchange sends a block notification email to the client

## Key Behaviors
- **Sign-in report shows "Conditional Access not applied"** — because the sign-in record is generated before CA evaluation
- **No AAD logs for the block** — the block happens at Exchange level, not AAD
- **24-hour token cache** — Exchange may cache tokens, so users may not be blocked immediately
- **EAS doesn't support conditions** — only the client app condition itself is used. All other conditions (location, device platform, etc.) are ignored. Controls other than device compliance lead to block.

## Blocking Suspicious IPs via EXO
To block specific IPs at Exchange level:
```powershell
# Block IP ranges
Set-OrganizationConfig -IPListBlocked @{add="185.30.176.0/22","185.205.76.0/22"}

# Remove blocked IP ranges  
Set-OrganizationConfig -IPListBlocked @{remove="185.30.176.0/22","185.205.76.0/22"}
```

## Troubleshooting Tips
- If CA shows "not applied" in sign-in logs but user is blocked — check if EAS CA policy is in play
- Check Exchange-side logs for block events
- Remember the 24h cache delay

## 21V Applicability
Applicable. Same behavior in Mooncake EXO + Entra ID.
