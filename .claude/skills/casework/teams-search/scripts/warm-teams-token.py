#!/usr/bin/env python3
"""
warm-teams-token.py — 预热 Teams ic3 token（从 MCP Playwright localStorage 获取）

用法:
    python3 warm-teams-token.py [--force]

输出:
    TOKEN_OK|len=N|expires=EPOCH    成功
    TOKEN_CACHED|len=N|expires=EPOCH  已有有效缓存
    TOKEN_FAIL|reason=...           失败

缓存: $TEMP/teams-ic3-token.json
    {"secret": "eyJ...", "expiresOn": "1776447500", "fetchedAt": "ISO"}

设计:
    1. 检查缓存文件是否存在且未过期（提前 5 分钟）
    2. 如过期，从 MCP Playwright profile 的 localStorage 读取 MSAL cache
    3. 如 localStorage 也过期/不存在，启动 Playwright → teams.microsoft.com 刷新
    4. 提取 ic3.teams.office.com token，保存到缓存文件

依赖:
    - playwright (python3 -m pip install playwright)
    - MCP Playwright Edge profile 已登录过 Teams（首次需手动触发 SSO）
"""

import asyncio
import json
import os
import sys
import time
import glob
import base64
import re

CACHE_PATH = os.path.join(os.environ.get('TEMP', '/tmp'), 'teams-ic3-token.json')
# MCP Playwright Edge profile — 与 MCP server 共享同一个持久化 profile
MCP_PROFILE_PATTERN = os.path.join(
    os.environ.get('LOCALAPPDATA', ''),
    'ms-playwright', 'mcp-msedge-*'
)
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


def read_token_from_localstorage(profile_dir):
    """从 MCP Playwright profile 的 localStorage leveldb 读取 ic3 token。

    localStorage 数据在 Edge profile 的 Local Storage/leveldb/ 目录。
    但直接读 leveldb 比较复杂，用 Playwright 更可靠。
    先尝试简单方法：如果 Teams web 已加载过，token 在 localStorage 中。
    """
    # 直接用 Playwright 读 localStorage 更可靠
    return None


async def refresh_token_via_playwright():
    """启动 Playwright 打开 Teams web，等待 SSO，提取 token。"""
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("TOKEN_FAIL|reason=playwright not installed", file=sys.stderr)
        return None

    profiles = glob.glob(MCP_PROFILE_PATTERN)
    if not profiles:
        print("TOKEN_FAIL|reason=no MCP Playwright profile found", file=sys.stderr)
        return None

    profile_dir = profiles[0]

    async with async_playwright() as p:
        try:
            ctx = await p.chromium.launch_persistent_context(
                profile_dir,
                channel="msedge",
                headless=True,
                args=["--profile-directory=Default"]
            )
        except Exception as e:
            if "already in use" in str(e).lower() or "Target" in str(e):
                print("TOKEN_FAIL|reason=MCP Playwright profile locked (browser running)", file=sys.stderr)
                return None
            raise

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
