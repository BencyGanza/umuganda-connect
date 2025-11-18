import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, photoUrl } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const messages = [
      {
        role: "system",
        content: `You are an AI assistant analyzing community infrastructure problems in Rwanda. 
Analyze the problem and return JSON with: 
- problem_type (roads/trash/water/electricity/school/health/other)
- severity (low/medium/high/critical)
- estimated_cost (USD)
- estimated_labor_hours (integer)
- suggestions (string with actionable advice)`
      },
      {
        role: "user",
        content: photoUrl 
          ? [
              { type: "text", text: `Problem description: ${description}` },
              { type: "image_url", image_url: { url: photoUrl } }
            ]
          : `Problem description: ${description}`
      }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_problem",
              description: "Analyze community infrastructure problem",
              parameters: {
                type: "object",
                properties: {
                  problem_type: {
                    type: "string",
                    enum: ["roads", "trash", "water", "electricity", "school", "health", "other"]
                  },
                  severity: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"]
                  },
                  estimated_cost: {
                    type: "number",
                    description: "Estimated cost in USD"
                  },
                  estimated_labor_hours: {
                    type: "integer",
                    description: "Estimated labor hours needed"
                  },
                  suggestions: {
                    type: "string",
                    description: "Actionable suggestions for fixing the problem"
                  }
                },
                required: ["problem_type", "severity", "estimated_cost", "estimated_labor_hours", "suggestions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_problem" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No analysis result from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error analyzing problem:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze problem";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
