/**
 * sso-handler.js — SSO 自动登录模块
 *
 * 检测 login.microsoftonline.com 页面 → 自动点击 @microsoft.com tile → 等待 SSO 完成
 * 供 token-daemon.js 和其他需要 SSO 的脚本复用。
 *
 * 用法:
 *   const { handleSSO } = require('./sso-handler');
 *   const success = await handleSSO(page, { targetDomain: 'teams.cloud.microsoft' });
 */

const ACCOUNT_MATCH = '@microsoft.com';
const LOGIN_DOMAINS = ['login.microsoftonline.com', 'login.live.com'];
const IDENTITY_PROVIDER_PATTERNS = ['IdentityProviderSelection', 'IdentityProvider'];
const TILE_SELECTOR = '[data-test-id]';

/**
 * 检测当前页面是否在 login 页面
 */
function isLoginPage(url) {
  return LOGIN_DOMAINS.some(d => url.includes(d));
}

/**
 * 检测当前页面是否在 Identity Provider 选择页（如 ICM）
 */
function isIdentityProviderPage(url) {
  return IDENTITY_PROVIDER_PATTERNS.some(p => url.includes(p));
}

/**
 * 等待页面 URL 变化到 login 页面或目标域（最多 waitMs）
 * 返回: 'login' | 'target' | 'timeout'
 */
async function waitForNavigation(page, targetDomain, waitMs = 15000) {
  const interval = 500;
  const rounds = Math.ceil(waitMs / interval);
  for (let i = 0; i < rounds; i++) {
    await page.waitForTimeout(interval);
    const url = page.url();
    if (isLoginPage(url)) return 'login';
    if (url.includes(targetDomain)) return 'target';
  }
  return 'timeout';
}

/**
 * 在 login 页面自动选择 @microsoft.com 账号 tile 并点击
 * 返回: true 如果成功点击, false 如果未找到 tile
 */
async function clickAccountTile(page) {
  await page.waitForTimeout(2000); // 等 tiles 渲染

  const tiles = await page.locator(TILE_SELECTOR).all();
  for (const t of tiles) {
    const txt = await t.textContent().catch(() => '');
    if (txt && txt.includes(ACCOUNT_MATCH)) {
      const label = txt.trim().replace(/\s+/g, ' ').substring(0, 50);
      await t.click();
      return { clicked: true, account: label };
    }
  }

  // Fallback: 尝试 listbox row
  const rows = await page.locator('.table[role="listbox"] .table-row').all();
  for (const r of rows) {
    const txt = await r.textContent().catch(() => '');
    if (txt && txt.includes('microsoft')) {
      await r.click();
      return { clicked: true, account: txt.trim().substring(0, 50) };
    }
  }

  return { clicked: false, account: null };
}

/**
 * 处理 SSO 登录流程
 *
 * @param {import('playwright-core').Page} page - Playwright page
 * @param {Object} opts
 * @param {string} opts.targetDomain - 目标域名（如 'teams.cloud.microsoft'）
 * @param {number} [opts.loginWaitMs=15000] - 等待 login 页面出现的最大时间
 * @param {number} [opts.ssoWaitMs=30000] - 等待 SSO redirect 完成的最大时间
 * @param {function} [opts.log] - 日志回调 (msg) => void
 * @returns {{ success: boolean, action: string, account?: string }}
 */
async function handleSSO(page, opts = {}) {
  const {
    targetDomain = '',
    loginWaitMs = 15000,
    ssoWaitMs = 30000,
    log = () => {}
  } = opts;

  const url = page.url();

  // 已经在目标域（且不在 SSO/login 相关子页面）→ 无需 SSO
  if (targetDomain && url.includes(targetDomain) && !isLoginPage(url) && !isIdentityProviderPage(url)) {
    return { success: true, action: 'already-on-target' };
  }

  // 处理 Identity Provider 选择页（如 ICM）→ 点 "Sign in" 链接跳转到 Azure AD login
  if (isIdentityProviderPage(url)) {
    log('Identity Provider page detected, clicking Sign in...');
    try {
      const signIn = await page.locator('a:has-text("Sign in")').first();
      await signIn.click();
      await page.waitForTimeout(5000);
    } catch {}
    // 应该跳到 login.microsoftonline.com 了
  }

  // 检测是否在 login 页面（或等待 redirect 到 login）
  let onLogin = isLoginPage(page.url());
  if (!onLogin) {
    const nav = await waitForNavigation(page, targetDomain, loginWaitMs);
    if (nav === 'target') return { success: true, action: 'redirected-to-target' };
    if (nav === 'login') onLogin = true;
  }

  if (!onLogin) {
    // 既没到 login 也没到 target
    return { success: false, action: 'no-login-page-detected' };
  }

  // 在 login 页面 → 自动点击 tile
  log('Login page detected, auto-selecting account...');
  const { clicked, account } = await clickAccountTile(page);

  if (!clicked) {
    log('WARN: no account tile found');
    return { success: false, action: 'no-account-tile' };
  }

  log(`Clicked: ${account}`);

  // 等待 SSO redirect 回目标域
  if (targetDomain) {
    try {
      await page.waitForURL(`**/${targetDomain}/**`, { timeout: ssoWaitMs });
    } catch {
      // URL 可能不完全匹配 pattern，再手动检查
      const finalUrl = page.url();
      if (!finalUrl.includes(targetDomain)) {
        // 再等几秒看看
        await page.waitForTimeout(5000);
      }
    }
  } else {
    // 无目标域，等待离开 login 页面
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(500);
      if (!isLoginPage(page.url())) break;
    }
  }

  const finalUrl = page.url();
  const success = !isLoginPage(finalUrl);

  return { success, action: success ? 'sso-completed' : 'sso-stuck-on-login', account };
}

module.exports = { handleSSO, isLoginPage, isIdentityProviderPage, clickAccountTile, waitForNavigation };
