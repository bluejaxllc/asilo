"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage, getMessages } from "@/actions/family-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    MessageCircle,
    Send,
    Loader2,
    User,
    Heart,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    content: string;
    isFromFamily: boolean;
    fromUser: { name: string | null; role: string };
    createdAt: Date | string;
}

interface PatientMessagesProps {
    patientId: string;
    initialMessages: Message[];
}

export const PatientMessages = ({ patientId, initialMessages }: PatientMessagesProps) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        setSending(true);
        try {
            await sendMessage(patientId, newMessage);
            const updated = await getMessages(patientId);
            setMessages(updated as Message[]);
            setNewMessage("");
            toast.success("Mensaje enviado");
        } catch {
            toast.error("Error al enviar mensaje");
        }
        setSending(false);
    };

    const getRoleName = (role: string) => {
        switch (role) {
            case "ADMIN": return "Admin";
            case "DOCTOR": return "Doctor";
            case "NURSE": return "Enfermero/a";
            case "STAFF": return "Cuidador/a";
            case "FAMILY": return "Familiar";
            default: return role;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-secondary-foreground flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-indigo-500" />
                    Mensajes con Familiares
                </h3>
                <Badge variant="outline" className="text-[10px]">
                    {messages.length} mensaje{messages.length !== 1 ? "s" : ""}
                </Badge>
            </div>

            {/* Messages thread */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                {messages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Sin mensajes aún</p>
                        <p className="text-xs mt-1">Los familiares pueden enviar mensajes desde su portal.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn("flex", msg.isFromFamily ? "justify-start" : "justify-end")}
                        >
                            <div className={cn(
                                "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
                                msg.isFromFamily
                                    ? "bg-muted/60 text-foreground rounded-bl-md"
                                    : "bg-blue-600 text-white rounded-br-md"
                            )}>
                                <p className={cn(
                                    "text-xs font-medium mb-0.5 flex items-center gap-1",
                                    msg.isFromFamily ? "text-muted-foreground" : "text-blue-100"
                                )}>
                                    {msg.isFromFamily ? (
                                        <><Heart className="h-3 w-3" /> {msg.fromUser?.name || "Familiar"}</>
                                    ) : (
                                        <><User className="h-3 w-3" /> {msg.fromUser?.name || "Personal"} ({getRoleName(msg.fromUser?.role)})</>
                                    )}
                                </p>
                                <p className="text-sm">{msg.content}</p>
                                <p className={cn(
                                    "text-[10px] mt-1",
                                    msg.isFromFamily ? "text-muted-foreground" : "text-blue-200"
                                )}>
                                    {new Date(msg.createdAt).toLocaleString("es-MX", {
                                        day: "numeric", month: "short",
                                        hour: "2-digit", minute: "2-digit"
                                    })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            <div className="flex gap-2 pt-3 border-t">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Responder al familiar..."
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    disabled={sending}
                    className="flex-1"
                />
                <Button
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                >
                    {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    );
};
