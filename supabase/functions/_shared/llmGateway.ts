/**
 * Shared Lovable AI gateway client for all worker edge functions.
 * Uses google/gemini-2.5-flash by default (fast, cheap, good for extraction).
 * Uses google/gemini-3-flash-preview for complex reasoning tasks.
 */

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmToolFunction {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface LlmTool {
  type: "function";
  function: LlmToolFunction;
}

export interface LlmOptions {
  model?: string;
  temperature?: number;
  tools?: LlmTool[];
  tool_choice?: { type: "function"; function: { name: string } };
  timeoutMs?: number;
}

export interface LlmResult {
  ok: boolean;
  content?: string;
  toolCall?: { name: string; arguments: Record<string, unknown> };
  error?: string;
  status?: number;
}

/**
 * Call the Lovable AI gateway. Returns parsed content or tool call result.
 */
export async function callLlm(
  messages: LlmMessage[],
  options: LlmOptions = {},
): Promise<LlmResult> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return { ok: false, error: "LOVABLE_API_KEY not configured" };

  const model = options.model || "google/gemini-2.5-flash";
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.1,
  };
  if (options.tools) {
    body.tools = options.tools;
    if (options.tool_choice) body.tool_choice = options.tool_choice;
  }

  const timeoutMs = options.timeoutMs || 30_000;

  try {
    const resp = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      return { ok: false, error: `AI gateway ${resp.status}: ${errText.slice(0, 500)}`, status: resp.status };
    }

    const data = await resp.json();
    const choice = data.choices?.[0];
    if (!choice) return { ok: false, error: "No choices in AI response" };

    // Tool call response
    const toolCall = choice.message?.tool_calls?.[0];
    if (toolCall?.function) {
      const args = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
      return { ok: true, toolCall: { name: toolCall.function.name, arguments: args } };
    }

    // Text response
    const content = choice.message?.content ?? "";
    return { ok: true, content };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `LLM call failed: ${msg}` };
  }
}

/**
 * Call LLM expecting JSON response (parses from content).
 */
export async function callLlmJson<T = Record<string, unknown>>(
  messages: LlmMessage[],
  options: LlmOptions = {},
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const result = await callLlm(messages, options);
  if (!result.ok) return { ok: false, error: result.error };

  if (result.toolCall) {
    return { ok: true, data: result.toolCall.arguments as T };
  }

  const content = result.content || "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return { ok: true, data: JSON.parse(arrayMatch[0]) as T };
      } catch {
        return { ok: false, error: "Failed to parse JSON array from LLM response" };
      }
    }
    return { ok: false, error: "No JSON found in LLM response" };
  }

  try {
    return { ok: true, data: JSON.parse(jsonMatch[0]) as T };
  } catch {
    return { ok: false, error: "Failed to parse JSON from LLM response" };
  }
}
