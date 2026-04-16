#!/usr/bin/env python3
"""
Convert _mcp-raw.json (raw MCP responses) → _input.json (write-teams.ps1 format).

Usage:
    python3 build-input-from-raw.py <case_dir>

Reads:  {case_dir}/teams/_mcp-raw.json
Writes: {case_dir}/teams/_input.json

_mcp-raw.json schema (written by teams-search-queue):
{
    "_version": 2,
    "_fetchedAt": "ISO timestamp",
    "caseNumber": "260xxx",
    "searchResults": [
        { "keyword": "...", "status": "success", "chatIds": ["19:..."] }
    ],
    "chatMessages": {
        "19:chatId1": [
            { "id": "...", "createdDateTime": "...",
              "from": { "user": { "displayName": "...", "id": "..." } },
              "body": { "contentType": "...", "content": "..." } }
        ]
    },
    "searchMode": "full",
    "fallbackTriggered": false,
    "elapsed": 6.2
}

_input.json schema (for write-teams.ps1):
{
    "caseNumber": "260xxx",
    "searchResults": [...],
    "chats": [
        { "chatId": "19:...", "messages": [
            { "id": "...", "createdDateTime": "...",
              "from": { "displayName": "..." },
              "body": { "contentType": "...", "content": "..." } }
        ] }
    ],
    "searchMode": "full",
    "fallbackTriggered": false,
    "elapsed": 6.2
}
"""

import json
import os
import sys


def flatten_from(msg_from):
    """MCP returns from.user.displayName, write-teams expects from.displayName."""
    if not msg_from:
        return {"displayName": "Unknown"}

    # Already flat format (from.displayName)
    if "displayName" in msg_from and "user" not in msg_from:
        return msg_from

    # MCP format (from.user.displayName)
    user = msg_from.get("user") or msg_from.get("application") or {}
    display_name = user.get("displayName", "Unknown")
    return {"displayName": display_name}


def transform_message(msg):
    """Transform a single message from MCP format to write-teams format."""
    return {
        "id": msg.get("id", ""),
        "createdDateTime": msg.get("createdDateTime", ""),
        "from": flatten_from(msg.get("from")),
        "body": msg.get("body", {"contentType": "Text", "content": ""})
    }


def build_input(raw_data):
    """Convert _mcp-raw.json to _input.json format."""
    chat_messages = raw_data.get("chatMessages", {})

    chats = []
    for chat_id, messages in chat_messages.items():
        if not messages:
            continue
        transformed_messages = [transform_message(m) for m in messages]
        # Filter out empty/system messages
        transformed_messages = [
            m for m in transformed_messages
            if m["from"]["displayName"] != "Unknown"
            and m["body"].get("content", "").strip()
            and m["body"]["content"] != "<systemEventMessage/>"
        ]
        if transformed_messages:
            chats.append({
                "chatId": chat_id,
                "messages": transformed_messages
            })

    return {
        "caseNumber": raw_data.get("caseNumber", ""),
        "searchResults": raw_data.get("searchResults", []),
        "chats": chats,
        "searchMode": raw_data.get("searchMode", "full"),
        "fallbackTriggered": raw_data.get("fallbackTriggered", False),
        "elapsed": raw_data.get("elapsed", 0)
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 build-input-from-raw.py <case_dir>", file=sys.stderr)
        sys.exit(1)

    case_dir = sys.argv[1]
    raw_path = os.path.join(case_dir, "teams", "_mcp-raw.json")
    input_path = os.path.join(case_dir, "teams", "_input.json")

    if not os.path.exists(raw_path):
        print(f"ERROR|{raw_path} not found", file=sys.stderr)
        sys.exit(1)

    with open(raw_path, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    input_data = build_input(raw_data)

    with open(input_path, "w", encoding="utf-8") as f:
        json.dump(input_data, f, indent=2, ensure_ascii=False)

    total_chats = len(input_data["chats"])
    total_msgs = sum(len(c["messages"]) for c in input_data["chats"])
    print(f"OK|chats={total_chats}|msgs={total_msgs}|path={input_path}")


if __name__ == "__main__":
    main()
