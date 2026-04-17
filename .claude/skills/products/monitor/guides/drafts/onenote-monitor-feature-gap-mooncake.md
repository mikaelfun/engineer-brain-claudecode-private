# Azure Monitor Feature Gap: Global vs Mooncake

> Source: OneNote - Mooncake POD Support Notebook / MONITOR / Feature Gap
> Status: draft (pending SYNTHESIZE review)
> Related JSONL: monitor-onenote-067

## Alerts

| Feature | Global | Mooncake |
|---------|--------|----------|
| New alerts | GA | GA (Feb 25, 2021) |
| Metric alerts | GA | GA |
| Log alerts | GA | GA |
| Activity log alerts | GA | GA |
| Service health alerts | GA | GA |
| Resource health alerts | GA | GA |

## Metrics

| Feature | Global | Mooncake |
|---------|--------|----------|
| Platform metrics | GA | GA |
| Guest OS metrics | GA | GA |
| Application metrics | GA | GA |
| **Custom metrics** | **In Preview** | **Not available** |

## Log Analytics

| Feature | Global | Mooncake |
|---------|--------|----------|
| Virtual Machines | GA | GA |
| Windows/Linux Agent | GA | GA |
| Windows Event/Perf collection | GA | GA |
| Linux Syslog/Perf collection | GA | GA |
| Custom logs | GA | GA |
| Activity logs | GA | GA |
| OMS gateway | GA | GA |
| **Storage Account logs** | **GA** | **NA** |
| Azure resource diagnostics | GA | GA (resource-dependent) |
| Data export | GA | GA |

## Solutions

| Feature | Global | Mooncake |
|---------|--------|----------|
| ContainerInsights | GA | GA |
| Security | GA | GA |
| Update Management | GA | GA |
| **Change Tracking** | **GA** | **Partial (FIM only)** |
| LogicAppsManagement | GA | GA |
| **Service Map** | **GA** | **Not available** |

## Integration

| Feature | Global | Mooncake |
|---------|--------|----------|
| Security Center integration | GA | Yes |
| Linked Automation Account | GA | Yes |
| **SCOM integration** | **GA** | **No** |

## Insights

| Feature | Global | Mooncake |
|---------|--------|----------|
| Application Insights | GA | Yes |
| **Virtual machine insights** | **GA** | **Not available** |
| Storage account insights | GA | Yes |
| Container insights | GA | Yes |
| Resource group insights | GA | Yes |

## Key Gaps Summary

1. **Custom metrics** - Not available in Mooncake (Sinks feature not deployed)
2. **Storage Account logs** - Collection not available
3. **Service Map** - Solution not available
4. **SCOM integration** - Not supported
5. **VM Insights** - Not available
6. **Change Tracking** - Partial (Security Center FIM only)
