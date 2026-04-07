---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Dependencies/AVD/Redirection/Drag and Drop/Setup Guides"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FDependencies%2FAVD%2FRedirection%2FDrag%20and%20Drop%2FSetup%20Guides"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

       
Here are the redirection settings you can configure in Windows App in a web browser.

#Folder redirection
------------------

When using the Windows App in a web browser, you can transfer files between your local device and your remote session using either theUpload/Download foldersordrag-and-dropfunctionality. A redirected folder appears as a network drive in File Explorer within your remote session. Your administrator may control whether file transfer is enabled.

## Accessing the Redirected Drive:

1. Sign in to Windows App using your web browser.

1. Connect to a device or app.

1. Once your remote session starts, open**File Explorer**and selectThis PC.
1. There's a redirected drive called**Remote virtual Drive** on **RDWebClient**for Azure Virtual Desktop and**Windows365 virtual drive** on **RDWebClient**. Inside this drive, youll find two folders:
    - **Uploads** Contains files uploaded from your local device.
    - **Downloads** Files placed here will be downloaded to your local device via your browser.

## Uploading Files from Local to Remote:

You can upload files in two ways:

#### Option 1: Drag and Drop:

Drag files directly from your local device into the remote session window. These files will automatically appear in theUploadsfolder in the virtual drive.

**Note:** You cannot drag files to a specific location in the remote session, all files will automatically appear in the Uploads folder.

#### Option 2: Upload Button:

1. Select the**Upload files**icon (upward arrow) on the session toolbar. Selecting this icon opens a file explorer window on your local device.
1.  Browse and select files you want to upload to the remote session. You can select multiple files by holding down the_CTRL_key on your keyboard for Windows, or the_Command_key for macOS, then selectOpen.
1. Uploaded files will appear in theUploadsfolder.

 **Note:** There's a file size limit of 255MB for all file uploads.

#### Downloading Files from Remote to Local:

1. Copy and paste files to the**Downloads**folder.
1. Before the paste can be completed, Windows App prompts you**Do you want to download files to local desktop**? Select**Yes**. Your browser downloads the files in its normal way. If you don't want to see this prompt every time you download files from the current browser, check the box for**Dont ask me againbefore confirming**.

 **Note:** We recommend usingCopyrather thanCutwhen downloading files from your remote session to your local device as if there's an issue with the network connection, it can cause the files to be lost.
Uploaded files are available in theUploadsfolder until you sign out of Windows App.
Don't download files directly from your browser in a remote session to theDownloadsfolder as it triggers your local browser to download the file before it is ready. Download files in a remote session to a different folder, then copy and paste them to theDownloadsfolder.
