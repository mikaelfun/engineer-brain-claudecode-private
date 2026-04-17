# MMA Deprecation Timeline in Mooncake

> Source: OneNote - Mooncake POD Support Notebook / MONITOR / Log Analytics agent (MMA_OMS) / Deprecation plan by 5_11
> Status: draft (pending SYNTHESIZE review)
> Related JSONL: monitor-onenote-069

## Timeline Summary (as of April 2024)

| Event | Date | Notes |
|-------|------|-------|
| Global MMA deprecation announced | August 2024 | Original global timeline |
| **Mooncake MMA extended support** | **October 2024** | Extended from Aug 2024 |
| AMA for MDC | N/A | **Not GA for MDC** - agentless approach instead |
| Agentless (MDE-based) | No ETA for Mooncake | Depends on MDE availability |
| Agentless (MDVM-based) | No ETA | VA, security baselines |
| Agentless (sole) | FY25 | Secrets scanning, EPP recommendations |

## Key Decisions

1. **AMA is NOT going to be GA for Microsoft Defender for Cloud (MDC)** - PG confirmed this is due to agentless efforts
2. **This does NOT affect AMA for Azure Monitor** - the change is solely applicable to MDC
3. **Recommendation for MDC customers**: Stay with MMA until deprecation; transition to agentless when available

## Mooncake-Specific Impact

- MDfC features depending on **MDE**: available gradually in Mooncake according to MDE plan, no ETA
- MDfC features depending on **MDVM**: available gradually, no ETA (VA, security baselines)
- MDfC features depending on **agentless solely**: FY25 (secrets scanning, EPP recommendations)

## Concern

The new agentless feature availability timeline is LATER than the MMA deprecation date, creating a potential gap for Mooncake MDfC customers where neither MMA nor agentless alternatives are fully available.

## PG Contacts

- Gal Fenigshtein (gfenigshtein@microsoft.com) - MDC agentless availability
- Eli Sagie (Eli.Sagie@microsoft.com) - MDC strategy
- Giulio Astori (gastori@microsoft.com) - Principal PM C+AI Security CxE
