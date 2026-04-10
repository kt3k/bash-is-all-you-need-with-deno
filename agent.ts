import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()
const dec = new TextDecoder()

const TOOL_DESCRIPTION = `
シェルコマンドを実行する。
Patterns:
- Read: cat/grep/find/ls
- Write: echo '...' > file
- Subagent: deno -A agent.ts "task description"
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
        if (confirm("許可?")) {
          const { stdout, stderr } = await Deno.spawnAndWait("bash", {
            args: ["-c", command],
          })
          output = dec.decode(stdout) + dec.decode(stderr)
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
    console.log(await chat(Deno.args[0]))
    return
  }
  // 履歴
  const h = [] as Anthropic.MessageParam[]

  while (true) {
    const p = prompt(">> ")
    // 空入力 or q で終了
    if (p === null || p === "" || p === "q") {
      return
    }
    console.log(await chat(p, h))
  }
}

main()
