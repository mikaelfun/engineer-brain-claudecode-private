#!/usr/bin/env python3
"""
warm-teams-token.py — 预热 Teams ic3 token（独立 Playwright profile）

用法:
    python3 warm-teams-token.py [--force]

输出:
    TOKEN_OK|len=N|expires=EPOCH    成功
    TOKEN_CACHED|len=N|expires=EPOCH  已有有效缓存
    TOKEN_FAIL|reason=...           失败

缓存: $TEMP/teams-ic3-token.json
    {"secret": "eyJ...", "expiresOn": "1776447500", "fetchedAt": "ISO"}

设计:
    使用独立 Playwright profile ($TEMP/pw-teams-token-profile)，
    与 MCP Playwright profile / DTM profile 互不干扰。
    profile 被锁时自动清理 SingletonLock 重试（因为此 profile 归本脚本独占）。
"""

import asyncio
import json
import os
import sys
import time
import shutil

CACHE_PATH = os.path.join(os.environ.get('TEMP', '/tmp'), 'teams-ic3-token.json')
# 独立 profile，不与 MCP Playwright 或 DTM 共享
PROFILE_DIR = os.path.join(os.environ.get('TEMP', '/tmp'), 'pw-teams-token-profile')
TOKEN_MARGIN_SECONDS = 300  # 提前 5 分钟认为过期


def check_cache():
    """检查缓存 token 是否有效。返回 token dict 或 None。"""
    if not os.path.exists(CACHE_PATH):
        return None
    try:
        with open(CACHE_PATH, 'r') as f:
            cached = json.load(f)
        expires = int(cached.get('expiresOn', 0))
        if time.time() < expires - TOKEN_MARGIN_SECONDS:
            return cached
    except Exception:
        pass
    return None


def cleanup_singleton_lock(profile_dir):
    """清理 Chromium SingletonLock 文件，释放 profile 占用。

    此 profile 归本脚本独占，如果被锁定说明是上次异常退出的残留，
    可以安全清理。类似 DTM warm-dtm-token.ps1 的做法。
    """
    lock_files = ['SingletonLock', 'SingletonSocket', 'SingletonCookie']
    cleaned = False
    for lock_name in lock_files:
        lock_path = os.path.join(profile_dir, lock_name)
        if os.path.exists(lock_path):
            try:
                os.remove(lock_path)
                cleaned = True
            except OSError:
                pass
    # Also clean Default/lock if exists
    default_lock = os.path.join(profile_dir, 'Default', 'lock')
    if os.path.exists(default_lock):
        try:
            os.remove(default_lock)
            cleaned = True
        except OSError:
            pass
    if cleaned:
        print("  ⚠ cleaned stale profile locks", file=sys.stderr)


async def refresh_token_via_playwright(retry_on_lock=True):
    """启动 Playwright 打开 Teams web，等待 SSO，提取 token。

    使用独立 profile $TEMP/pw-teams-token-profile（非 MCP profile）。
    """
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("TOKEN_FAIL|reason=playwright not installed", file=sys.stderr)
        return None

    os.makedirs(PROFILE_DIR, exist_ok=True)

    async with async_playwright() as p:
        try:
            ctx = await p.chromium.launch_persistent_context(
                PROFILE_DIR,
                channel="msedge",
                headless=True,
                args=["--profile-directory=Default"]
            )
        except Exception as e:
            err_msg = str(e).lower()
            if ("already in use" in err_msg or "target" in err_msg) and retry_on_lock:
                # Profile 被锁 — 清理 lock 文件后重试一次
                print("  ⚠ profile locked, cleaning locks and retrying...", file=sys.stderr)
                cleanup_singleton_lock(PROFILE_DIR)
                return await refresh_token_via_playwright(retry_on_lock=False)
            print(f"TOKEN_FAIL|reason=profile launch failed: {e}", file=sys.stderr)
            return None

        page = ctx.pages[0] if ctx.pages else await ctx.new_page()

        # 导航到 Teams（SSO 应自动登录）
        try:
            await page.goto('https://teams.microsoft.com', wait_until='networkidle', timeout=30000)
        except Exception:
            pass  # timeout OK，只要 token 已缓存到 localStorage

        await asyncio.sleep(3)

        # 从 localStorage 提取 ic3 token
        token_data = await page.evaluate("""() => {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                try {
                    const val = JSON.parse(localStorage.getItem(key));
                    if (val && val.credentialType === 'AccessToken' && val.target &&
                        (val.target.includes('Teams.Access') || val.target.includes('ic3.teams'))) {
                        return { secret: val.secret, expiresOn: val.expiresOn };
                    }
                } catch(e) {}
            }
            return null;
        }""")

        await ctx.close()

        if token_data and token_data.get('secret'):
            return token_data

    return None


def save_cache(token_data):
    """保存 token 到缓存文件。"""
    token_data['fetchedAt'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    with open(CACHE_PATH, 'w') as f:
        json.dump(token_data, f)


def main():
    force = '--force' in sys.argv

    # 1. 检查缓存
    if not force:
        cached = check_cache()
        if cached:
            print(f"TOKEN_CACHED|len={len(cached.get('secret',''))}|expires={cached.get('expiresOn','?')}")
            return

    # 2. 刷新 token
    token_data = asyncio.run(refresh_token_via_playwright())
    if token_data:
        save_cache(token_data)
        print(f"TOKEN_OK|len={len(token_data.get('secret',''))}|expires={token_data.get('expiresOn','?')}")
    else:
        print("TOKEN_FAIL|reason=could not extract token from Teams web")
        sys.exit(1)


if __name__ == '__main__':
    main()
