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

def discover_chats(name_filter=None, timeout_s=30, login_only=False):
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

            # Persistent profile may open multiple tabs — close extras, keep the one with Teams/login
            page.wait_for_timeout(3000)
            pages = context.pages
            if len(pages) > 1:
                print(f'  [info] {len(pages)} tabs, cleaning up...', file=sys.stderr)
                for p in pages:
                    try:
                        url = p.url
                        if 'about:blank' in url:
                            p.close()
                    except Exception:
                        pass
                # Re-get pages after cleanup
                pages = context.pages
                # Pick the page that's on login or teams
                for p in pages:
                    try:
                        url = p.url
                        if 'login.microsoftonline' in url or 'teams.cloud' in url or 'teams.microsoft' in url:
                            page = p
                            break
                    except Exception:
                        pass
                print(f'  [info] using page: {page.url[:60]}', file=sys.stderr)

            # Wait for either SSO picker or Teams chat to load
            print('Waiting for Teams / SSO...', file=sys.stderr)
            sso_clicked = False
            deadline = time.time() + timeout_s
            while time.time() < deadline:
                # Re-check pages — SSO might open in a new tab
                pages = context.pages
                if len(pages) > 1:
                    page = pages[-1]

                # Try SSO click first — don't rely on title (it throws during redirects)
                if not sso_clicked:
                    try:
                        # MS login page uses data-test-id="email@domain" on account buttons
                        for sel in [
                            '[data-test-id="fangkun@microsoft.com"]',
                            'div:text-is("fangkun@microsoft.com")',
                            ':text("fangkun@microsoft.com")',
                        ]:
                            try:
                                btn = page.locator(sel).first
                                if btn.is_visible(timeout=1500):
                                    btn.click(timeout=5000)
                                    sso_clicked = True
                                    print(f'  SSO: clicked via {sel}', file=sys.stderr)
                                    page.wait_for_timeout(8000)
                                    break
                            except Exception:
                                continue
                    except Exception as e:
                        print(f'  [sso-debug] {e.__class__.__name__}: {str(e)[:80]}', file=sys.stderr)

                # Check if Teams loaded
                try:
                    title = page.title()
                    if ('Chat' in title or 'Teams' in title) and 'Sign in' not in title and 'Almost' not in title:
                        break
                except Exception:
                    pass

                page.wait_for_timeout(2000)

            page.wait_for_timeout(5000)  # Extra settle time

            # Ensure we're on Chat tab (not Activity/Calendar/etc)
            try:
                chat_btn = page.locator('[data-tid="app-bar-Chat"], [aria-label*="Chat"], button:has-text("Chat")').first
                if chat_btn.is_visible(timeout=3000):
                    chat_btn.click(timeout=3000)
                    page.wait_for_timeout(3000)
            except Exception:
                pass

            # Debug: save screenshot
            debug_dir = PW_PROFILE / 'debug'
            debug_dir.mkdir(exist_ok=True)
            try:
                page.screenshot(path=str(debug_dir / 'teams-discover-debug.png'))
                print(f'  [debug] screenshot saved to {debug_dir / "teams-discover-debug.png"}', file=sys.stderr)
            except Exception:
                pass

            # Extract chat list items — try multiple selector strategies
            print('Extracting chat names...', file=sys.stderr)
            items = page.evaluate('''() => {
                const results = [];
                const seen = new Set();

                // Strategy 1: role="treeitem" (classic Teams)
                for (const el of document.querySelectorAll('[role="treeitem"]')) {
                    const name = (el.getAttribute('aria-label') || '').trim();
                    if (name && !seen.has(name)) { seen.add(name); results.push({name: name.substring(0, 80), strategy: 'treeitem'}); }
                }

                // Strategy 2: data-tid chat list items
                for (const el of document.querySelectorAll('[data-tid*="chat-list-item"], [data-tid*="listitem"]')) {
                    const name = (el.getAttribute('aria-label') || el.textContent || '').trim();
                    if (name && !seen.has(name)) { seen.add(name); results.push({name: name.substring(0, 80), strategy: 'data-tid'}); }
                }

                // Strategy 3: listbox > option/listitem pattern
                for (const el of document.querySelectorAll('[role="listbox"] [role="option"], [role="list"] [role="listitem"]')) {
                    const name = (el.getAttribute('aria-label') || el.textContent || '').trim();
                    if (name && name.length > 2 && name.length < 80 && !seen.has(name)) {
                        seen.add(name); results.push({name: name.substring(0, 80), strategy: 'listbox'});
                    }
                }

                // Strategy 4: Generic — look for chat conversation containers
                for (const el of document.querySelectorAll('[class*="chatListItem"], [class*="ChatListItem"], [class*="conversationListItem"]')) {
                    const name = (el.getAttribute('aria-label') || el.textContent || '').trim().substring(0, 80);
                    if (name && name.length > 2 && !seen.has(name)) { seen.add(name); results.push({name, strategy: 'class'}); }
                }

                // Debug info: report what selectors matched
                const debug = {
                    treeitemCount: document.querySelectorAll('[role="treeitem"]').length,
                    listboxCount: document.querySelectorAll('[role="listbox"]').length,
                    listCount: document.querySelectorAll('[role="list"]').length,
                    chatListCount: document.querySelectorAll('[class*="chatList"], [class*="ChatList"]').length,
                    pageTitle: document.title,
                    url: location.href,
                };
                results.push({name: '__debug__', ...debug, strategy: 'debug'});

                return results;
            }''')

            # Separate debug info
            debug_info = [i for i in items if i.get('name') == '__debug__']
            items = [i for i in items if i.get('name') != '__debug__']

            if debug_info:
                d = debug_info[0]
                print(f'  [debug] treeitem={d.get("treeitemCount")}, listbox={d.get("listboxCount")}, '
                      f'list={d.get("listCount")}, chatList={d.get("chatListCount")}, '
                      f'title={d.get("pageTitle","")[:40]}, url={d.get("url","")[:60]}', file=sys.stderr)

            # Filter out nav/system items
            skip_names = {'Copilot', 'Mentions', 'Discover', 'Drafts', 'Chat', 'Teams and channels',
                          'Unread', 'Channels', 'Chats', 'Quick views', 'Turn on'}
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
    parser.add_argument('--timeout', type=int, default=30, help='Page load timeout (s)')
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
