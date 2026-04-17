# Dynamic Group Processing — Pause & Resume Guide

source: mslearn | url: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/dir-dmns-obj/troubleshoot-dynamic-group-processing

## When to Pause

- Slow membership updates affecting many groups
- Unexpected/unintended membership changes after attribute updates
- Significant change rollouts (e.g., bulk device updates triggering mass re-evaluation)

## Scripts (from GitHub)

| Script | Purpose |
|--------|---------|
| Pause All Groups | Pauses all dynamic group processing in tenant |
| Pause Specific Groups | Pauses processing for specified groups only |
| Pause All Except Some | Pauses all groups except specified critical ones |
| UnPauseSpecificCritical | Resumes processing for specified critical groups |
| UnPauseNonCritical | Resumes processing for non-critical groups, 100 at a time |

GitHub repo: https://github.com/barclayn/samples-dynamic-group/tree/main

## Prerequisites
- Account with `microsoft.directory/groups/allProperties/update` permission
- For applications: `Group.ReadWrite.All` permission
- Entra ID PowerShell module

## Resume Strategy
1. **Wait at least 12 hours** before resuming (allow service recovery)
2. Resume critical groups first (`unPauseSpecificCritical.ps1`)
3. Then resume remaining groups in batches (`UnPauseNonCritical` — 100 groups at a time)
4. Microsoft Support can only help resume after 12-hour wait

## Key Facts
- Dynamic membership changes usually process within hours
- Can take >24h depending on: tenant size, group size, attribute changes, rule complexity
- CONTAINS, MATCH, MemberOf operators are slower
