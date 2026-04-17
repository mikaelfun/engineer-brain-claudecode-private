---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Process Documentation/Global Processes/Escalation Guide for Engineers/[Script] Split HAR files"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FProcess%20Documentation%2FGlobal%20Processes%2FEscalation%20Guide%20for%20Engineers%2F%5BScript%5D%20Split%20HAR%20files"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# [Script] Split HAR files

Sometimes, you may need to attach large files like HARs into a CRI (IcM). Unfortunately, IcM currently has a 15MB limit for attachments.
The Split-MDOHAR script below enables you to split a HAR file into zipped 15MB chunks, which condense down to under 15MB each. You can then upload each .mdohar.zip file individually into your CRI. You can also use it with other text-based files and logs.
The script creates a new function that once run, you can reuse during your Powershell session, i.e. by running Split-MDOHAR -FilePath <PathToHARFile>. It takes a few seconds to create each .mdohar.zip chunk. If your HAR file is <15MB in size, it will just zip it without any splitting.

EEEs/engineering can use the rejoin script (second script) further below to "glue" the .mdohar files from the .mdohar.zip files back into a single HAR file.

## Quick guide
What you need to do to split a file quickly with the script:

1. Copy & paste the Split Script below into Powershell ISE (should be pre-installed in Windows).
2. Press F5 or click on the play button in Powershell ISE to run the script. The new function, or cmdlet, is now loaded into Powershell ISE.
3. At the prompt in Powershell ISE, use the Split-MDOHAR cmdlet to split the target file of your choice.

Example: `Split-MDOHAR -FilePath "C:\Users\anday\Downloads\har1.har"`

4. Note the location .mdohar files mentioned in the prompt and upload these into your IcM.

## Split Script

```powershell
function Split-MDOHAR {
  <#
  .DESCRIPTION
  Splits a HAR file into 15MB chunks, and then zips them as .mdohar.zip files. Each zip should have a size of under 15MB to enable upload to IcM. If the source file is less than 15MB, it is placed in a single zip.
  .EXAMPLE
  Split-MDOHAR -FilePath "C:\Users\anday\Downloads\har1.har"
  .PARAMETER $FilePath
  The full path to the HAR file that you wish to split.
  #>

param (
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

if (-not (Test-Path $FilePath)) {Write-Error "File not found: $FilePath"; exit}

$chunkSize = 15MB
$chunkSizeMB = [math]::Round($chunkSize / 1MB, 2)
$folder = Split-Path $FilePath -Parent
$baseName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
$FileSizeMB = [math]::Round((Get-ItemProperty -Path $FilePath).Length / 1MB, 2)
$DestFileName = $folder + '\' + $baseName + '.zip'

if ($FileSizeMB -lt $chunkSizeMB) {Write-Host -ForegroundColor Yellow "File size of $FileSizeMB MB is less than $ChunkSizeMB MB. Creating a single zip..."
    Compress-Archive -Path $FilePath -DestinationPath $DestFileName
    Write-Host -ForegroundColor Green "File created as $DestFileName"
    $DestFileSizeMB = [math]::Round((Get-ItemProperty -Path $DestFileName).Length / 1MB, 2)
    if ($DestFileSizeMB -gt 15) {Write-Host -BackgroundColor Red -ForegroundColor White "[WARNING] $DestFileName was created but is larger than 15MB."}
    }

if ($FileSizeMB -ge $chunkSizeMB) {Write-Host -ForegroundColor Yellow "File size of $FileSizeMB MB is greater than $ChunkSizeMB MB. Splitting the file into multiple .mdohar files and zipping each one..."

$tempFolder = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ([System.Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tempFolder | Out-Null

    $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
    $FileSizeMB = [math]::Round($fileBytes.Length / 1MB, 2)
    $totalchunks=([Math]::Ceiling($fileBytes.Length / $chunkSize))
    Write-Host -ForegroundColor Cyan "Attempting to split $FileSizeMB MB into $totalchunks * $chunkSizeMB MB chunks, from $filepath"

$partNumber = 1
for ($i = 0; $i -lt $fileBytes.Length; $i += $chunkSize) {
    $endIndex = [Math]::Min($i + $chunkSize, $fileBytes.Length)
    $chunk = $fileBytes[$i..($endIndex - 1)]
    $outputFile = Join-Path $tempFolder ("$baseName.$partNumber"+"_"+$totalchunks+".mdohar")
    [System.IO.File]::WriteAllBytes($outputFile, $chunk)
    Write-Output "Created split file $outputFile"
    $partNumber++
    }

    $mdoharFiles=Get-ChildItem -Path $tempFolder -Filter "*.mdohar"
    if ($mdoharFiles -eq $null) {Write-Error "No .mdohar files found in $dir"; break}
    $mdoharFiles |% {$DestFileName = $folder + '\' + $_.Name + '.zip'
        Compress-Archive -Path $_.FullName -DestinationPath $DestFileName -Force
        Write-Host -ForegroundColor Green "File created as $DestFileName"
    }
    Remove-Item -Path $tempFolder -Recurse -Force
}
}
```

### Usage
```powershell
Split-MDOHAR -filePath "C:\Users\anday\Work Folders\Documents\har1.har"
```

## Rejoin Script (for engineering)
Mainly intended for EEEs and engineering to rejoin .mdohar files.

```powershell
function Rejoin-MDOHAR {
  <#
  .DESCRIPTION
  Rejoins .mdohar.zip files into a single HAR file.
  .EXAMPLE
  Rejoin-MDOHAR -FilePath "C:\Users\anday\Downloads\rejoined.har" -CleanUp -OpenHAR
  .PARAMETER $FilePath
  The full path to the HAR file that you wish to create.
  .PARAMETER $CleanUp
  Deletes the original .mdohar.zip files after the new HAR file has been created.
  .PARAMETER $OpenHAR
  Opens the new HAR file in Fiddler.
  #>

    param (
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        [Parameter(Mandatory=$false)]
        [switch]$CleanUp,
        [Parameter(Mandatory=$false)]
        [switch]$OpenHAR
    )

$folder = Split-Path $FilePath -Parent
        $writer = [System.IO.StreamWriter]::new($FilePath, $false)
        $ZipFiles=Get-ChildItem -Path $folder -Filter "*.mdohar.zip"
        if ($ZipFiles -eq $null) {Write-Error "No .mdohar.zip files found in $dir"; break}
        $tempFolder = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ([System.Guid]::NewGuid().ToString())
        New-Item -ItemType Directory -Path $tempFolder | Out-Null
        $ZipFiles |% {Expand-Archive -Path $_.FullName -DestinationPath $tempFolder}
        $mdoharFiles=Get-ChildItem -Path $tempFolder -Filter "*.mdohar"
        $mdoharFiles| Sort-Object Name |% {
            $reader = [System.IO.StreamReader]::new($_.FullName)
            while (!$reader.EndOfStream) {
                $line = $reader.ReadLine()
                $writer.WriteLine($line)
            }
            $reader.Close()
        }
        $writer.Close()
        Write-Host "Rejoined file saved to: $folder"

        function Delete-MDOHARFiles {Write-host "Deleting all .mdohar.zip files from $folder"; $ZipFiles |% {Remove-Item -Path $_.FullName}}
        function Open-Fiddler {$fiddlerPath = "C:\Program Files (x86)\Fiddler2\Fiddler.exe"
                if (-not (Test-Path $fiddlerPath)) {Write-Error "Fiddler executable not found in $fiddlerPath"; exit}
                if (Get-Process -Name "Fiddler" -ErrorAction SilentlyContinue) {Write-Error "Fiddler is already running."; exit}
                else { Start-Process -FilePath $fiddlerPath -ArgumentList "`"$filePath`"" }
                }

        Remove-Item -Path $tempFolder -Recurse -Force
        if ($CleanUp -eq $true) {Delete-MDOHARFiles}
        if ($OpenHAR -eq $true) {Open-Fiddler}
        Write-host "Exiting..."; Start-sleep -Seconds 3; break
}
```

### Usage
```powershell
Rejoin-MDOHAR -FilePath "C:\Users\anday\Downloads\rejoined.har" -CleanUp -OpenHAR
```

## FAQ

**Q. Why a script?**
A. The script is tailored to split your text-based files automatically into 15MB chunks that IcM will accept. Just run the script in Powershell ISE (paste it in + press F5 to run).

**Q. What if I have large, non-text-based files to split (over 15MB)?**
A. You can use a compression utility like 7Zip to split the files instead. If you do so, please state this in the IcM.

**Q. What if the script doesn't work?**
A. As a backup, you can use a compression utility like 7Zip to split the files instead.
