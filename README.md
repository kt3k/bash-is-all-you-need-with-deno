# bash only coding agent

This demo is inspired by [this reddit thread](https://www.reddit.com/r/ClaudeAI/comments/1ql4t00/write_a_claude_code_with_16_line_code_bash_is_all/).

## How to run

Set .env with `ANTHROPIC_API_KEY`

```sh
ANTHROPIC_API_KEY=sk-ant-....
```

Run agent

```
deno -A --env agent.ts
```

## Example runs

### Review this code base

```shellsession
$ deno -A --env agent.ts
>> read the source code and summarize very briefly
bash -c "find . -type f | head -50 && echo "---" && cat README.md 2>/dev/null || true"
Allow? [y/N] y
bash -c "cat agent.ts"
Allow? [y/N] y
## Summary

**bash-is-all-you-need-with-deno** is a minimal CLI coding agent (~80 lines) built with Deno and the Anthropic SDK.

### How it works:
1. **Single tool** — Claude is given only one tool: `bash`, which can run any shell command.
2. **Agentic loop** — It repeatedly calls Claude, executes bash commands, feeds results back, until Claude stops requesting tools.
3. **User approval** — Before each bash command runs, the user is prompted `Allow?` for safety.
4. **Two modes:**
   - **Interactive** (`deno -A agent.ts`) — REPL loop with persistent message history.
   - **Subagent** (`deno -A agent.ts "task"`) — Single-shot execution, enabling Claude to spawn child agents for complex subtasks.

The core idea (inspired by a Reddit thread) is that `bash` alone is sufficient as a universal tool — Claude can read/write files, search code, and delegate to subagents, all through shell commands.
```

### Count the html tags in a url

- Prompt: `count the html tags in www.google.com`

````shellsession
$ deno -A --env agent.ts
>> count the html tags in www.google.com
⏺ I'll fetch the Google homepage and count the HTML tags for you!
bash -c "curl -s https://www.google.com | grep -oP '<[a-zA-Z][a-zA-Z0-9]*' | sort | uniq -c | sort -rn"
Allow? [y/N] y
bash -c "curl -s https://www.google.com | grep -oE '<[a-zA-Z][a-zA-Z0-9]*' | sort | uniq -c | sort -rn"
Allow? [y/N] y
Here's a summary of the **HTML tags found on www.google.com**:

> ⚠️ Note: Some results like `<e`, `<d`, `<arguments`, `<this`, etc. are **not real HTML tags** — they are JavaScript code patterns that happen to match the `<word` pattern. Below is a clean breakdown of **actual HTML tags only**:

| Count | Tag |
|-------|-----|
| 19 | `<div` |
| 19 | `<a` |
| 10 | `<input` |
| 9 | `<script` |
| 6 | `<span` |
| 5 | `<br` |
| 4 | `<meta` |
| 4 | `<b` |
| 3 | `<td` |
| 1 | `<tr` |
| 1 | `<title` |
| 1 | `<table` |
| 1 | `<svg` |
| 1 | `<style` |
| 1 | `<path` |
| 1 | `<p` |
| 1 | `<img` |
| 1 | `<image` |
| 1 | `<html` |
| 1 | `<head` |
| 1 | `<form` |
| 1 | `<center` |
| 1 | `<body` |

### 📊 Total: ~**101 real HTML tag instances** across **23 unique tag types**

Google's homepage is intentionally **very minimal** in its HTML structure — most of the complexity is loaded dynamically via JavaScript.
````

### Write a script to show the current ip address

- Prompt: `write a script to check the current ip address of the machine`

````
$ deno -A --env agent.ts
>> write a script to check the current ip address of the machine
bash -c "ls"
Allow? [y/N] y
bash -c "cat deno.json"
Allow? [y/N] y
bash -c "deno -A --env agent.ts "Write a script called check_ip.sh that checks the current IP address of the machine. It should show both the local/private IP and the public IP address. Make it readable with clear labels.""
Allow? [y/N] y
subagent 0u2 started
bash -c "cat << 'EOF' > check_ip.sh
#!/bin/bash

# ─────────────────────────────────────────
#         IP Address Checker Script
# ─────────────────────────────────────────

BOLD="\033[1m"
CYAN="\033[1;36m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
RESET="\033[0m"

print_header() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════╗${RESET}"
  echo -e "${CYAN}║        🌐  IP Address Checker        ║${RESET}"
  echo -e "${CYAN}╚══════════════════════════════════════╝${RESET}"
  echo ""
}

print_section() {
  echo -e "${BOLD}$1${RESET}"
  echo -e "  ──────────────────────────────────"
}

get_local_ip() {
  print_section "🔒  Local / Private IP Address"

  # Try ip command first (Linux), fall back to ifconfig (macOS/BSD)
  if command -v ip &>/dev/null; then
    LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K[\d.]+')
  elif command -v ifconfig &>/dev/null; then
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
  fi

  if [[ -n "$LOCAL_IP" ]]; then
    echo -e "  ${GREEN}✔  IP Address : ${BOLD}$LOCAL_IP${RESET}"
  else
    echo -e "  ${RED}✘  Could not determine local IP address.${RESET}"
  fi
  echo ""
}

get_public_ip() {
  print_section "🌍  Public / External IP Address"

  # Try multiple public IP services for reliability
  PUBLIC_IP=$(curl -sf --max-time 5 https://api.ipify.org \
           || curl -sf --max-time 5 https://ifconfig.me \
           || curl -sf --max-time 5 https://icanhazip.com \
           || curl -sf --max-time 5 https://ipecho.net/plain)

  if [[ -n "$PUBLIC_IP" ]]; then
    echo -e "  ${GREEN}✔  IP Address : ${BOLD}$PUBLIC_IP${RESET}"
  else
    echo -e "  ${RED}✘  Could not determine public IP. Check your internet connection.${RESET}"
  fi
  echo ""
}

print_footer() {
  echo -e "${CYAN}  ──────────────────────────────────────${RESET}"
  echo -e "  ${YELLOW}Checked at: $(date '+%Y-%m-%d %H:%M:%S %Z')${RESET}"
  echo -e "${CYAN}  ──────────────────────────────────────${RESET}"
  echo ""
}

print_header
get_local_ip
get_public_ip
print_footer
EOF
chmod +x check_ip.sh
echo "Script created successfully!""
Allow? [y/N] y
bash -c "./check_ip.sh"
Allow? [y/N] y
Working perfectly! Here's a breakdown of everything the script does:

---

### 📄 `check_ip.sh` — What's inside

#### 🎨 Styling
- Uses ANSI color codes for **bold**, **cyan**, **green**, **yellow**, and **red** output
- Draws a styled box header and divider lines for clean readability

#### 🔒 Local IP Detection (`get_local_ip`)
| Method | Used for |
|---|---|
| `ip route get 1.1.1.1` | Linux — finds the source IP used to reach the internet |
| `ifconfig \| grep inet` | macOS/BSD fallback — picks the first non-loopback address |

Filters out `127.0.0.1` (localhost) so you always get the real network IP.

#### 🌍 Public IP Detection (`get_public_ip`)
Tries **4 different public IP services** in order, stopping at the first success:
1. `api.ipify.org`
2. `ifconfig.me`
3. `icanhazip.com`
4. `ipecho.net/plain`

Each has a **5-second timeout** to avoid hanging. If all fail, a friendly error message is shown.

#### 🕐 Footer
- Prints the **exact timestamp** of when the check was run, including timezone.
subagent 0u2 ended
The script `check_ip.sh` has been created! Here's a summary of what it does:

---

### 📄 `check_ip.sh`

**Run it with:**
```bash
./check_ip.sh
```

---

### ✨ Features

#### 🔒 Local / Private IP
Detects your machine's IP on the local network:
- Uses **`ip route`** on Linux
- Falls back to **`ifconfig`** on macOS/BSD
- Automatically filters out `127.0.0.1` (localhost)

#### 🌍 Public / External IP
Fetches your public-facing IP by querying **4 reliable services** in order (with a 5s timeout each):
1. `api.ipify.org`
2. `ifconfig.me`
3. `icanhazip.com`
4. `ipecho.net/plain`

#### 🎨 Clean Output
- Color-coded and formatted output with a styled header
- ✔ / ✘ status indicators
- Timestamp of when the check was run
- Graceful error messages if IP can't be determined
````

## License

MIT
