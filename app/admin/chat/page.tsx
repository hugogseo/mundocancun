import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { MessageSquare, User, Bot } from "lucide-react"
import { formatDate } from "@/lib/utils"

async function getChatSessions() {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from("chat_sessions")
    .select(`
      *,
      user:profiles(full_name),
      messages:chat_messages(*)
    `)
    .order("created_at", { ascending: false })

  return (sessions || []).map((session) => ({
    ...session,
    messages: (session.messages || []).sort(
      (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
  }))
}

export default async function ChatPage() {
  const sessions = await getChatSessions()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Chat Sessions</h1>
        <p className="text-muted-foreground">
          Visualiza todas las conversaciones de chat con clientes
        </p>
      </div>

      <div className="grid gap-6">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">
                      Sesión #{session.id.slice(0, 8)}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      {session.user && (session.user as any).full_name
                        ? `Cliente: ${(session.user as any).full_name}`
                        : "Usuario Anónimo"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{session.channel || "web"}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(session.created_at)}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {session.messages && (session.messages as any[]).length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-slate-50 rounded-lg">
                  {(session.messages as any[]).map((message: any) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === "user" ? "justify-start" : "justify-end"
                      }`}
                    >
                      {message.sender === "user" && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      )}

                      <div
                        className={`flex-1 max-w-[80%] ${
                          message.sender === "assistant" ? "text-right" : ""
                        }`}
                      >
                        <div
                          className={`inline-block p-3 rounded-lg ${
                            message.sender === "user"
                              ? "bg-white border"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString("es-MX")}
                          </p>
                        </div>
                      </div>

                      {message.sender === "assistant" && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay mensajes en esta sesión
                </div>
              )}

              {session.metadata && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs font-medium mb-2">Metadata:</p>
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(session.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {sessions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay sesiones de chat aún
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
