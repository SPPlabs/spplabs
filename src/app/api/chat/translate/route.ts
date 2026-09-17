import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { generateChatCompletion } from "@/core/services/ai/llm";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spp_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized", message: "Missing session" }, { status: 401 });
    }

    const session = await verifyJWT(token);
    if (!session || !session.domain) {
      return NextResponse.json({ error: "Unauthorized", message: "Invalid session" }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { text, targetLang = "es" } = body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "BadRequest", message: "text is required" }, { status: 400 });
    }

    const isSpanish = targetLang.toLowerCase() !== "en";
    const systemPrompt = isSpanish
      ? "Eres un traductor técnico y fluido de inteligencia artificial. Traduce el siguiente proceso de pensamiento y razonamiento lógico interno de una IA al español. Conserva la precisión, la terminología técnica y el formato markdown o viñetas si existen. Devuelve ÚNICAMENTE la traducción en español, sin saludos, notas explicativas ni comentarios."
      : "You are a professional technical AI translator. Translate the following internal reasoning thoughts into English. Return ONLY the translation, without notes or conversational commentary.";

    const response = await generateChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text.slice(0, 8000) },
      ],
      stream: false,
      temperature: 0.1,
      max_tokens: 1500,
      enableThinking: false,
    });

    const completion = response as any;
    const translatedText = completion.choices?.[0]?.message?.content?.trim() || "";

    if (!translatedText) {
      return NextResponse.json(
        { error: "TranslationFailed", message: "No se pudo generar la traducción." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      translatedText,
    });
  } catch (error: any) {
    console.error("Chat thought translation error:", error);
    return NextResponse.json(
      { error: "InternalError", message: error?.message || "Error al traducir el razonamiento." },
      { status: 500 }
    );
  }
}
