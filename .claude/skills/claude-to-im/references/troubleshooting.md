# Troubleshooting

## Bridge won't start

**Symptoms**: `/claude-to-im start` fails or daemon exits immediately.

**Steps**:

1. Run `/claude-to-im doctor` to identify the issue
2. Check that Node.js >= 20 is installed: `node --version`
3. Check that Claude Code CLI is available: `claude --version`
4. Verify config exists: `ls -la ~/.claude-to-im/config.env`
5. Check logs for startup errors: `/claude-to-im logs`

**Common causes**:
- Missing or invalid config.env -- run `/claude-to-im setup`
- Node.js not found or wrong version -- install Node.js >= 20
- Port or resource conflict -- check if another instance is running with `/claude-to-im status`

## Messages not received

**Symptoms**: Bot is online but doesn't respond to messages.

**Steps**:

1. Verify the bot token is valid: `/claude-to-im doctor`
2. Check allowed user IDs in config -- if set, only listed users can interact
3. For Telegram: ensure you've sent `/start` to the bot first
4. For Discord: verify the bot has been invited to the server with message read permissions
5. For Feishu: confirm the app has been approved and event subscriptions are configured
6. Check logs for incoming message events: `/claude-to-im logs 200`

## Permission timeout

**Symptoms**: Claude Code session starts but times out waiting for tool approval.

**Steps**:

1. The bridge runs Claude Code in non-interactive mode; ensure your Claude Code configuration allows the necessary tools
2. Consider using `--allowedTools` in your configuration to pre-approve common tools
3. Check network connectivity if the timeout occurs during API calls

## High memory usage

**Symptoms**: The daemon process consumes increasing memory over time.

**Steps**:

1. Check current memory usage: `/claude-to-im status`
2. Restart the daemon to reset memory:
   ```
   /claude-to-im stop
   /claude-to-im start
   ```
3. If the issue persists, check how many concurrent sessions are active -- each Claude Code session consumes memory
4. Review logs for error loops that may cause memory leaks

## Stale PID file

**Symptoms**: Status shows "running" but the process doesn't exist, or start refuses because it thinks a daemon is already running.

The daemon management script (`daemon.sh`) handles stale PID files automatically. If you still encounter issues:

1. Run `/claude-to-im stop` -- it will clean up the stale PID file
2. If stop also fails, manually remove the PID file:
   ```bash
   rm ~/.claude-to-im/runtime/bridge.pid
   ```
3. Run `/claude-to-im start` to launch a fresh instance

## EBUSY crash-loop on Windows

**Symptoms**: Bridge starts, then immediately crashes with `Error: EBUSY: resource busy or locked, open 'bridge.log'`. Restarts every 10 seconds in an infinite loop. If running via Scheduled Task with `-WindowStyle Hidden`, this manifests as terminal windows flashing on screen.

**Root cause**: Two components both try to write to `~/.claude-to-im/logs/bridge.log` simultaneously:
1. The autostart wrapper (`autostart.ps1`) pipes node output via `Out-File -Append`
2. The daemon's internal logger (`logger.ts`) opens the same file with `fs.createWriteStream()`

Windows enforces exclusive file locks, causing EBUSY. Linux/macOS are not affected (POSIX allows multiple writers).

**Fix**: Edit `~/.claude-to-im/runtime/autostart.ps1` — remove the `Out-File -Append $logFile` pipe:

```powershell
# BAD — causes EBUSY:
& node $daemonPath 2>&1 | Out-File -Append $logFile

# GOOD — let daemon handle its own logging:
& node $daemonPath
```

The daemon already writes logs with rotation and secret masking via `logger.ts`. The wrapper pipe is redundant.

See `references/windows-autostart.md` for the complete correct autostart script.

## Windows auto-start issues

**Symptoms**: Bridge doesn't start on login, or dies when the terminal is closed.

**Steps**:

1. Check the Scheduled Task: `Get-ScheduledTask -TaskName 'ClaudeToIMBridge'`
2. If not registered, run `/claude-to-im install-autostart` to create it
3. If registered but not running, check `LastTaskResult`:
   - `0xC000013A` = process was terminated (SIGHUP / Ctrl+C)
   - Non-zero = check `~/.claude-to-im/logs/autostart-wrapper.log` and `bridge.log`
4. If daemon dies when terminal closes, ensure you're using the Scheduled Task or `supervisor-windows.ps1 start` (not running autostart.ps1 directly in a terminal)

See `references/windows-autostart.md` for full deployment guide.

## Streaming cards not working (Feishu)

**Symptoms**: Card shows "Thinking..." but text never updates; or no card at all, just plain text.

**Check config first**: `~/.claude-to-im/config.env` must have:
```
CTI_FEISHU_CARD_MODE=v1
```
If set to `text`, streaming cards are completely disabled (early return in `_doCreateStreamingCard`).

**Required permissions**: `cardkit:card:write`, `cardkit:card:read` (must publish a new app version after adding)

**Known SDK issue (2026-04)**: claude-to-im source code references `cardkit.v2.card.*` but the Feishu SDK only has `cardkit.v1`. The dist JS in `node_modules/claude-to-im/dist/lib/bridge/adapters/feishu-adapter.js` needs these patches:

| Original | Fix |
|----------|-----|
| `cardkit.v2.card.create` | `cardkit.v1.card.create` |
| `cardkit.v2.card.streamContent({data:{content,sequence}})` | `cardkit.v1.cardElement.content({path:{card_id,element_id:'streaming_content'},data:{content,sequence}})` |
| `cardkit.v2.card.settings.streamingMode.set({data:{streaming_mode:false,sequence}})` | `cardkit.v1.card.settings({data:{settings:JSON.stringify({config:{streaming_mode:false}}),sequence}})` |
| `cardkit.v2.card.update({data:{type,data,sequence}})` | `cardkit.v1.card.update({data:{card:{type:'card_json',data:finalCardJson},sequence}})` |
| `if (!hasV2 && !hasV1)` | `if (!hasV1)` |
| `...(hasV2 ? { streaming_mode: true } : {})` | `streaming_mode: true` |

**Config requirement**: `~/.claude-to-im/config.env` must have `CTI_FEISHU_CARD_MODE=v1` (not `text`).

After patching, run `npm run build` in the skill directory and restart the bridge.
