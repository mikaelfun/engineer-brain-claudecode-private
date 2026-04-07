---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Utilities.ps1/Invoke-AzsSupportCommand"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Utilities.ps1/Invoke-AzsSupportCommand"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Invoke-AzsSupportCommand

# Synopsis

Runs commands on local and remote computers.

# Parameters

## COMPUTERNAME

Specifies the computers on which the command runs.

## SCRIPTBLOCK

Specifies the commands to run. Enclose the commands in braces ({ }) to create a script block. When using Invoke-Command to run a command remotely, any variables in the command are evaluated on the remote computer.

## HIDECOMPUTERNAME

Indicates that this cmdlet omits the computer name of each object from the output display. By default, the name of the computer that generated the object appears in the display.

## ARGUMENTLIST

Supplies the values of parameters for the scriptblock. The parameters in the script block are passed by position from the array value supplied to ArgumentList. This is known as array splatting.

## ASJOB

Indicates that this cmdlet runs the command as a background job on a remote computer. Use this parameter to run commands that take an extensive time to finish.

## WAIT

Waits for the commands to complete. Once completed, returns the job details to console.

## PASSTHRU

Returns the results back from the command after the command has completed.

## ACTIVITY

Allows you to define the name of the activity in the banner when waiting for jobs to complete.

## EXECUTIONTIMEOUT

Total period to wait for jobs to complete before stopping jobs and progressing forward in scripts. If omitted, defaults to 900 seconds
