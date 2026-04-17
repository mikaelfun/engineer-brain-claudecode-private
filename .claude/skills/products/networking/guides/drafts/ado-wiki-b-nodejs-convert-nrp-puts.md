---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Tools and TSGs/Using Node.js to convert NRP PUTs into a readable format - Replacement for notepad++ macro"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FUsing%20Node.js%20to%20convert%20NRP%20PUTs%20into%20a%20readable%20format%20-%20Replacement%20for%20notepad%2B%2B%20macro"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Node.js script to convert NRP PUTs into a readable format

Replacement for the notepad++ macro (which is no longer allowed). Converts raw NRP PUT dumps into readable sections.

See also the VSCode extension alternative: [VSCode extension to format and cleanup NRP PUTs](ado-wiki-b-vscode-nrp-puts-formatter.md)

## Step 1 - Install Node.js

- Go to: https://nodejs.org
- Download LTS version
- Install and restart PowerShell

Verify:
```
node -v
```

## Step 2 - Download and place script

Download `format-squished.js` and place in `c:\tools`

## Step 3 - Obtain NRP PUT/GET dump info

Save the NRP dump to a file.

## Step 4 - Run from PowerShell

```ps1
node format-squished.js <The file with the NRP dump>
```

## Advanced - PowerShell Profile Alias

Add to your PS profile (`notepad $profile`):

```ps1
function fixsas {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Args
    )
    node "C:\tools\format-squished.js" @Args
}
```

Then you can simply call:
```ps1
fixsas <The file with the NRP dump>
```
