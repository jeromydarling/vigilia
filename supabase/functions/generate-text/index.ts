/**
 * generate-text — LLM proxy for client-side narrative synthesis.
 *
 * WHAT: Accepts a text prompt, calls the Lovable AI gateway (Gemini Flash),
 *       and returns the generated text.
 * WHERE: Called by the client-side synthesizeReflection and synthesizeWeeklyChapter services.
 * WHY: The narrative synthesis pipeline needs an LLM to compose family reflections
 *      from raw visit ritual data. This edge function provides the bridge.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callLlm } from "../_shared/llmGateway.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, max_tokens } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'prompt' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const result = await callLlm(
      [{ role: "user", content: prompt }],
      {
        model: "google/gemini-2.5-flash",
        temperature: 0.7,
        timeoutMs: 20_000,
      },
    );

    if (!result.ok) {
      return new Response(
        JSON.stringify({ error: result.error ?? "LLM call failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ text: result.content ?? "" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[generate-text] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
