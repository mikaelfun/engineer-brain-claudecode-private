/**
 * extract-token.js — Token 提取模块
 *
 * 支持两种提取方式：
 * - localStorage: 从页面 localStorage 读 MSAL AccessToken（Teams）
 * - request-intercept: 监听页面 request，捕获 Authorization header（DTM/ICM）
 *
 * 用法:
 *   const { extractFromLocalStorage, extractFromRequestIntercept } = require('./extract-token');
 *   const token = await extractFromLocalStorage(page, { targetIncludes: 'ic3.teams' });
 *   const token = await extractFromRequestIntercept(page, { urlIncludes: 'api.dtmnebula', header: 'authorization' });
 */

/**
 * 从 localStorage 提取 MSAL AccessToken
 *
 * @param {import('playwright-core').Page} page
 * @param {Object} match
 * @param {string} match.targetIncludes - token.target 必须包含的字符串
 * @returns {{ secret: string, expiresOn: string } | null}
 */
async function extractFromLocalStorage(page, match = {}) {
  const { targetIncludes = '' } = match;

  return page.evaluate((pattern) => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        const val = JSON.parse(localStorage.getItem(key));
        if (val && val.credentialType === 'AccessToken' && val.target && val.secret) {
          if (!pattern || val.target.includes(pattern)) {
            return { secret: val.secret, expiresOn: val.expiresOn || '' };
          }
        }
      } catch {}
    }
    return null;
  }, targetIncludes).catch(() => null);
}

/**
 * 通过 request intercept 提取 token
 *
 * 注册 request 监听 → reload 页面 → 捕获匹配 URL 的请求 header
 *
 * @param {import('playwright-core').Page} page
 * @param {Object} match
 * @param {string} match.urlIncludes - request URL 必须包含的字符串
 * @param {string} [match.header='authorization'] - 要提取的 header 名
 * @param {number} [match.timeoutMs=15000] - 最大等待时间
 * @returns {{ token: string } | null}
 */
async function extractFromRequestIntercept(page, match = {}) {
  const {
    urlIncludes = '',
    header = 'authorization',
    timeoutMs = 15000
  } = match;

  return new Promise(async (resolve) => {
    let token = '';
    const timer = setTimeout(() => resolve(token ? { token } : null), timeoutMs);

    const handler = (req) => {
      if (req.url().includes(urlIncludes)) {
        const val = req.headers()[header.toLowerCase()];
        if (val && val.length > 100) {
          token = val;
          clearTimeout(timer);
          page.removeListener('request', handler);
          resolve({ token });
        }
      }
    };

    page.on('request', handler);

    // Reload 触发 API 请求
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});

    // 如果 reload 后 token 还没拿到，等一会
    if (!token) {
      await page.waitForTimeout(5000).catch(() => {});
    }

    // 如果仍然没有，等 timer 超时自动 resolve
  });
}

/**
 * 根据 tokenSource 类型自动选择提取方式
 *
 * @param {import('playwright-core').Page} page
 * @param {Object} config - registry.json 中的 token 配置
 * @returns {{ secret?: string, token?: string, expiresOn?: string } | null}
 */
async function extractToken(page, config) {
  const { tokenSource, tokenMatch = {} } = config;

  if (tokenSource === 'localStorage') {
    return extractFromLocalStorage(page, tokenMatch);
  }

  if (tokenSource === 'request-intercept') {
    return extractFromRequestIntercept(page, tokenMatch);
  }

  return null;
}

module.exports = { extractFromLocalStorage, extractFromRequestIntercept, extractToken };
