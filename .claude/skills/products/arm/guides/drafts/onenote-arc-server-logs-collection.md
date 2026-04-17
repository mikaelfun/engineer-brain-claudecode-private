# Azure Arc Enabled Servers - Logs to Collect

## Required Information

1. **Operating System information**
   - Windows: Windows version
   - Linux: Linux flavour and version

2. **Azure location** of impacted Arc enabled servers or desired Azure location

3. **Agent version** (check via portal or `azcmagent show`)

4. **Subscription ID**

5. **`azcmagent show` output** — shows agent status, connection state, resource info

6. **`azcmagent logs` output** — collects diagnostic logs
   - **Prerequisite:** Ensure the `himds` service is running before running this command
   - Known Issue: `azcmagent show` may return "The system cannot find the file specified" error
     - See: [KI article on ADO Wiki](https://supportability.visualstudio.com/AzureArcforServers/_wiki/wikis/AzureArcenabledservers.wiki)

7. **`azcmagent check` output** — validates connectivity
   - **Important for Mooncake:** Use `--cloud` flag. The `-l` flag does NOT work in Mooncake.
   - Example: `azcmagent check --cloud AzureChinaCloud`

8. **Private Link usage**
   - If customer uses Private Link: also run `azcmagent check --use-private-link`

## Troubleshooting Notes
- Always verify the `himds` service status first
- In Mooncake, ensure the correct cloud flag is used for connectivity checks
- For Private Link scenarios, additional network connectivity validation is needed

## Source
- Mooncake POD Support Notebook: Arc Enabled Servers - Logs to collect
