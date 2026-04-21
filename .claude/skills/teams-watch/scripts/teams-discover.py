#!/usr/bin/env python3
"""teams-discover.py — Discover Teams chatIds via Playwright browser automation.

Opens Teams web, lists all chats with display names, clicks each to extract chatId
via React fiber. Outputs JSON mapping of name → chatId.

Usage:
  python3 teams-discover.py                    # List all chats
  python3 teams-discover.py --name "Kun Fang"  # Find specific chat
  python3 teams-discover.py --save             # Save discovered chats to watch-targets.json
  python3 teams-discover.py --add <name> <key> # Add specific chat as target with given key

Requires: playwright (pip install playwright)
"""
import sys, os, json, time, shutil, glob, subprocess, argparse
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
TARGETS_FILE = SCRIPT_DIR.parent / 'watch-targets.json'
EDGE_PROFILE = Path(os.environ.get('LOCALAPPDATA', '')) / 'Microsoft' / 'Edge' / 'User Data'
# Reuse OWA's persistent profile — already has SSO login from owa-email-search
PW_PROFILE = Path(os.environ.get('TEMP', '')) / 'playwright-owa-profile'

def clean_stale_locks(profile_dir):
    """Remove stale browser lock files that prevent launch."""
    for lock in ['SingletonLock', 'SingletonSocket', 'SingletonCookie']:
        p = profile_dir / lock
        if p.exists():
            try:
                p.unlink()
                print(f'  [heal] cleaned {lock}', file=sys.stderr)
            except Exception:
                pass

def kill_stale_edge(profile_dir):
    """Kill Edge processes using our profile dir (Windows)."""
    try:
        result = subprocess.run(
            ['wmic', 'process', 'where',
             f"commandline like '%{profile_dir.name}%' and name='msedge.exe'",
             'get', 'processid'],
            capture_output=True, text=True, timeout=5
        )
        for line in result.stdout.strip().split('\n'):
            pid = line.strip()
            if pid.isdigit():
                subprocess.run(['taskkill', '/PID', pid, '/F'],
                               capture_output=True, timeout=5)
                print(f'  [heal] killed stale msedge PID {pid}', file=sys.stderr)
    except Exception:
        pass

def ensure_playwright():
    """Check playwright is installed, install if not."""
    try:
        from playwright.sync_api import sync_playwright
        return True
    except ImportError:
        print('Installing playwright...', file=sys.stderr)
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'playwright'],
                       capture_output=True)
        subprocess.run([sys.executable, '-m', 'playwright', 'install', 'chromium'],
                       capture_output=True)
        return True

LOGIN_DOMAINS = ['login.microsoftonline.com', 'login.live.com']
ACCOUNT_MATCH = '@microsoft.com'
TARGET_DOMAIN = 'teams.cloud.microsoft'


def _is_login_url(url):
    return any(d in url for d in LOGIN_DOMAINS)


def _is_teams_url(url):
    return TARGET_DOMAIN in url


def _find_active_page(context):
    """Pick the most relevant page from context: prefer login > teams > last."""
    for p in context.pages:
        try:
            if _is_login_url(p.url):
                return p
        except Exception:
            pass
    for p in context.pages:
        try:
            if _is_teams_url(p.url):
                return p
        except Exception:
            pass
    pages = context.pages
    return pages[-1] if pages else None


def _handle_sso(page, context, timeout_s=40):
    """Handle SSO login. Ported from sso-handler.js.

    Phases:
      1. Wait for redirect from teams.cloud.microsoft → login.microsoftonline.com
      2. Wait for DSSO ("Trying to sign you in") to finish → "Pick an account"
      3. Iterate [data-test-id] tiles, find @microsoft.com, click
      4. Wait for redirect back to teams.cloud.microsoft

    Returns: page object (may differ from input if redirect opened new tab)
    """
    # Phase 1: Wait for URL to settle (teams or login) — poll every 500ms, up to 15s
    print('  [sso] waiting for redirect...', file=sys.stderr)
    deadline = time.time() + min(timeout_s, 15)
    while time.time() < deadline:
        page = _find_active_page(context)
        url = page.url
        if _is_login_url(url):
            print(f'  [sso] reached login page', file=sys.stderr)
            break
        if _is_teams_url(url):
            # teams.cloud.microsoft URL — but might be pre-redirect. Check body.
            try:
                body = page.evaluate('() => document.body.innerText.substring(0, 200)')
                if 'Chat' in body or 'Activity' in body:
                    print(f'  [sso] Teams already loaded, no SSO needed', file=sys.stderr)
                    return page
            except Exception:
                pass
        time.sleep(0.5)

    # Phase 2: On login page — wait for DSSO to complete and "Pick an account" to appear
    if _is_login_url(page.url):
        print('  [sso] waiting for account picker...', file=sys.stderr)
        deadline = time.time() + min(timeout_s, 20)
        while time.time() < deadline:
            try:
                body = page.evaluate('() => document.body.innerText.substring(0, 300)')
                if 'Pick an account' in body or 'Sign in to your account' in body:
                    break
                if 'Trying to sign' in body:
                    pass  # DSSO still running, wait
            except Exception:
                pass
            time.sleep(1)

        # Phase 3: Click account tile — iterate [data-test-id] tiles (à la sso-handler.js)
        page.wait_for_timeout(2000)  # Wait for KO bindings to render data-test-id
        print('  [sso] looking for account tiles...', file=sys.stderr)
        clicked = False
        try:
            tiles = page.locator('[data-test-id]').all()
            for tile in tiles:
                try:
                    txt = tile.text_content() or ''
                    if ACCOUNT_MATCH in txt:
                        label = ' '.join(txt.split())[:50]
                        tile.click(timeout=5000)
                        clicked = True
                        print(f'  [sso] clicked: {label}', file=sys.stderr)
                        break
                except Exception:
                    continue
        except Exception as e:
            print(f'  [sso] tile search error: {e}', file=sys.stderr)

        if not clicked:
            # Fallback: try row.tile with text match
            try:
                fallback = page.locator('div.row.tile:has-text("' + ACCOUNT_MATCH + '")').first
                if fallback.is_visible(timeout=2000):
                    fallback.click(timeout=5000)
                    clicked = True
                    print(f'  [sso] clicked via fallback (div.row.tile)', file=sys.stderr)
            except Exception:
                pass

        if not clicked:
            print('  [sso] WARNING: could not find/click account tile', file=sys.stderr)
            return page

        # Phase 4: Wait for redirect back to Teams
        print('  [sso] waiting for Teams redirect...', file=sys.stderr)
        try:
            page.wait_for_url(f'**/{TARGET_DOMAIN}/**', timeout=30000)
        except Exception:
            # URL pattern might not match exactly — poll manually
            for _ in range(30):
                page = _find_active_page(context)
                if _is_teams_url(page.url) and not _is_login_url(page.url):
                    break
                time.sleep(1)

    return page


def discover_chats(name_filter=None, timeout_s=60, login_only=False):
    """Open Teams web, list chats, extract chatIds."""
    from playwright.sync_api import sync_playwright

    # Self-heal: clean locks before launch
    PW_PROFILE.mkdir(parents=True, exist_ok=True)
    clean_stale_locks(PW_PROFILE)
    kill_stale_edge(PW_PROFILE)

    results = []

    with sync_playwright() as p:
        # Launch Edge with persistent context for SSO
        print('Launching Edge...', file=sys.stderr)
        launch_args = ['--no-first-run', '--disable-blink-features=AutomationControlled']
        max_retries = 2
        context = None
        for attempt in range(max_retries + 1):
            try:
                context = p.chromium.launch_persistent_context(
                    str(PW_PROFILE),
                    channel='msedge',
                    headless=False,
                    args=launch_args,
                    viewport={'width': 1280, 'height': 900},
                    timeout=20000
                )
                break
            except Exception as e:
                err = str(e)
                if attempt < max_retries and ('SingletonLock' in err or 'user data directory' in err
                        or 'already in use' in err or 'Browser window not found' in err):
                    print(f'  [heal] attempt {attempt+1} failed: {err[:60]}', file=sys.stderr)
                    clean_stale_locks(PW_PROFILE)
                    kill_stale_edge(PW_PROFILE)
                    # Also clean crashed state
                    for f in PW_PROFILE.glob('**/crash*'):
                        try: f.unlink()
                        except: pass
                    time.sleep(2)
                else:
                    raise

        if not context:
            print('ERROR: Failed to launch browser after retries', file=sys.stderr)
            return []

        page = context.pages[0] if context.pages else context.new_page()

        try:
            # Navigate to Teams
            print('Opening Teams...', file=sys.stderr)
            page.goto('https://teams.cloud.microsoft/', timeout=30000,
                      wait_until='domcontentloaded')

            # Close stray about:blank tabs
            for tab in context.pages:
                try:
                    if tab != page and 'about:blank' in tab.url:
                        tab.close()
                except Exception:
                    pass

            # === SSO handling (ported from sso-handler.js) ===
            print('Handling SSO...', file=sys.stderr)
            page = _handle_sso(page, context, timeout_s=timeout_s)

            if login_only:
                print('Login-only mode, exiting after SSO.', file=sys.stderr)
                return []

            # === Wait for Teams app to fully load ===
            print('Waiting for Teams app to fully load...', file=sys.stderr)
            deadline = time.time() + timeout_s
            chat_tab_clicked = False

            while time.time() < deadline:
                # Re-find active Teams page
                page = _find_active_page(context)
                try:
                    info = page.evaluate('''() => ({
                        url: location.href,
                        title: document.title,
                        treeitem: document.querySelectorAll('[role="treeitem"]').length,
                        listitem: document.querySelectorAll('[role="listitem"]').length,
                        chatBtn: !!document.querySelector('[data-tid="app-bar-Chat"], [data-tid="app-bar-2"]'),
                        loading: !!document.querySelector('[role="progressbar"]') ||
                            document.body.innerText.includes('Loading'),
                    })''')
                except Exception:
                    time.sleep(2)
                    continue

                # Chat list found
                if info['treeitem'] > 2 or (info['listitem'] > 2 and _is_teams_url(info['url'])):
                    print(f'  Teams loaded! treeitem={info["treeitem"]} listitem={info["listitem"]}', file=sys.stderr)
                    break

                # App bar loaded — try clicking Chat tab
                if info['chatBtn'] and not chat_tab_clicked:
                    try:
                        btn = page.locator('[data-tid="app-bar-Chat"], [data-tid="app-bar-2"]').first
                        if btn.is_visible(timeout=2000):
                            btn.click(timeout=3000)
                            chat_tab_clicked = True
                            print(f'  Clicked Chat tab', file=sys.stderr)
                    except Exception:
                        pass

                time.sleep(3)

            page.wait_for_timeout(3000)  # Extra settle time

            # Debug: save screenshot
            debug_dir = PW_PROFILE / 'debug'
            debug_dir.mkdir(exist_ok=True)
            try:
                page.screenshot(path=str(debug_dir / 'teams-discover-debug.png'))
                print(f'  [debug] screenshot saved to {debug_dir / "teams-discover-debug.png"}', file=sys.stderr)
            except Exception:
                pass

            # Extract chat list items from treeitems
            # New Teams UI: aria-label is empty, chat names are in innerText.
            # Group headers (Favorites, Chats, etc.) contain '|' with child items.
            # Leaf treeitems have clean single-line innerText = chat display name.
            print('Extracting chat names...', file=sys.stderr)
            items = page.evaluate('''() => {
                const results = [];
                const seen = new Set();
                const treeitems = document.querySelectorAll('[role="treeitem"]');

                for (const el of treeitems) {
                    // Use aria-label if present, otherwise innerText
                    let name = (el.getAttribute('aria-label') || '').trim();
                    if (!name) {
                        // innerText — but skip group headers that contain multiple items
                        const raw = (el.innerText || '').trim();
                        // Group headers have newlines or '|' (multiple child names)
                        if (raw.includes('\\n') || raw.length > 80) continue;
                        name = raw;
                    }
                    if (name && name.length > 1 && name.length <= 80 && !seen.has(name)) {
                        seen.add(name);
                        results.push({ name, strategy: 'treeitem' });
                    }
                }

                // Debug info
                results.push({
                    name: '__debug__',
                    strategy: 'debug',
                    treeitemCount: treeitems.length,
                    pageTitle: document.title,
                    url: location.href,
                });

                return results;
            }''')

            # Separate debug info
            debug_info = [i for i in items if i.get('name') == '__debug__']
            items = [i for i in items if i.get('name') != '__debug__']

            if debug_info:
                d = debug_info[0]
                print(f'  [debug] treeitem={d.get("treeitemCount")}, '
                      f'title={d.get("pageTitle","")[:40]}, url={d.get("url","")[:60]}', file=sys.stderr)

            # Filter out nav/system items (not actual chats)
            skip_names = {'Copilot', 'Mentions', 'Discover', 'Drafts', 'Chat', 'Teams and channels',
                          'Unread', 'Channels', 'Chats', 'Quick views', 'Turn on', 'Workflows',
                          'SBAManager Bot'}
            items = [i for i in items
                     if i['name'] not in skip_names
                     and not i['name'].startswith('Favorites')
                     and not i['name'].startswith('Quick views')
                     and not i['name'].startswith('Teams and')
                     and not i['name'].startswith('Stay in the know')]

            if name_filter:
                items = [i for i in items if name_filter.lower() in i['name'].lower()]

            print(f'Found {len(items)} chats, resolving chatIds...', file=sys.stderr)

            # Click each chat and extract chatId via React fiber
            for item in items:
                try:
                    # Click the chat item by text
                    page.get_by_text(item['name'], exact=True).first.click(timeout=3000)
                    page.wait_for_timeout(1500)

                    # Extract chatId from React fiber
                    chat_id = page.evaluate('''() => {
                        // Find compose area and walk up React fiber tree
                        const targets = [
                            '[data-tid="message-pane-layout"]',
                            '[data-tid="chat-pane-compose"]',
                            '[data-tid="messageEditor"]',
                            '[role="main"]'
                        ];
                        for (const sel of targets) {
                            const el = document.querySelector(sel);
                            if (!el) continue;
                            const key = Object.keys(el).find(k =>
                                k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
                            if (!key) continue;
                            let fiber = el[key];
                            for (let i = 0; i < 40 && fiber; i++) {
                                const props = fiber.memoizedProps || fiber.pendingProps || {};
                                if (props.chatId) return props.chatId;
                                if (props.conversationId) return props.conversationId;
                                if (props.threadId) return props.threadId;
                                if (props.conversation && props.conversation.id) return props.conversation.id;
                                // Check stateNode too
                                if (fiber.stateNode && fiber.stateNode.props) {
                                    const sp = fiber.stateNode.props;
                                    if (sp.chatId) return sp.chatId;
                                    if (sp.conversationId) return sp.conversationId;
                                }
                                fiber = fiber.return;
                            }
                        }
                        return null;
                    }''')

                    results.append({
                        'name': item['name'],
                        'chatId': chat_id or '(unknown)',
                    })
                    status = '✓' if chat_id else '?'
                    print(f'  {status} {item["name"]}: {chat_id or "(unknown)"}', file=sys.stderr)

                except Exception as e:
                    results.append({
                        'name': item['name'],
                        'chatId': '(error)',
                        'error': str(e)[:80]
                    })
                    print(f'  ✗ {item["name"]}: {e}', file=sys.stderr)

        finally:
            context.close()

    return results


def save_targets(results, keys_map=None):
    """Save discovered chats to watch-targets.json."""
    targets = {}
    if TARGETS_FILE.exists():
        targets = json.loads(TARGETS_FILE.read_text(encoding='utf-8'))

    existing = targets.get('targets', {})

    for r in results:
        if r['chatId'] in ('(unknown)', '(error)'):
            continue
        # Auto-generate key from name
        key = keys_map.get(r['name']) if keys_map else None
        if not key:
            key = r['name'].lower().replace(' ', '-').replace('(', '').replace(')', '')
            key = key[:20]
        if key not in existing:
            existing[key] = {
                'chatId': r['chatId'],
                'displayName': r['name'],
                'description': f'Auto-discovered from Teams web'
            }

    targets['targets'] = existing
    TARGETS_FILE.write_text(json.dumps(targets, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f'\nSaved {len(existing)} targets to {TARGETS_FILE}', file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description='Discover Teams chatIds')
    parser.add_argument('--name', help='Filter chats by name')
    parser.add_argument('--save', action='store_true', help='Save to watch-targets.json')
    parser.add_argument('--add', nargs=2, metavar=('NAME', 'KEY'),
                        help='Discover specific chat and add as target with KEY')
    parser.add_argument('--login', action='store_true',
                        help='Login mode: open Teams for SSO, then exit (run once to set up profile)')
    parser.add_argument('--timeout', type=int, default=60, help='Page load timeout (s)')
    args = parser.parse_args()

    ensure_playwright()

    name_filter = args.name
    if args.add:
        name_filter = args.add[0]

    results = discover_chats(name_filter=name_filter, timeout_s=args.timeout,
                             login_only=args.login)

    # Output as JSON
    print(json.dumps(results, indent=2, ensure_ascii=False))

    if args.save:
        save_targets(results)
    elif args.add and results:
        save_targets(results, keys_map={results[0]['name']: args.add[1]})


if __name__ == '__main__':
    main()
