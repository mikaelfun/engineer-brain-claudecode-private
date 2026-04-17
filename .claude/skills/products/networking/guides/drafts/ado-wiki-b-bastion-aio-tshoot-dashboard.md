---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Bastion/How To/AIO Tshoot Dashboard"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FHow%20To%2FAIO%20Tshoot%20Dashboard"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

### Use Cases for this dashboard:
- Verify Logins/Disconnects
- Verify relevant errors from Tomcat/DaemonLogs/Omni
- Bastion Performance Issues
  - Active User Sessions
  - CPU/RAM Available
  - Healthy Instances

**Notes:** This dashboard leverages specific, well-known queries to assist in identifying potential issues. Tomcat/Daemon logs apply to Bastion Basic, Standard, and Premium SKUs, while Omni logs are relevant for the Development SKU.

Dashboard link - [AIO Bastion - Troubleshoot Dashboard](https://portal.microsoftgeneva.com/dashboard/User%252Fpedrobarbosa/Bastion/Tshoot%2520Dashboard?overrides=[{"query":"//*[id='CustomerSubscriptionId']","key":"value","replacement":""},{"query":"//*[id='GatewayId']","key":"value","replacement":""}])

### How to use the dashboard

Please ensure both of the following fields are populated to accurately identify the customer environment:

- **CustomerSubscriptionId** — The customer's Subscription ID. **Mandatory**
- **GatewayId** — The Tenant ID, also known as the Resource GUID (available in NRP properties). **Mandatory**
- **Username** — Use when filtering Tomcat logs to identify specific timestamps, especially in scenarios with a high volume of login events.
- **VMName** — Similar usage to the `Username` field; helps identify specific virtual machines involved.
- **httpSessionID** — Useful for filtering and correlating session-related logs across components.
- **BastionName** — Refers only to the Bastion resource name (not the full URI); assists in identifying CRUD operations related to the Bastion.
- **OmniNodeId** — If available, use in conjunction with the cluster name. Even within a single region, multiple nodes may generate extensive logs.
- **OmniSessionId/ActivityId** — Isolate logs tied to a specific connection request and correlate data across Bastion components.
- **OmniRegion** — Helps minimize log volume by filtering by deployment region.
- **OmniNameSpace** — One of the most effective filters for isolating logs relevant to a specific environment.
- **OmniVMName** — Filters logs to show only those related to connections targeting this specific VM.

### How to identify the flow

- Bastion SKU - Basic/Standard/Premium:
  ```
  Customer → TomcatLogs → DaemonLogs → Backend
  ```
- Bastion SKU - Developer:
  ```
  Customer → OmniAgent → OmniBrain → OmniData → Backend
  ```

**Tip:** Before initiating an AVA, always collect both a HAR file and packet captures from the customer side and the backend. This helps identify cached credentials or invalid Azure tokens early.

### Performance Widgets

1. **Active Sessions** — Displays the number of concurrent users logged in per instance.
2. **Resource Health Check** — Value `1` = healthy, `0` = unhealthy.
3. **CPU Usage** — Highlights CPU throttling above 80%.
4. **Available RAM** — Should not fall below 1 GB; if it does, advise customer to scale up Bastion instances. See [Azure Bastion Configuration Settings](https://learn.microsoft.com/en-us/azure/bastion/configuration-settings#instance).

### Tomcat Logs (Attempts and Logins)

Verify:
1. **Timestamp** — Exact time of login attempt.
2. **httpSessionId** — Can be correlated using a HAR file.
3. **Login/Username** — Credentials the customer used.
4. **Target VM** — The VM the customer is attempting to connect to.
5. **Kerberos Usage** — If `null`, Kerberos is not in use. If populated, Kerberos authentication is active.
6. **Customer IP** — IP address used by the customer to reach Azure Bastion.

### Tomcat Logs (Drops and Disconnects)

Verify:
1. **Timestamp** — Exact time of disconnect.
2. **Username** — The affected user.
3. **VM Name** — The VM to which the user was connected.
4. **httpSessionId** — Can be correlated using a HAR file.

### Tomcat Logs (Errors)

Most frequently used for identifying errors such as RBAC permission issues or unhealthy PingMesh status.

Applied filters for message patterns:
`"rdp_set_error_info"`, `"ERRCONNECT"`, `"nla_recv_pdu"`, `"Unable"`, `"failed"`, `"unhealthy"`, `"permission denied"`, `"VM cannot be located"`, `"NOT UP/ACTIVE"`

### Tomcat Logs (SessionRecording Logs)

- **Message** — Checks for "blobfuse is NOT running."
- **Count** — If `0`, system is OK. If `> 0`, Bastion was unable to connect to Blob storage for recordings.

### DaemonLogs — Connections (Attempts/Logins)

- **Message** — Protocol used: rdp, ssh, tcptunnel (native client).
- **BastionVersion** — Verify and compare Bastion upgrade based on versions.

### DaemonLogs — Disconnections (Drops/Disconnects)

- **Message** — Correlate session closings or disconnects.

### Bastion DaemonLogs — Errors (Backend)

Applied filters for message patterns:
`"rdp_set_error_info"`, `"ERRCONNECT"`, `"nla_recv_pdu"`, `"failure event"`, `"no known host keys"`, `"DNS lookup failed"`, `"timeout waiting for activation"`, `"server refused"`, `"no srv records"`, `"sending dns"`, `"received answer"`

- **RoleInstance** — Identifies which Bastion backend attempted the connection.

### CRUD — NRP / Gateway / AsyncWorker

- Filter: message contains `"$logmasteroutcome"` in both GatewayManager and AsyncWorker logs.
- **BastionName** field must be provided to populate CRUD data.

### Changes History

**02/06/2025**
- Revamped entire dashboard, improved UX.
- Added Omni logs.
- Fixed Bastion PingMesh RHC widget.
- Added thresholds to graphs (Active Sessions, THC, RAM Available, CPU Usage).
- Included known errors in Intro widgets.

**02/05/2024**
- Added Kerberos errors and notifications on Tomcat and DaemonLogs.
- Removed noise on Tomcat disconnections (onStateChange).
