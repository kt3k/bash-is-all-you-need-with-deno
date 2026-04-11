import Anthropic from "@anthropic-ai/sdk"
import { text } from "node:stream/consumers"

const client = new Anthropic()
const dec = new TextDecoder()

const TOOL_DESCRIPTION = `
シェルコマンドを実行する。
Patterns:
- Read: cat/grep/find/ls
- Write: echo '...' > file
- Subagent: deno -A --env agent.ts "task description"
`.trim()

const bashTool: Anthropic.Tool = {
  name: "bash",
  description: TOOL_DESCRIPTION,
  input_schema: {
    type: "object",
    properties: { command: { type: "string" } },
    required: ["command"],
  },
}

const SYSTEM =
  `CLI agent at ${Deno.cwd()}. Use bash. Spawn subagent for complex tasks.`

async function chat(prompt: string, history: Anthropic.MessageParam[] = []) {
  history.push({ role: "user", content: prompt })
  while (true) {
    const r = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: SYSTEM,
      tools: [bashTool],
      messages: history,
    })
    history.push({ role: "assistant", content: r.content })
    if (r.stop_reason !== "tool_use") {
      // tool_use でなければ終了
      return r.content.filter((b) => "text" in b).map((b) => b.text).join("")
    }
    const results = [] as Anthropic.ToolResultBlockParam[]
    for (const b of r.content) {
      if (b.type === "tool_use") {
        // bash 呼び出し
        const command = (b.input as { command: string }).command
        console.log(`bash -c %c"${command}"`, "color: cyan")
        let output: string
        if (confirm("Allow?")) {
          if (command.startsWith("deno -A --env agent.ts")) {
            const cp = await Deno.spawn("bash", {
              args: ["-c", command],
              stdout: "piped",
              stderr: "piped",
            })
            const stdout = cp.stdout.tee()
            stdout[0].pipeTo(Deno.stdout.writable)
            const stderr = cp.stderr.tee()
            stderr[0].pipeTo(Deno.stderr.writable)
            output = await Promise.all([text(stdout[1]), text(stderr[1])])
              .then(([a, b]) => a + b)
          } else {
            const { stdout, stderr } = await Deno.spawnAndWait("bash", {
              args: ["-c", command],
            })
            output = dec.decode(stdout) + dec.decode(stderr)
          }
        } else {
          output = "permission denied by user"
        }
        results.push({
          type: "tool_result",
          content: output,
          tool_use_id: b.id,
        })
      } else if (b.type === "text") {
        console.log("⏺", b.text)
      }
    }
    history.push({ role: "user", content: results })
  }
}

async function main() {
  if (Deno.args.length > 0) {
    // サブエージェントモード
    const id = Math.random().toString(36).slice(2, 5)
    console.log(`subagent ${id} started`)
    console.log(await chat(Deno.args[0]))
    console.log(`subagent ${id} ended`)
    return
  }
  // 履歴
  const h = [] as Anthropic.MessageParam[]

  while (true) {
    const p = prompt(">>")
    // 空入力 or q で終了
    if (p === null || p === "" || p === "q") {
      return
    }
    console.log(await chat(p, h))
  }
}

main()
