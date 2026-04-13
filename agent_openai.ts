import OpenAI from "openai"
import { text } from "node:stream/consumers"

const client = new OpenAI()
const dec = new TextDecoder()

const TOOL_DESCRIPTION = `
シェルコマンドを実行する。
Patterns:
- Read: cat/grep/find/ls
- Write: echo '...' > file
- Subagent: deno -A --env agent_openai.ts "task description"
`.trim()

const bashTool: OpenAI.ChatCompletionTool = {
  type: "function",
  function: {
    name: "bash",
    description: TOOL_DESCRIPTION,
    parameters: {
      type: "object",
      properties: { command: { type: "string" } },
      required: ["command"],
    },
  },
}

const SYSTEM =
  `CLI agent at ${Deno.cwd()}. Use bash. Spawn subagent for complex tasks.`

async function chat(
  prompt: string,
  history: OpenAI.ChatCompletionMessageParam[] = [],
) {
  history.push({ role: "user", content: prompt })
  while (true) {
    const r = await client.chat.completions.create({
      model: "gpt-5.4",
      max_tokens: 8000,
      messages: [
        { role: "system", content: SYSTEM },
        ...history,
      ],
      tools: [bashTool],
    })
    const msg = r.choices[0].message
    history.push(msg)
    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      // tool_call でなければ終了
      return msg.content ?? ""
    }
    for (const tc of msg.tool_calls) {
      if (tc.type !== "function") continue
      // bash 呼び出し
      const command = JSON.parse(tc.function.arguments).command as string
      console.log(`bash -c %c"${command}"`, "color: cyan")
      let output: string
      if (confirm("Allow?")) {
        if (command.startsWith("deno -A --env agent_openai.ts")) {
          const cp = await Deno.spawn("bash", {
            args: ["-c", command],
            stdout: "piped",
            stderr: "piped",
          })
          const stdout = cp.stdout.tee()
          stdout[0].pipeTo(Deno.stdout.writable, { preventClose: true })
          const stderr = cp.stderr.tee()
          stderr[0].pipeTo(Deno.stderr.writable, { preventClose: true })
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
      history.push({
        role: "tool",
        content: output,
        tool_call_id: tc.id,
      })
    }
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
  const h = [] as OpenAI.ChatCompletionMessageParam[]

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
