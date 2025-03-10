"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import { Button } from "@/components/ui/button"
import { SendHorizontal, Loader2, Scale, Trash2, MoreVertical, User, Bot } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LoginPopup } from "@/components/login-popup"
import type { Message } from "@/types/chat"

// Custom markdown components with proper types
const MarkdownComponents: Partial<Components> = {
  h1: ({ ...props }) => <h1 className="text-2xl font-bold mb-4" {...props} />,
  h2: ({ ...props }) => <h2 className="text-xl font-bold mb-3" {...props} />,
  h3: ({ ...props }) => <h3 className="text-lg font-bold mb-2" {...props} />,
  ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
  ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
  li: ({ ...props }) => <li className="mb-1" {...props} />,
  p: ({ ...props }) => <p className="mb-4 last:mb-0" {...props} />,
  strong: ({ ...props }) => <strong className="font-bold" {...props} />,
  em: ({ ...props }) => <em className="italic" {...props} />,
  pre: ({ ...props }) => <pre className="bg-slate-100 dark:bg-slate-800 rounded p-4 mb-4 overflow-x-auto" {...props} />,
}

export default function LegalChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Check if user is already authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => setMessages([])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    setIsAuthenticated(false)
    clearChat()
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Login Popup */}
      {!isAuthenticated && <LoginPopup onAuthenticated={() => setIsAuthenticated(true)} />}

      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span className="text-lg font-semibold">LegalAI</span>
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <div className="text-sm text-slate-500 mr-2">{localStorage.getItem("userEmail")}</div>
              )}

              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-red-600 dark:text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Chat
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    {isAuthenticated && (
                      <DropdownMenuItem onClick={handleLogout}>
                        <User className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your entire chat history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearChat} className="bg-red-600 hover:bg-red-700 text-white">
                      Clear Chat
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border">
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
              <div className="p-4 space-y-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
                    <Scale className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-4" />
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      Welcome to LegalAI Assistant
                    </h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md">
                      Your AI-powered legal research companion. Ask any question about Indian law and get accurate,
                      up-to-date information.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 rounded-full items-center justify-center ${
                          message.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      >
                        {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                      </div>

                      <div className={`flex flex-col gap-1 ${message.role === "user" ? "items-end" : "items-start"}`}>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {message.role === "user" ? "You" : "Assistant"} •{message.timestamp.toLocaleTimeString()}
                        </div>
                        <div
                          className={`max-w-[600px] rounded-2xl px-4 py-2 ${
                            message.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800"
                          }`}
                        >
                          <ReactMarkdown components={MarkdownComponents}>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4 bg-white dark:bg-slate-900">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="flex-1">
                  <textarea
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      e.target.style.height = "auto"
                      e.target.style.height = `${e.target.scrollHeight}px`
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        if (input.trim()) {
                          handleSubmit(e)
                        }
                      }
                    }}
                    placeholder="Ask your legal question... (Shift + Enter for new line)"
                    className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-h-[200px] overflow-y-auto"
                    disabled={isLoading || !isAuthenticated}
                    rows={1}
                    style={{ height: "40px" }}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim() || !isAuthenticated}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4"
                >
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </form>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Press Shift + Enter for new line, Enter to send
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}