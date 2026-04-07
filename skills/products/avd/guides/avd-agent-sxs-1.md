# AVD AVD Agent 与 SxS Stack (Part 1) - Quick Reference

**Entries**: 15 | **21V**: all applicable
**Keywords**: agent, broker, dns, dotnet, endpoint, event-3019, event-3277, event-3389
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Event ID 3277 with INVALID_FORM - agent cannot connect to broker | Firewall or DNS settings blocking broker endpoints (BrokerResourceIdURI and Brok... | Verify connectivity to broker endpoints by checking registry keys under HKLM:\SO... | 🟢 8.0 | MS Learn |
| 2 📋 | Event ID 3703 - 'RD Gateway Url is not accessible'; agent unable to reach gatewa... | Firewall or proxy blocking required AVD gateway URLs | Unblock required URLs from Safe URL List. Run Required URL Check tool. For Azure... | 🟢 8.0 | MS Learn |
| 3 📋 | Event ID 3277 with ENDPOINT_NOT_FOUND - broker can't find endpoint to connect | No active session host VMs in host pool, or all exceeded max session limit, or a... | Verify VM is powered on and not removed from host pool; check max session limit ... | 🟢 8.0 | MS Learn |
| 4 📋 | RDAgentBootLoader or Remote Desktop Agent Loader stopped running on session host... | Boot loader unable to install agent properly; agent service not running | Start Remote Desktop Agent Loader service via Services console. If it stops afte... | 🔵 7.0 | MS Learn |
| 5 📋 | Event ID 3277 with INVALID_REGISTRATION_TOKEN or EXPIRED_MACHINE_TOKEN in Applic... | Registration key is expired or invalid | Generate new registration key, update registry (HKLM:\SOFTWARE\Microsoft\RDInfra... | 🔵 7.0 | MS Learn |
| 6 📋 | Event ID 3019 - agent can't reach web socket transport URLs | Network blocking web socket transport URLs required by AVD | Unblock URLs from Safe URL List. Check network trace logs to identify where AVD ... | 🔵 7.0 | MS Learn |
| 7 📋 | Event ID 3277 with InstallationHealthCheckFailedException - stack listener not w... | Terminal server toggled registry key for stack listener, disabling it | Check if stack listener is working; if not, manually uninstall and reinstall the... | 🔵 7.0 | MS Learn |
| 8 📋 | Session host VMs stuck in Upgrading or Unavailable state | Agent or side-by-side stack didn't install successfully | Reinstall SxS network stack: stop RDAgentBootLoader, uninstall SxS Network Stack... | 🔵 7.0 | MS Learn |
| 9 📋 | The issue experienced is lack of session connectivity to the AVD Session Hosts a... | For an issue like this, there could be multiple causes:  Unsupported SKUs: AVD d... | Taking into account the possible causes for this issue written above, let's take... | 🔵 6.5 | KB |
| 10 📋 | -&gt; Customer had the below error message suddenly every time customer tries to... | RdpAvenc.dll&nbsp;was broken and causing the connection error | Re-installed SXS-Stack as below documentation and issue was resolvedhttps://dev.... | 🔵 6.5 | KB |
| 11 📋 | Abstract  WindowsApp for iOS dose not recognize 106 Japanese Keyboard.   Symptom... | From Bug 57670273: [iOS] WindowsApp for iOS dose not recognize 106 Japanese Keyb... | Change the following registry. HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Contr... | 🔵 6.5 | KB |
| 12 📋 | Abstract  Windows App that version is&nbsp;2.0.704.0 crashes at the boot time.Th... | This symptom is investigating the IcM&nbsp;that is&nbsp;https://portal.microsoft... | The fixed version of Windows AppThis problem has been fixed in the version 2.0.7... | 🔵 6.5 | KB |
| 13 📋 | Event ID 3389 with MissingMethodException during agent update - agent reverts to... | .NET Framework version installed on VM is lower than 4.7.2 | Upgrade .NET Framework to version 4.7.2 or later | 🔵 6.5 | MS Learn |
| 14 📋 | Multiple AVD session hosts become unhealthy simultaneously across several host p... | Network connectivity disruption between session hosts and AVD RDBroker WebSocket... | 1) Reboot affected session hosts to recover immediately. 2) Ensure firewall/prox... | 🔵 6.0 | OneNote |
| 15 📋 | Event ID 3277 with InstallMsiException - agent installer fails | Another MSI installer already running, or Group Policy blocking msiexec.exe (Win... | Wait for other installer to finish, or check RSOP for 'Turn off Windows Installe... | 🔵 6.0 | MS Learn |

## Quick Triage Path

1. Check: Firewall or DNS settings blocking broker endpoints `[Source: MS Learn]`
2. Check: Firewall or proxy blocking required AVD gateway UR `[Source: MS Learn]`
3. Check: No active session host VMs in host pool, or all ex `[Source: MS Learn]`
4. Check: Boot loader unable to install agent properly; agen `[Source: MS Learn]`
5. Check: Registration key is expired or invalid `[Source: MS Learn]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-agent-sxs-1.md#troubleshooting-flow)
