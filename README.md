# bash only coding agent

This demo is inspired by
[this reddit thread](https://www.reddit.com/r/ClaudeAI/comments/1ql4t00/write_a_claude_code_with_16_line_code_bash_is_all/).

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

### Prompt: `read the source code and summarize very briefly`

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

### Prompt: `count the html tags in www.google.com`

```shellsession
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
```

### Prompt: `write a script to check the current ip address of the machine`

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

```shellsession
$ ./check_ip.sh 

╔══════════════════════════════════════╗
║        🌐  IP Address Checker        ║
╚══════════════════════════════════════╝

🔒  Local / Private IP Address
  ──────────────────────────────────
  ✔  IP Address : 172.20.10.4

🌍  Public / External IP Address
  ──────────────────────────────────
  ✔  IP Address : xxx.xxx.xxx.xxx

  ──────────────────────────────────────
  Checked at: 2026-04-13 15:31:52 JST
  ──────────────────────────────────────
```

## Example runs with gpt-5.4

There is also OpenAI version of script (`agent_openai.ts`). The below shows the
example runs with it

### Prompt: `read the source code and summarize very briefly`

```shellsession
$ deno -A --env agent_openai.ts
>> read the source code and summarize very briefly
bash -c "cd /Users/kt3k/oss/bash-is-all-you-need-with-deno && find . -maxdepth 2 \( -name node_modules -o -name .git \) -prune -o -type f | sort | sed 's#^./##' | head -200"
Allow? [y/N] y
bash -c "cd /Users/kt3k/oss/bash-is-all-you-need-with-deno && sed -n '1,220p' README.md"
Allow? [y/N] y
bash -c "cd /Users/kt3k/oss/bash-is-all-you-need-with-deno && sed -n '1,220p' agent.ts"
Allow? [y/N] y
bash -c "cd /Users/kt3k/oss/bash-is-all-you-need-with-deno && sed -n '1,260p' agent_openai.ts"
Allow? [y/N] y
bash -c "cd /Users/kt3k/oss/bash-is-all-you-need-with-deno && sed -n '1,220p' check_ip.sh"
Allow? [y/N] y
bash -c "cd /Users/kt3k/oss/bash-is-all-you-need-with-deno && cat deno.json && printf '\n---\n' && cat package.json"
Allow? [y/N] y
A tiny Deno CLI coding agent that gives the model just one tool: `bash`.

- `agent.ts`: Anthropic-based version
- `agent_openai.ts`: OpenAI-based version
- Both run in a loop: ask model → execute requested shell commands with user approval → feed output back
- Supports subagents by recursively launching itself via shell
- `check_ip.sh` is an example/generated utility script for showing local and public IPs

Core idea: bash alone is enough to build a practical agent.
```

### Prompt: `count the html tags in www.google.com`

```shellsession
$ deno -A --env agent_openai.ts
>> count the html tags in www.google.com
bash -c "python - <<'PY'
import urllib.request, re
html = urllib.request.urlopen('https://www.google.com').read().decode('utf-8', 'ignore')
# count opening/closing/self-closing tag occurrences, excluding comments/doctype loosely
matches = re.findall(r'<\s*/?\s*([a-zA-Z][a-zA-Z0-9:-]*)\b[^>]*?>', html)
from collections import Counter
c = Counter(m.lower() for m in matches)
for tag, n in sorted(c.items(), key=lambda x: (-x[1], x[0])):
    print(f'{tag}\t{n}')
print('TOTAL\t' + str(sum(c.values())))
PY"
Allow? [y/N] y
bash -c "python3 - <<'PY'
import urllib.request, re
html = urllib.request.urlopen('https://www.google.com').read().decode('utf-8', 'ignore')
matches = re.findall(r'<\s*/?\s*([a-zA-Z][a-zA-Z0-9:-]*)\b[^>]*?>', html)
from collections import Counter
c = Counter(m.lower() for m in matches)
for tag, n in sorted(c.items(), key=lambda x: (-x[1], x[0])):
    print(f'{tag}\t{n}')
print('TOTAL\t' + str(sum(c.values())))
PY"
Allow? [y/N] y
bash -c "curl -L -s https://www.google.com | python3 - <<'PY'
import sys, re
from collections import Counter
html = sys.stdin.read()
matches = re.findall(r'<\s*/?\s*([a-zA-Z][a-zA-Z0-9:-]*)\b[^>]*?>', html)
c = Counter(m.lower() for m in matches)
for tag, n in sorted(c.items(), key=lambda x: (-x[1], x[0])):
    print(f'{tag}\t{n}')
print('TOTAL\t' + str(sum(c.values())))
PY"
Allow? [y/N] y
bash -c "curl -L -s https://www.google.com | head -c 500 | sed -n '1,20p'"
Allow? [y/N] y
bash -c "tmp=$(mktemp); curl -L -s https://www.google.com > "$tmp"; python3 - <<'PY' "$tmp"
import sys, re
from collections import Counter
path = sys.argv[1]
html = open(path, encoding='utf-8', errors='ignore').read()
matches = re.findall(r'<\s*/?\s*([a-zA-Z][a-zA-Z0-9:-]*)\b[^>]*?>', html)
c = Counter(m.lower() for m in matches)
for tag, n in sorted(c.items(), key=lambda x: (-x[1], x[0])):
    print(f'{tag}\t{n}')
print('TOTAL\t' + str(sum(c.values())))
PY
rm "$tmp""
Allow? [y/N] y
I counted the HTML tag occurrences in the current HTML returned by `https://www.google.com`.

Top counts:
- `div`: 38
- `a`: 25
- `script`: 15
- `span`: 12
- `input`: 10
- `td`: 6
- `br`: 5
- `meta`: 4
- `g`: 3

Full count:
div         38
a           25
script      15
span        12
input       10
td          6
br          5
meta        4
g           3
arguments   2
b           2
body        2
c           2
center      2
d           2
e           2
form        2
head        2
html        2
image       2
p           2
path        2
style       2
svg         2
table       2
title       2
tr          2
h           1
img         1
n           1
TOTAL       157

Note: this was counted from raw HTML with a regex, so some entries like `arguments`, `c`, `d`, `e`, `h`, `n` may come from inline SVG/math/script-like markup or parsing artifacts rather than normal HTML elements.

If you want, I can also give:
- only standard HTML tags
- counts grouped by opening vs closing tags
- a more accurate DOM-based count using an HTML parser
>>
```

## License

MIT
