# Monitor 监控 DNS 配置

**Entries**: 2 | **21V**: PARTIAL | **Sources**: 2
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Intermittent availability test DNS resolution failures (NameResolutionFailure... | Transient DNS failures from UDP-based resolution across public internet. Fail... | Check failure ratio vs total tests (e.g., 10/10080 = 0.1%). Review DNS TTL an... | 8.5 | ADO Wiki |
| 2 | DNS solution deployed to Log Analytics workspace successfully but DNS tables ... | Table creation is not defined in the ARM template, or Windows DNS Events via ... | 1) Verify ARM template includes table definition; 2) Check Windows DNS Events... | 4.5 | MS Learn |

> This topic has fusion troubleshooting guide with detailed workflow
> [Full troubleshooting workflow](details/network-dns.md)
