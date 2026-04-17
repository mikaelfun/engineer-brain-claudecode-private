#!/usr/bin/env python3
"""
cc-finder.py — 从 mooncake-cc.json 匹配客户，输出 ccAccount + ccEmails

匹配策略（按优先级）：
1. Customer 字段精确匹配（含中英文别名）
2. Customer 字段关键词模糊匹配
3. Schedule 字段关键词模糊匹配（Customer = "Generic Account" 时 fallback）
4. Contact email domain 反查

Usage:
    python3 cc-finder.py --case-dir ./cases/active/123 --data-root ../data
    # stdout: ccAccount=Ford Motor China / 福特汽车（中国）有限公司|ccEmails=xxx@microsoft.com;yyy@microsoft.com
    # or:     ccAccount=|ccEmails=  (no match)
"""

import argparse
import json
import os
import re
import sys


def load_cc_list(data_root):
    path = os.path.join(data_root, "mooncake-cc.json")
    if not os.path.exists(path):
        return []
    try:
        data = json.load(open(path, encoding="utf-8"))
        return data.get("accounts", [])
    except Exception:
        return []


def extract_case_fields(case_dir):
    """Extract Customer, Schedule, Contact from case-info.md."""
    path = os.path.join(case_dir, "case-info.md")
    if not os.path.exists(path):
        return "", "", ""
    try:
        content = open(path, encoding="utf-8", errors="replace").read()
    except Exception:
        return "", "", ""

    customer = ""
    schedule = ""
    contact_email = ""

    # | Customer | Xxx |
    m = re.search(r'\|\s*Customer\s*\|\s*([^|\r\n]+)', content)
    if m:
        customer = m.group(1).strip()

    # | Schedule | Xxx |
    m = re.search(r'\|\s*Schedule\s*\|\s*([^|\r\n]+)', content)
    if m:
        schedule = m.group(1).strip()

    # | Contact Email | xxx@yyy.com |  or  | Email | xxx |
    m = re.search(r'\|\s*(?:Contact\s+)?Email\s*\|\s*([^|\r\n]+)', content)
    if m:
        contact_email = m.group(1).strip()

    return customer, schedule, contact_email


def tokenize(name):
    """Split name into matchable keywords, ignoring common noise."""
    noise = {"ag", "ltd", "co", "inc", "corp", "gmbh", "sa", "group", "global",
             "unified", "china", "cloud", "中国", "有限公司", "generic", "account",
             "arr", "enterprise", "support", "mooncake", "21vianet", "azure",
             "company", "limited", "the", "and", "for", "some", "new", "test",
             "international", "technology", "technologies", "services", "solutions"}
    # Known aliases: customer field abbreviation → CC list keyword
    aliases = {
        "bba": "bmw",           # BMW Brilliance Automotive = BMW
        "vw": "volkswagen",
        "pg": "procter",        # P&G = Procter & Gamble
        "p&g": "procter",
        "daimler": "mercedes",
        "benz": "mercedes",
    }
    # Split on spaces, slashes, dashes, parentheses, pipes
    tokens = re.split(r'[\s/\-|()（）·,;]+', name.lower())
    result = set()
    for t in tokens:
        if len(t) >= 2 and t not in noise:
            result.add(t)
            # Expand aliases
            if t in aliases:
                result.add(aliases[t])
    return result


def find_match(customer, schedule, contact_email, accounts):
    """Try to match customer against mooncake-cc accounts."""

    # Build token index from accounts
    account_tokens = {}
    for acc in accounts:
        name = acc.get("account", "")
        tokens = tokenize(name)
        account_tokens[name] = tokens

    # Strategy 1: Customer field keyword match
    if customer and customer.lower() != "generic account":
        cust_tokens = tokenize(customer)
        for acc_name, acc_tokens in account_tokens.items():
            overlap = cust_tokens & acc_tokens
            # Require at least one meaningful overlap token (len >= 3 or exact short match like "ey")
            meaningful = {t for t in overlap if len(t) >= 3 or t in acc_tokens}
            if meaningful:
                return acc_name

    # Strategy 2: Schedule field keyword match (fallback)
    if schedule:
        sched_tokens = tokenize(schedule)
        for acc_name, acc_tokens in account_tokens.items():
            overlap = sched_tokens & acc_tokens
            if overlap and len(overlap) >= 1:
                return acc_name

    # Strategy 3: Contact email domain match (last resort)
    # e.g. contact@volkswagen.com → match "Volkswagen"
    if contact_email and "@" in contact_email:
        domain = contact_email.split("@")[1].split(".")[0].lower()
        if len(domain) >= 3:
            for acc_name, acc_tokens in account_tokens.items():
                if domain in acc_tokens or domain in acc_name.lower():
                    return acc_name

    return ""


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--case-dir", required=True)
    p.add_argument("--data-root", default="../data")
    args = p.parse_args()

    accounts = load_cc_list(args.data_root)
    if not accounts:
        print("ccAccount=|ccEmails=")
        return

    customer, schedule, contact_email = extract_case_fields(args.case_dir)
    matched_name = find_match(customer, schedule, contact_email, accounts)

    if matched_name:
        # Find CC emails
        for acc in accounts:
            if acc.get("account") == matched_name:
                cc = acc.get("cc", "")
                # Clean up placeholder text
                cc = re.sub(r'\s*<Replace with POD alias>\s*', '', cc)
                cc = cc.strip("; ")
                print(f"ccAccount={matched_name}|ccEmails={cc}")
                return

    print("ccAccount=|ccEmails=")


if __name__ == "__main__":
    main()
