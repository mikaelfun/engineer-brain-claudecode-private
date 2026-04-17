---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/ACE Identity TSGs/Identity Technical Wiki/AAD Connect - Synchronization/How To: Failover AAD Connect Servers"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FACE%20Identity%20TSGs%2FIdentity%20Technical%20Wiki%2FAAD%20Connect%20-%20Synchronization%2FHow%20To%3A%20Failover%20AAD%20Connect%20Servers"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How To: Failover AAD Connect Servers

AAD Connect can be set up in an Active-Passive High Availability setup, where one server will actively push changes to the synced AD objects to Azure AD and the passive server will stage these changes in the event it takes over.

> **Note**: You cannot set up AAD Connect in an Active-Active setup. It must be Active-Passive. Ensure that only 1 AAD Connect server is actively syncing changes.

To set up an AAD Connect sync server in Staging Mode follow: https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-sync-staging-server#staging-mode

In the event that you receive an alert that the currently active sync server is not able to connect, follow the below steps to attempt a failover of the sync services. **Currently there is no built-in automatic method to trigger this failover.**

## Process

**Step 1** — On the currently Active AAD Connect server, open the AAD Connect Console and click **"Configure staging mode"** then Next.

**Step 2** — Sign into Azure AD with Global Admin credentials.

**Step 3** — Tick the box for **Staging Mode** and click Next.

**Step 4** — The AAD Connect server will check for installed components for 10-15 seconds and then prompt you whether you want to start the sync process or not.
- It is recommended to **leave the sync process on** for the server in Staging Mode so if it becomes active, it will quickly take over and won't have to do a large sync to catch up.

**Step 5** — After selecting whether to start or stop the sync process and clicking Configure, it should take 1-2 minutes for the AAD Connect server to configure itself into Staging Mode. When completed, you will be prompted with a screen that confirms Staging Mode is enabled. Click Exit.

**Step 6** — Confirm that the server is successfully in Staging Mode by opening the Synchronization Service console. There should be no more Export jobs; Full & Delta Imports will be suffixed with **(Stage Only)**.

**Step 7** — Move to the AAD Connect server that was originally in Staging Mode and open the AAD Connect console. Click on **"Configure staging mode"** and click Next. Note the message at the bottom indicating this server is in Staging Mode.

**Step 8** — Sign into Azure AD with Global Admin credentials, then go to the Staging Mode screen. **Untick** the box for Staging Mode and click Next.
> ⚠️ Ensure no other AAD Connect server is actively syncing. There should only be one active AAD Connect sync server at any time.

**Step 9** — After 20-30 seconds you will be prompted to start or stop the sync process. **Tick this box** (since this will be the active sync server) and click Configure.

**Step 10** — The completion process should take 1-2 minutes. Once finished, click Exit.

**Step 11** — Confirm that this is working by opening the Sync Service Console and checking if Export jobs are running.
