import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const { sessionId, message } = body

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: "sessionId and message are required" },
        { status: 400 }
      )
    }

    // Save user message
    const { error: insertError } = await supabase.from("chat_messages").insert({
      session_id: sessionId,
      sender: "user",
      message,
    })

    if (insertError) {
      console.error("Failed to save user message:", insertError)
      throw new Error("Failed to save message")
    }

    // Forward to N8N webhook
    const n8nWebhookUrl = process.env.N8N_CHAT_WEBHOOK_URL

    if (!n8nWebhookUrl) {
      console.error("N8N_CHAT_WEBHOOK_URL not configured")
      // Save fallback assistant response
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        sender: "assistant",
        message: "El servicio de chat no está disponible en este momento. Por favor, contáctanos por email.",
      })
      return NextResponse.json({
        success: true,
        reply: "El servicio de chat no está disponible en este momento. Por favor, contáctanos por email.",
      })
    }

    // Create fetch with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          message,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!n8nResponse.ok) {
        throw new Error(`N8N webhook failed: ${n8nResponse.statusText}`)
      }

      const assistantMessage = await n8nResponse.json()
      const reply = assistantMessage.reply || assistantMessage.message || assistantMessage.response || "Lo siento, no pude procesar tu mensaje."

      // Save assistant response
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        sender: "assistant",
        message: reply,
      })

      return NextResponse.json({
        success: true,
        reply,
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)

      if (fetchError.name === "AbortError") {
        console.error("N8N webhook timeout")
        const timeoutReply = "La solicitud tardó demasiado. Por favor, intenta de nuevo."
        await supabase.from("chat_messages").insert({
          session_id: sessionId,
          sender: "assistant",
          message: timeoutReply,
        })
        return NextResponse.json({
          success: true,
          reply: timeoutReply,
        })
      }
      throw fetchError
    }
  } catch (error: any) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// Get chat history
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      )
    }

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error("Get chat history error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
