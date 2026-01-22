---
description: Manage MCP servers across Claude Code, Cursor, Codex, and OpenCode
argument-hint: <add|remove|list|sync> [server-name]
---

# MCP Server Manager

Manage MCP server configurations across multiple AI coding tools.

**Command**: $ARGUMENTS

## Context

- Project root: !`pwd`
- Claude Code config: !`test -f .mcp.json && echo "✅ exists" || echo "❌ missing"`
- Cursor config: !`test -f .cursor/mcp.json && echo "✅ exists" || echo "❌ missing"`
- Codex config: !`test -f .codex/config.toml && echo "✅ exists" || echo "❌ missing"`
- OpenCode config: !`test -f opencode.json && echo "✅ exists" || echo "❌ missing"`

## Supported Tools & Config Locations

| Tool        | Config File          | Format | Env Var Syntax       |
| ----------- | -------------------- | ------ | -------------------- |
| Claude Code | `.mcp.json`          | JSON   | `${VAR}`             |
| Cursor      | `.cursor/mcp.json`   | JSON   | `${env:VAR}`         |
| Codex       | `.codex/config.toml` | TOML   | `env_vars = ["VAR"]` |
| OpenCode    | `opencode.json`      | JSON   | `{env:VAR}`          |

---

## Commands

### List: Show Current MCP Servers

```bash
# Claude Code
cat .mcp.json 2>/dev/null | jq '.mcpServers | keys[]' 2>/dev/null || echo "No .mcp.json"

# Cursor
cat .cursor/mcp.json 2>/dev/null | jq '.mcpServers | keys[]' 2>/dev/null || echo "No .cursor/mcp.json"

# OpenCode
cat opencode.json 2>/dev/null | jq '.mcp | keys[]' 2>/dev/null || echo "No opencode.json"

# Codex
grep '^\[mcp_servers\.' .codex/config.toml 2>/dev/null | sed 's/\[mcp_servers\.\(.*\)\]/\1/' || echo "No .codex/config.toml"
```

---

## Config Formats (Based on Real Examples)

### Local Server (stdio)

**Claude Code** (`.mcp.json`):

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "slack-mcp-server@latest", "--transport", "stdio"],
      "env": {
        "SLACK_MCP_XOXP_TOKEN": "${SLACK_MCP_XOXP_TOKEN}",
        "SLACK_MCP_ADD_MESSAGE_TOOL": "${SLACK_MCP_ADD_MESSAGE_TOOL}"
      }
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "slack-mcp-server@latest", "--transport", "stdio"],
      "env": {
        "SLACK_MCP_XOXP_TOKEN": "${env:SLACK_MCP_XOXP_TOKEN}",
        "SLACK_MCP_ADD_MESSAGE_TOOL": "${env:SLACK_MCP_ADD_MESSAGE_TOOL}"
      }
    }
  }
}
```

**Codex** (`.codex/config.toml`):

```toml
[mcp_servers.slack]
command = "npx"
args = ["-y", "slack-mcp-server@latest", "--transport", "stdio"]
env_vars = ["SLACK_MCP_XOXP_TOKEN", "SLACK_MCP_ADD_MESSAGE_TOOL"]
```

**OpenCode** (`opencode.json`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "slack": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "slack-mcp-server@latest",
        "--transport",
        "stdio"
      ],
      "enabled": true,
      "environment": {
        "SLACK_MCP_XOXP_TOKEN": "{env:SLACK_MCP_XOXP_TOKEN}",
        "SLACK_MCP_ADD_MESSAGE_TOOL": "{env:SLACK_MCP_ADD_MESSAGE_TOOL}"
      }
    }
  }
}
```

### Remote Server (HTTP)

**Claude Code** (`.mcp.json`):

```json
{
  "mcpServers": {
    "notion": {
      "type": "http",
      "url": "https://mcp.notion.com/mcp"
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "notion": {
      "url": "https://mcp.notion.com/mcp"
    }
  }
}
```

**Codex** (`.codex/config.toml`):

```toml
[mcp_servers.notion]
url = "https://mcp.notion.com/mcp"
```

**OpenCode** (`opencode.json`):

```json
{
  "mcp": {
    "notion": {
      "type": "remote",
      "url": "https://mcp.notion.com/mcp",
      "enabled": true
    }
  }
}
```

---

## Key Differences Summary

| Aspect           | Claude Code      | Cursor       | Codex                | OpenCode           |
| ---------------- | ---------------- | ------------ | -------------------- | ------------------ |
| **Env syntax**   | `${VAR}`         | `${env:VAR}` | `env_vars = ["VAR"]` | `{env:VAR}`        |
| **Env field**    | `env`            | `env`        | `env_vars` (array)   | `environment`      |
| **Command**      | string           | string       | string               | array              |
| **Remote type**  | `"type": "http"` | (none)       | (none)               | `"type": "remote"` |
| **Local type**   | (none)           | (none)       | (none)               | `"type": "local"`  |
| **Enabled flag** | (none)           | (none)       | (none)               | `"enabled": true`  |

---

## Popular MCP Servers

### Context7 (Documentation)

```
Command: npx -y @upstash/context7-mcp
Type: local
```

---

## Add New Server Workflow

When adding a new MCP server:

### Step 1: Gather Info

1. **Server name** (e.g., `context7`, `notion`)
2. **Type**: Local (command) or Remote (URL)
3. **For local**: Command, args, required env vars
4. **For remote**: URL

### Step 2: Update All 4 Files

Use the formats above to add to each config file.

### Step 3: Document Env Vars

Add required env vars to `.env.example`:

```bash
# MCP: Slack
SLACK_MCP_XOXP_TOKEN=xoxp-your-token
SLACK_MCP_ADD_MESSAGE_TOOL=true
```

---

## Important Notes

### 🔐 Security: Never Commit Secrets

- Use env var references, not actual values
- Add `.env` to `.gitignore`
- Document required vars in `.env.example`

### ⚠️ Tool-Specific Gotchas

**Claude Code**:

- First use of project `.mcp.json` may trigger security confirmation
- Remote servers use `"type": "http"`

**Cursor**:

- Uses `${env:VAR}` (not `${VAR}`)
- Project-level may not work on Windows → fallback to `~/.cursor/mcp.json`

**Codex**:

- Uses `env_vars = ["VAR"]` array format (not key-value mapping)
- Default reads `~/.codex/config.toml`, NOT project level
- Workaround: `ln -s "$(pwd)/.codex/config.toml" ~/.codex/config.toml`
- Or run with: `CODEX_HOME="$PWD/.codex" codex`

**OpenCode**:

- Uses `{env:VAR}` syntax
- `command` is an array `["npx", "-y", "..."]`
- Field is `environment`, not `env`
- Requires `"enabled": true`

---

## Validation

```bash
# Validate JSON
cat .mcp.json | jq . > /dev/null && echo "✅ .mcp.json"
cat .cursor/mcp.json | jq . > /dev/null && echo "✅ .cursor/mcp.json"
cat opencode.json | jq . > /dev/null && echo "✅ opencode.json"

# Validate TOML (requires tomlq or similar)
cat .codex/config.toml | head -1 && echo "✅ .codex/config.toml exists"
```

---

## Full Example: Adding All 4 Configs

Here's a complete example adding `slack` and `notion`:

**.mcp.json** (Claude Code):

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "slack-mcp-server@latest", "--transport", "stdio"],
      "env": {
        "SLACK_MCP_XOXP_TOKEN": "${SLACK_MCP_XOXP_TOKEN}",
        "SLACK_MCP_ADD_MESSAGE_TOOL": "${SLACK_MCP_ADD_MESSAGE_TOOL}"
      }
    },
    "notion": {
      "type": "http",
      "url": "https://mcp.notion.com/mcp"
    }
  }
}
```

**.cursor/mcp.json** (Cursor):

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "slack-mcp-server@latest", "--transport", "stdio"],
      "env": {
        "SLACK_MCP_XOXP_TOKEN": "${env:SLACK_MCP_XOXP_TOKEN}",
        "SLACK_MCP_ADD_MESSAGE_TOOL": "${env:SLACK_MCP_ADD_MESSAGE_TOOL}"
      }
    },
    "notion": {
      "url": "https://mcp.notion.com/mcp"
    }
  }
}
```

**.codex/config.toml** (Codex):

```toml
# MCP servers (project copy)
# Tip: ln -s "$(pwd)/.codex/config.toml" ~/.codex/config.toml

[mcp_servers.slack]
command = "npx"
args = ["-y", "slack-mcp-server@latest", "--transport", "stdio"]
env_vars = ["SLACK_MCP_XOXP_TOKEN", "SLACK_MCP_ADD_MESSAGE_TOOL"]

[mcp_servers.notion]
url = "https://mcp.notion.com/mcp"
```

**opencode.json** (OpenCode):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "slack": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "slack-mcp-server@latest",
        "--transport",
        "stdio"
      ],
      "enabled": true,
      "environment": {
        "SLACK_MCP_XOXP_TOKEN": "{env:SLACK_MCP_XOXP_TOKEN}",
        "SLACK_MCP_ADD_MESSAGE_TOOL": "{env:SLACK_MCP_ADD_MESSAGE_TOOL}"
      }
    },
    "notion": {
      "type": "remote",
      "url": "https://mcp.notion.com/mcp",
      "enabled": true
    }
  }
}
```

## Related Documentation

- [Claude Code MCP](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [Cursor MCP](https://docs.cursor.com/context/model-context-protocol)
- [Codex MCP](https://developers.openai.com/codex/mcp/)
- [OpenCode MCP](https://opencode.ai/docs/mcp-servers/)
