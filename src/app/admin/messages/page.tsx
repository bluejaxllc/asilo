"use client";

import { useState, useEffect, useRef } from "react";
import { getAllConversations, getUnansweredCount } from "@/actions/admin-messages";
import { getMessages, sendMessage } from "@/actions/family-messages";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FadeIn, SlideIn } from "@/components/ui/motion-wrapper";
import { cn } from "@/lib/utils";
import {
    MessageCircle,
    Send,
    Loader2,
    ArrowLeft,
    User,
    Heart,
    Inbox,
    Clock,
    AlertCircle,
    BedDouble,
} from "lucide-react";
import { toast } from "sonner";

interface Conversation {
    patientId: string;
    patientName: string;
    room: string | null;
    totalMessages: number;
    lastMessage: {
        content: string;
        isFromFamily: boolean;
        fromName: string | null;
        createdAt: Date | string;
    } | null;
}

interface Message {
    id: string;
    content: string;
    isFromFamily: boolean;
    fromUser: { name: string | null; role: string };
    createdAt: Date | string;
}

export default function AdminMessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [unanswered, setUnanswered] = useState(0);
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
    const [selectedName, setSelectedName] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadData = async () => {
        setLoading(true);
        const [convos, count] = await Promise.all([
            getAllConversations(),
            getUnansweredCount()
        ]);
        setConversations(convos);
        setUnanswered(count);
        setLoading(false);
    };

    const openThread = async (patientId: string, patientName: string) => {
        setSelectedPatient(patientId);
        setSelectedName(patientName);
        setLoadingMessages(true);
        const msgs = await getMessages(patientId);
        setMessages(msgs as Message[]);
        setLoadingMessages(false);
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedPatient) return;
        setSending(true);
        try {
            await sendMessage(selectedPatient, newMessage);
            const updated = await getMessages(selectedPatient);
            setMessages(updated as Message[]);
            setNewMessage("");
            toast.success("Mensaje enviado");
            // Refresh conversations list
            const convos = await getAllConversations();
            setConversations(convos);
        } catch {
            toast.error("Error al enviar mensaje");
        }
        setSending(false);
    };

    const goBack = () => {
        setSelectedPatient(null);
        setMessages([]);
        setNewMessage("");
    };

    const formatTime = (dateStr: Date | string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffHours = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) return "Hace poco";
        if (diffHours < 24) return `Hace ${diffHours}h`;
        return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <FadeIn>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-violet-800 to-purple-900 border border-border p-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/10">
                                    <MessageCircle className="h-6 w-6 text-indigo-300" />
                                </div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">Mensajes</h1>
                            </div>
                            <p className="text-indigo-200/60 text-sm max-w-lg">
                                Comunicación con los familiares de los residentes.
                            </p>
                        </div>

                        <div className="hidden sm:flex gap-4">
                            <div className="text-center p-4 rounded-xl bg-card/5 border border-border min-w-[100px]">
                                <p className="text-2xl font-bold text-white">{conversations.length}</p>
                                <p className="text-xs text-indigo-300/50 mt-1">Conversaciones</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-card/5 border border-border min-w-[100px]">
                                <p className={cn(
                                    "text-2xl font-bold",
                                    unanswered > 0 ? "text-amber-400" : "text-emerald-400"
                                )}>{unanswered}</p>
                                <p className="text-xs text-indigo-300/50 mt-1">Sin Responder</p>
                            </div>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* Content */}
            {!selectedPatient ? (
                /* Conversations List */
                <div className="space-y-3">
                    {conversations.length === 0 ? (
                        <FadeIn>
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <Inbox className="h-12 w-12 text-muted-foreground/30 mb-3" />
                                    <p className="text-muted-foreground text-sm">No hay conversaciones aún</p>
                                    <p className="text-muted-foreground/60 text-xs mt-1">
                                        Los familiares pueden iniciar conversaciones desde su portal.
                                    </p>
                                </CardContent>
                            </Card>
                        </FadeIn>
                    ) : (
                        conversations.map((convo, i) => {
                            const isUnanswered = convo.lastMessage?.isFromFamily;
                            return (
                                <SlideIn key={convo.patientId} delay={Math.min(i * 0.05, 0.3)}>
                                    <Card
                                        className={cn(
                                            "cursor-pointer transition-all hover:shadow-md hover:border-indigo-500/25",
                                            isUnanswered && "border-l-4 border-l-amber-400"
                                        )}
                                        onClick={() => openThread(convo.patientId, convo.patientName)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-lg font-bold text-indigo-400 flex-shrink-0">
                                                    {convo.patientName.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-foreground">{convo.patientName}</h3>
                                                        {convo.room && (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                                <BedDouble className="h-2.5 w-2.5 mr-1" /> {convo.room}
                                                            </Badge>
                                                        )}
                                                        {isUnanswered && (
                                                            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 text-[10px] px-1.5 py-0">
                                                                <AlertCircle className="h-2.5 w-2.5 mr-1" /> Pendiente
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {convo.lastMessage && (
                                                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                                                            {convo.lastMessage.isFromFamily ? (
                                                                <Heart className="h-3 w-3 inline mr-1 text-orange-400" />
                                                            ) : (
                                                                <User className="h-3 w-3 inline mr-1 text-blue-400" />
                                                            )}
                                                            {convo.lastMessage.content}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    {convo.lastMessage && (
                                                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatTime(convo.lastMessage.createdAt)}
                                                        </p>
                                                    )}
                                                    <Badge variant="secondary" className="text-[10px] mt-1">
                                                        {convo.totalMessages} msg
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </SlideIn>
                            );
                        })
                    )}
                </div>
            ) : (
                /* Thread View */
                <FadeIn>
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3 border-b">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={goBack}
                                    className="gap-1 -ml-2"
                                >
                                    <ArrowLeft className="h-4 w-4" /> Volver
                                </Button>
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center font-bold text-indigo-400">
                                    {selectedName.charAt(0)}
                                </div>
                                <div>
                                    <CardTitle className="text-base">{selectedName}</CardTitle>
                                    <CardDescription className="text-xs">{messages.length} mensajes</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 mb-4">
                                        {messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={cn("flex", msg.isFromFamily ? "justify-start" : "justify-end")}
                                            >
                                                <div className={cn(
                                                    "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
                                                    msg.isFromFamily
                                                        ? "bg-card text-foreground rounded-bl-md"
                                                        : "bg-blue-600 text-white rounded-br-md"
                                                )}>
                                                    <p className={cn(
                                                        "text-xs font-medium mb-0.5 flex items-center gap-1",
                                                        msg.isFromFamily ? "text-muted-foreground" : "text-blue-100"
                                                    )}>
                                                        {msg.isFromFamily ? (
                                                            <><Heart className="h-3 w-3" /> {msg.fromUser?.name || "Familiar"}</>
                                                        ) : (
                                                            <><User className="h-3 w-3" /> {msg.fromUser?.name || "Personal"}</>
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
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

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
                                </>
                            )}
                        </CardContent>
                    </Card>
                </FadeIn>
            )}
        </div>
    );
}
