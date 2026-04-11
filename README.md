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

## License

MIT
