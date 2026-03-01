import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subject, sender, body } = await req.json();

    if (!subject || !sender || !body) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("API key not configured");

    const prompt = `You are an expert email security analyst. Analyze this email for threats including phishing, malware, social engineering, tampering, and other malicious indicators.

Email Details:
- Subject: ${subject}
- Sender: ${sender}
- Body: ${body}

Respond ONLY with valid JSON in this exact format:
{
  "threat_level": "safe" | "suspicious" | "phishing" | "malicious" | "tampering",
  "confidence_score": <number 0-100>,
  "analysis_summary": "<2-3 sentence summary>",
  "indicators": ["<indicator 1>", "<indicator 2>", ...]
}

Analyze carefully for:
1. Suspicious sender domain (mismatched, free email for official comms)
2. Urgency/pressure tactics
3. Suspicious links or attachments mentioned
4. Grammar/spelling anomalies
5. Requests for sensitive info (passwords, SSN, bank details)
6. Header manipulation signs
7. Social engineering patterns
8. Impersonation attempts`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    if (!response.ok) throw new Error(`AI API error: ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");

    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
