---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Azure AD _ Ms Entra ID/Troubleshooting Tools/Device Reg & Join/AuthLog.md"
sourceUrl: null
importDate: "2026-04-21"
type: guide-draft
---

# AuthLog Collection for Device Registration and Join Troubleshooting

## Regular Auth Logs

1. Download auth scripts from https://aka.ms/authscripts (usage: KB4487175)
2. Launch elevated admin PowerShell, navigate to script folder
3. Start tracing: Start-auth.ps1 -verbose -acceptEULA
4. Switch Account to problem user session
5. Lock and Unlock device (Hybrid joined: wait ~1 min for PRT acquisition)
6. Switch Account back to admin session
7. Stop tracing: stop-auth.ps1 (wait for all tracing to stop)
8. Zip and upload authlogs folder to DTM workspace

After collecting, use Insight Client to convert ETL trace files.

## TimeTravel Traces (TTT)

TTTracer.exe ships with Windows 10 1809+ and Server 2019+.

1. Open elevated prompt
2. Run: Tasklist /m lsasrv.dll (find PID of lsass.exe)
3. tttracer.exe -dumpfull -attach LSASS_PID -out c:/temp
4. Lock and unlock with domain account
5. tttracer.exe -stop all
6. Collect the latest lsass##.run file

Ref: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/184202
