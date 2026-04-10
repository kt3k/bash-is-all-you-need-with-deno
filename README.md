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

### top selling PC scraper

```shellsession
```

## License

MIT
