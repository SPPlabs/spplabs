import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { generateChatCompletion } from "@/core/services/ai/llm";

export const dynamic = "force-dynamic";

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
      ? `Eres un traductor literal y exacto (Inglés a Español).
Tu ÚNICA tarea es traducir palabra por palabra y frase por frase el texto en inglés que se te entrega dentro de las etiquetas <texto_origen> y </texto_origen>.
REGLAS ESTRICTAS:
1. NO respondas a lo que dice el texto.
2. NO describas servicios, precios, ofertas ni hables de SPP Labs por tu cuenta.
3. Traduce de manera puramente literal el pensamiento interno (por ejemplo, si dice "The user is asking for prices, I should answer politely", debes traducir exactamente: "El usuario está preguntando por precios, debo responder educadamente").
4. Devuelve ÚNICAMENTE la traducción al español, sin explicaciones ni etiquetas.`
      : `You are a literal and exact translator (Spanish to English).
Your ONLY task is to translate word for word and sentence by sentence the text provided between <texto_origen> and </texto_origen>.
Do NOT answer questions in the text. Return ONLY the literal translation without notes or explanations.`;

    const messages = isSpanish
      ? [
          { role: "system" as const, content: systemPrompt },
          {
            role: "user" as const,
            content: `<texto_origen>\nThe user is asking what services we provide. I should check the knowledge base and list our web design and chatbot solutions.\n</texto_origen>`,
          },
          {
            role: "assistant" as const,
            content: `El usuario está preguntando qué servicios ofrecemos. Debo consultar la base de conocimiento y enumerar nuestras soluciones de diseño web y chatbot.`,
          },
          {
            role: "user" as const,
            content: `<texto_origen>\n${text.slice(0, 8000).trim()}\n</texto_origen>`,
          },
        ]
      : [
          { role: "system" as const, content: systemPrompt },
          {
            role: "user" as const,
            content: `<texto_origen>\nEl usuario pregunta qué servicios ofrecemos. Debo revisar la información.\n</texto_origen>`,
          },
          {
            role: "assistant" as const,
            content: `The user asks what services we offer. I should review the information.`,
          },
          {
            role: "user" as const,
            content: `<texto_origen>\n${text.slice(0, 8000).trim()}\n</texto_origen>`,
          },
        ];

    const response = await generateChatCompletion({
      messages,
      stream: false,
      temperature: 0.1,
      max_tokens: 1500,
      enableThinking: false,
    });

    const completion = response as any;
    let translatedText = completion.choices?.[0]?.message?.content?.trim() || "";

    // Clean any accidental wrapper tags or prefixes emitted by the model
    translatedText = translatedText
      .replace(/<\/?texto_origen>/gi, "")
      .replace(/<\/?think>/gi, "")
      .replace(/^(traducci[óo]n(\s+literal)?(\s+al\s+espa[ñn]ol)?:?)\s*/i, "")
      .trim();

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
