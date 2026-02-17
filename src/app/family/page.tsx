"use client";

import { useEffect, useState, useRef } from "react";
import { getFamilyPatient, getPatientActivity } from "@/actions/family";
import { getMessages, sendMessage, getPatientMedications } from "@/actions/family-messages";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Heart,
    Activity,
    Utensils,
    Pill,
    Clock,
    Moon,
    Sun,
    Calendar,
    AlertCircle,
    Phone,
    MessageCircle,
    Send,
    Loader2,
    User,
    BedDouble,
    FileText,
} from "lucide-react";
import { FadeIn, SlideIn, SlideInRow } from "@/components/ui/motion-wrapper";
import { toast } from "sonner";

type TabKey = "overview" | "activity" | "medications" | "messages";

const TABS: { key: TabKey; label: string; icon: any }[] = [
    { key: "overview", label: "Resumen", icon: Heart },
    { key: "activity", label: "Actividad", icon: Activity },
    { key: "medications", label: "Medicamentos", icon: Pill },
    { key: "messages", label: "Mensajes", icon: MessageCircle },
];

export default function FamilyPage() {
    const [patient, setPatient] = useState<any>(null);
    const [activity, setActivity] = useState<any[]>([]);
    const [medications, setMedications] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>("overview");
    const [newMessage, setNewMessage] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const result = await getFamilyPatient();
            if ("error" in result) {
                setError(result.error as string);
                setLoading(false);
                return;
            }
            const p = result.success;
            setPatient(p);
            const [activityData, medsData, msgsData] = await Promise.all([
                getPatientActivity(p.id),
                getPatientMedications(p.id),
                getMessages(p.id),
            ]);
            setActivity(activityData);
            setMedications(medsData);
            setMessages(msgsData);
            setLoading(false);
        };
        load();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !patient) return;
        setSendingMessage(true);
        try {
            await sendMessage(patient.id, newMessage);
            const updated = await getMessages(patient.id);
            setMessages(updated);
            setNewMessage("");
            toast.success("Mensaje enviado");
        } catch {
            toast.error("Error al enviar mensaje");
        }
        setSendingMessage(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Estable": return "bg-green-100 text-green-700 border-green-200";
            case "Delicado": return "bg-amber-100 text-amber-700 border-amber-200";
            case "Hospitalizado": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const getLogIcon = (type: string) => {
        switch (type) {
            case "VITALS": return <Activity className="h-4 w-4 text-blue-500" />;
            case "FOOD": return <Utensils className="h-4 w-4 text-orange-500" />;
            case "MEDS": return <Pill className="h-4 w-4 text-green-500" />;
            default: return <FileText className="h-4 w-4 text-purple-500" />;
        }
    };

    const getLogTypeName = (type: string) => {
        switch (type) {
            case "VITALS": return "Vitales";
            case "FOOD": return "Alimentación";
            case "MEDS": return "Medicamento";
            case "ACTIVITY": return "Actividad";
            default: return type;
        }
    };

    const getTimeOfDayIcon = () => {
        const hour = new Date().getHours();
        return hour >= 6 && hour < 18
            ? <Sun className="h-5 w-5 text-amber-500" />
            : <Moon className="h-5 w-5 text-indigo-400" />;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="text-sm text-muted-foreground">Cargando información...</span>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <AlertCircle className="h-12 w-12 text-red-400" />
                <p className="text-lg font-semibold text-slate-700">{error || "Sin paciente asignado"}</p>
                <p className="text-sm text-muted-foreground">Contacte al administrador para vincular su cuenta.</p>
            </div>
        );
    }

    // Extract emergency contact from medicalHistory
    const emergencyMatch = patient.medicalHistory?.match(/CONTACTO:\s*(.+)\s*\((\d+)\)/);
    const emergencyName = emergencyMatch?.[1]?.trim() || "No registrado";
    const emergencyPhone = emergencyMatch?.[2] || "";

    return (
        <FadeIn className="space-y-6">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-2xl font-bold shadow-inner">
                            {patient.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{patient.name}</h1>
                            <div className="flex items-center gap-3 mt-1.5 text-blue-100 text-sm">
                                <span className="flex items-center gap-1">
                                    <BedDouble className="h-3.5 w-3.5" /> Hab. {patient.room || "—"}
                                </span>
                                {patient.age && (
                                    <span className="flex items-center gap-1">
                                        <User className="h-3.5 w-3.5" /> {patient.age} años
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className={`text-sm px-3 py-1 ${getStatusColor(patient.status)} border`}>
                            {patient.status}
                        </Badge>
                        {getTimeOfDayIcon()}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? "bg-white shadow-sm text-slate-800"
                                    : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            {tab.key === "messages" && messages.length > 0 && (
                                <span className="ml-1 h-5 w-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {messages.length}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
                <FadeIn className="grid gap-4 md:grid-cols-2">
                    {/* Status Card */}
                    <SlideIn delay={0.1}>
                        <Card className="shadow-sm h-full">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Heart className="h-4 w-4 text-red-500" />
                                    Estado Actual
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-600">Estado</span>
                                    <Badge className={`${getStatusColor(patient.status)} border`}>{patient.status}</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-600">Dieta</span>
                                    <span className="text-sm font-semibold text-slate-800">{patient.dietaryNeeds || "Normal"}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-600">Medicamentos</span>
                                    <span className="text-sm font-semibold text-blue-600">{medications.length} activos</span>
                                </div>
                            </CardContent>
                        </Card>
                    </SlideIn>

                    {/* Contact Card */}
                    <SlideIn delay={0.2}>
                        <Card className="shadow-sm h-full">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Phone className="h-4 w-4 text-green-500" />
                                    Contacto de Emergencia
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border">
                                    <p className="font-semibold text-slate-800">{emergencyName}</p>
                                    {emergencyPhone && (
                                        <p className="text-sm text-blue-600 mt-1 font-mono">{emergencyPhone}</p>
                                    )}
                                </div>
                                {patient.medicalHistory && (
                                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                        <p className="text-xs text-amber-700 font-medium mb-1">Historial Médico</p>
                                        <p className="text-sm text-amber-900 line-clamp-3">
                                            {patient.medicalHistory.replace(/CONTACTO:.*$/, "").trim() || "Sin datos"}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </SlideIn>

                    {/* Recent Activity Preview */}
                    <SlideIn delay={0.3} className="md:col-span-2">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    Actividad Reciente
                                </CardTitle>
                                <CardDescription>Últimos 5 registros</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {activity.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">Sin actividad registrada</p>
                                ) : (
                                    <div className="space-y-2">
                                        {activity.slice(0, 5).map((log) => (
                                            <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                <div className="h-8 w-8 rounded-lg bg-white border flex items-center justify-center">
                                                    {getLogIcon(log.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-slate-500">{getLogTypeName(log.type)}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-800 truncate">{log.value || log.notes || "—"}</p>
                                                </div>
                                                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                                    {new Date(log.createdAt).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </SlideIn>
                </FadeIn>
            )}

            {activeTab === "activity" && (
                <FadeIn>
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Activity className="h-5 w-5 text-blue-500" />
                                Historial de Actividad
                            </CardTitle>
                            <CardDescription>{activity.length} registros</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activity.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">Sin actividad registrada aún</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {activity.map((log, i) => (
                                        <SlideIn key={log.id} delay={Math.min(i * 0.04, 0.8)}>
                                            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                                                <div className="h-10 w-10 rounded-xl bg-white border flex items-center justify-center flex-shrink-0 shadow-sm">
                                                    {getLogIcon(log.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-semibold">{getLogTypeName(log.type)}</Badge>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            por {log.author?.name || "Personal"}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-800">{log.value || "—"}</p>
                                                    {log.notes && <p className="text-xs text-muted-foreground mt-0.5">{log.notes}</p>}
                                                </div>
                                                <span className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                                                    {new Date(log.createdAt).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </div>
                                        </SlideIn>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </FadeIn>
            )}

            {activeTab === "medications" && (
                <FadeIn>
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Pill className="h-5 w-5 text-green-500" />
                                Medicamentos Actuales
                            </CardTitle>
                            <CardDescription>{medications.length} medicamentos asignados</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {medications.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Pill className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">Sin medicamentos asignados</p>
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {medications.map((med, i) => (
                                        <SlideIn key={med.id} delay={Math.min(i * 0.1, 0.5)}>
                                            <div className="p-4 rounded-xl border-2 border-green-100 bg-green-50/30 hover:border-green-200 transition-all">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                                                            <Pill className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <h4 className="font-semibold text-slate-800">{med.medication.name}</h4>
                                                    </div>
                                                    <Badge variant="outline" className="text-[10px] bg-white">{med.medication.unit}</Badge>
                                                </div>
                                                <div className="space-y-1.5 ml-10">
                                                    <p className="text-sm text-slate-600">
                                                        <span className="font-medium">Dosis:</span> {med.dosage}
                                                    </p>
                                                    {med.schedule && (
                                                        <p className="text-sm text-slate-600">
                                                            <span className="font-medium">Horario:</span> {med.schedule}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </SlideIn>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </FadeIn>
            )}

            {activeTab === "messages" && (
                <FadeIn>
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MessageCircle className="h-5 w-5 text-indigo-500" />
                                Mensajes
                            </CardTitle>
                            <CardDescription>Comuníquese con el personal de cuidado</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Messages thread */}
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 mb-4">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">Sin mensajes aún</p>
                                        <p className="text-xs mt-1">Envíe un mensaje al personal de cuidado.</p>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.isFromFamily ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.isFromFamily
                                                    ? "bg-blue-600 text-white rounded-br-md"
                                                    : "bg-slate-100 text-slate-800 rounded-bl-md"
                                                }`}>
                                                <p className={`text-xs font-medium mb-0.5 ${msg.isFromFamily ? "text-blue-100" : "text-slate-500"}`}>
                                                    {msg.isFromFamily ? "Tú" : msg.fromUser?.name || "Personal"}
                                                </p>
                                                <p className="text-sm">{msg.content}</p>
                                                <p className={`text-[10px] mt-1 ${msg.isFromFamily ? "text-blue-200" : "text-slate-400"}`}>
                                                    {new Date(msg.createdAt).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message input */}
                            <div className="flex gap-2 pt-3 border-t">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Escriba un mensaje..."
                                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                                    disabled={sendingMessage}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={sendingMessage || !newMessage.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                                >
                                    {sendingMessage ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </FadeIn>
            )}
        </FadeIn>
    );
}
