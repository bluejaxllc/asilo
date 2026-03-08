"use client";

import { useEffect, useState, useRef } from "react";
import { getFamilyPatient, getPatientActivity, getPremiumServices, recordPremiumPurchase, getPurchaseHistory } from "@/actions/family";
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
    Store,
    Star,
    ExternalLink,
    Sparkles,
    ShoppingBag,
    Gift,
    Stethoscope,
    HandHeart,
    ChefHat,
    Package,
    CheckCircle2,
    Clock4,
    ArrowRight,
    Repeat,
    CalendarDays
} from "lucide-react";
import { FadeIn, SlideIn, SlideInRow } from "@/components/ui/motion-wrapper";
import { toast } from "sonner";

type TabKey = "overview" | "activity" | "medications" | "messages" | "services";

const TABS: { key: TabKey; label: string; icon: any }[] = [
    { key: "overview", label: "Resumen", icon: Heart },
    { key: "activity", label: "Actividad", icon: Activity },
    { key: "medications", label: "Medicamentos", icon: Pill },
    { key: "messages", label: "Mensajes", icon: MessageCircle },
    { key: "services", label: "Servicios", icon: Store },
];

export default function FamilyPage() {
    const [patient, setPatient] = useState<any>(null);
    const [activity, setActivity] = useState<any[]>([]);
    const [medications, setMedications] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [purchases, setPurchases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>("overview");
    const [activeCategory, setActiveCategory] = useState("TODOS");
    const [selectedFrequencies, setSelectedFrequencies] = useState<Record<string, string>>({});
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
            const [activityData, medsData, msgsData, svcsData, purchData] = await Promise.all([
                getPatientActivity(p.id),
                getPatientMedications(p.id),
                getMessages(p.id),
                getPremiumServices(),
                getPurchaseHistory(),
            ]);
            setActivity(activityData);
            setMedications(medsData);
            setMessages(msgsData);
            setServices(svcsData);
            setPurchases(purchData);
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

    const handlePurchase = async (service: any) => {
        const freq = selectedFrequencies[service.id] || "ONCE";
        const freqLabel = freq === "ONCE" ? "" : ` (${freq === "DAILY" ? "Diario" : freq === "WEEKLY" ? "Semanal" : "Quincenal"})`;
        if (!service.paymentUrl) {
            toast.error("Este servicio no tiene configurado un enlace de pago.");
            return;
        }
        toast.loading(`Redirigiendo al pago seguro${freqLabel}...`);
        await recordPremiumPurchase(service.id, `Compra${freqLabel} desde Portal de Familiares`, freq);
        window.open(service.paymentUrl, '_blank');
        toast.dismiss();
    };

    const getFrequencyPrice = (service: any, freq: string) => {
        switch (freq) {
            case "DAILY": return service.priceDaily;
            case "WEEKLY": return service.priceWeekly;
            case "BIWEEKLY": return service.priceBiweekly;
            default: return service.price;
        }
    };

    const hasAnyFrequency = (service: any) => {
        return service.priceDaily || service.priceWeekly || service.priceBiweekly;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Estable": return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
            case "Delicado": return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20";
            case "Hospitalizado": return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20";
            default: return "bg-zinc-500/15 text-muted-foreground border-border";
        }
    };

    const getLogIcon = (type: string) => {
        switch (type) {
            case "VITALS": return <Activity className="h-4 w-4 text-blue-600 dark:text-blue-500" />;
            case "FOOD": return <Utensils className="h-4 w-4 text-orange-600 dark:text-orange-500" />;
            case "MEDS": return <Pill className="h-4 w-4 text-green-600 dark:text-green-500" />;
            case "PREMIUM": return <ShoppingBag className="h-4 w-4 text-pink-600 dark:text-pink-500" />;
            default: return <FileText className="h-4 w-4 text-purple-600 dark:text-purple-500" />;
        }
    };

    const getLogTypeName = (type: string) => {
        switch (type) {
            case "VITALS": return "Vitales";
            case "FOOD": return "Alimentación";
            case "MEDS": return "Medicamento";
            case "ACTIVITY": return "Actividad";
            case "PREMIUM": return "Servicio Premium";
            default: return type;
        }
    };

    // Build unified timeline merging activity logs + premium purchases
    const unifiedTimeline = [
        ...activity.map((log: any) => ({
            id: log.id,
            type: log.type,
            value: log.value || log.notes || "—",
            notes: log.notes,
            author: log.author?.name || "Personal",
            createdAt: new Date(log.createdAt),
            source: "log" as const,
        })),
        ...purchases.map((p: any) => {
            const freqLabel = p.frequency && p.frequency !== "ONCE"
                ? ` (${p.frequency === "DAILY" ? "Diario" : p.frequency === "WEEKLY" ? "Semanal" : "Quincenal"})`
                : "";
            return {
                id: `purchase-${p.id}`,
                type: "PREMIUM",
                value: `${p.service?.name || "Servicio"}${freqLabel}`,
                notes: `$${p.service?.price?.toLocaleString("es-MX")} MXN • ${p.status === "FULFILLED" ? "Entregado" : p.status === "PAID" ? "Pagado" : "Pendiente"}`,
                author: "Familiar",
                createdAt: new Date(p.createdAt),
                source: "purchase" as const,
                frequency: p.frequency,
            };
        }),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const getTimeOfDayIcon = () => {
        const hour = new Date().getHours();
        return hour >= 6 && hour < 18
            ? <Sun className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            : <Moon className="h-5 w-5 text-indigo-400" />;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-500" />
                <span className="text-sm text-muted-foreground">Cargando información...</span>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                <p className="text-lg font-semibold text-secondary-foreground">{error || "Sin paciente asignado"}</p>
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
                        <div className="h-16 w-16 rounded-2xl bg-card/10 backdrop-blur-sm flex items-center justify-center text-2xl font-bold shadow-inner">
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
            <div className="flex gap-1 bg-card p-1 rounded-xl">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                ? "bg-card shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-secondary-foreground"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            {tab.key === "messages" && messages.length > 0 && (
                                <span className="ml-1 h-5 w-5 rounded-full bg-blue-500/100 text-white text-[10px] font-bold flex items-center justify-center">
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
                                    <Heart className="h-4 w-4 text-red-600 dark:text-red-500" />
                                    Estado Actual
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-card/[0.02] rounded-lg">
                                    <span className="text-sm text-muted-foreground">Estado</span>
                                    <Badge className={`${getStatusColor(patient.status)} border`}>{patient.status}</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-card/[0.02] rounded-lg">
                                    <span className="text-sm text-muted-foreground">Dieta</span>
                                    <span className="text-sm font-semibold text-foreground">{patient.dietaryNeeds || "Normal"}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-card/[0.02] rounded-lg">
                                    <span className="text-sm text-muted-foreground">Medicamentos</span>
                                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{medications.length} activos</span>
                                </div>
                            </CardContent>
                        </Card>
                    </SlideIn>

                    {/* Contact Card */}
                    <SlideIn delay={0.2}>
                        <Card className="shadow-sm h-full font-mono relative overflow-hidden">
                            {/* Review Banner */}
                            <div className="absolute top-0 right-0 p-4">
                                <a href="https://g.page/r/bluejax" target="_blank" rel="noopener noreferrer"
                                    className="flex flex-col items-center justify-center h-12 w-12 bg-card rounded-full shadow-lg border border-amber-500/20 hover:scale-110 transition-transform group cursor-pointer"
                                    title="Déjanos una reseña en Google"
                                >
                                    <Star className="h-5 w-5 text-amber-500 group-hover:fill-amber-500 transition-all" />
                                </a>
                            </div>

                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base font-sans">
                                    <Phone className="h-4 w-4 text-green-600 dark:text-green-500" />
                                    Contacto de Emergencia
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 font-sans">
                                <div className="p-4 bg-card/[0.03] rounded-xl border border-border">
                                    <p className="font-semibold text-foreground">{emergencyName}</p>
                                    {emergencyPhone && (
                                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-mono">{emergencyPhone}</p>
                                    )}
                                </div>
                                {patient.medicalHistory && (
                                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Historial Médico</p>
                                        <p className="text-sm text-amber-600 dark:text-amber-300/80 line-clamp-3">
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
                                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                                    Actividad Reciente
                                </CardTitle>
                                <CardDescription>Últimos 5 registros (incluye servicios premium)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {unifiedTimeline.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">Sin actividad registrada</p>
                                ) : (
                                    <div className="space-y-2">
                                        {unifiedTimeline.slice(0, 5).map((item) => (
                                            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg hover:bg-card transition-colors ${item.type === "PREMIUM" ? "bg-pink-500/5 border border-pink-500/10" : "bg-card/[0.02]"}`}>
                                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${item.type === "PREMIUM" ? "bg-pink-500/15" : "bg-card border"}`}>
                                                    {getLogIcon(item.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-muted-foreground">{getLogTypeName(item.type)}</span>
                                                    </div>
                                                    <p className="text-sm text-foreground truncate">{item.value}</p>
                                                    {item.type === "PREMIUM" && item.notes && (
                                                        <p className="text-[11px] text-pink-500/80 mt-0.5">{item.notes}</p>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                                    {item.createdAt.toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
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
                                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                                Historial de Actividad
                            </CardTitle>
                            <CardDescription>{unifiedTimeline.length} registros (incluye servicios premium)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {unifiedTimeline.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">Sin actividad registrada aún</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {unifiedTimeline.map((item, i) => (
                                        <SlideIn key={item.id} delay={Math.min(i * 0.04, 0.8)}>
                                            <div className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${item.type === "PREMIUM" ? "bg-pink-500/5 border-pink-500/15 hover:border-pink-500/30" : "bg-card/[0.02] border-border/60 hover:border-border"}`}>
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${item.type === "PREMIUM" ? "bg-pink-500/15 border border-pink-500/20" : "bg-card border"}`}>
                                                    {getLogIcon(item.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-semibold ${item.type === "PREMIUM" ? "border-pink-500/30 text-pink-600 dark:text-pink-400 bg-pink-500/10" : ""}`}>{getLogTypeName(item.type)}</Badge>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            por {item.author}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                                                    {item.notes && <p className={`text-xs mt-0.5 ${item.type === "PREMIUM" ? "text-pink-500/70" : "text-muted-foreground"}`}>{item.notes}</p>}
                                                </div>
                                                <span className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                                                    {item.createdAt.toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
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
                                <Pill className="h-5 w-5 text-green-600 dark:text-green-500" />
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
                                            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30 transition-all">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                                                            <Pill className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                        <h4 className="font-semibold text-foreground">{med.medication.name}</h4>
                                                    </div>
                                                    <Badge variant="outline" className="text-[10px] bg-card/50 text-secondary-foreground border-border">{med.medication.unit}</Badge>
                                                </div>
                                                <div className="space-y-1.5 ml-10">
                                                    <p className="text-sm text-muted-foreground">
                                                        <span className="font-medium">Dosis:</span> {med.dosage}
                                                    </p>
                                                    {med.schedule && (
                                                        <p className="text-sm text-muted-foreground">
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
                                                : "bg-card text-foreground rounded-bl-md"
                                                }`}>
                                                <p className={`text-xs font-medium mb-0.5 ${msg.isFromFamily ? "text-blue-100" : "text-muted-foreground"}`}>
                                                    {msg.isFromFamily ? "Tú" : msg.fromUser?.name || "Personal"}
                                                </p>
                                                <p className="text-sm">{msg.content}</p>
                                                <p className={`text-[10px] mt-1 ${msg.isFromFamily ? "text-blue-600 dark:text-blue-200" : "text-muted-foreground"}`}>
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

            {activeTab === "services" && (
                <FadeIn className="space-y-6">
                    {/* Store Hero Banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-700 p-6 md:p-8 shadow-xl shadow-purple-500/10">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-5 w-5 text-amber-300" />
                                <span className="text-xs font-bold uppercase tracking-widest text-pink-200">Tienda Premium</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white">
                                Servicios para {patient.name.split(" ")[0]}
                            </h2>
                            <p className="text-pink-100/80 mt-2 text-sm max-w-md">
                                Experiencias, comidas especiales, terapias y cuidados extra. Todo al alcance de un click.
                            </p>
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {["TODOS", "EXPERIENCIAS", "COMIDAS", "TERAPIAS", "CUIDADOS"].map((cat) => {
                            const isActive = activeCategory === cat;
                            const catIcons: Record<string, any> = {
                                TODOS: ShoppingBag,
                                EXPERIENCIAS: Gift,
                                COMIDAS: ChefHat,
                                TERAPIAS: Stethoscope,
                                CUIDADOS: HandHeart
                            };
                            const CatIcon = catIcons[cat];
                            const catLabels: Record<string, string> = {
                                TODOS: "Todos",
                                EXPERIENCIAS: "Experiencias",
                                COMIDAS: "Comidas",
                                TERAPIAS: "Terapias",
                                CUIDADOS: "Cuidados"
                            };
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${isActive
                                        ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20"
                                        : "bg-card text-muted-foreground hover:text-foreground border border-border hover:border-pink-500/30"
                                        }`}
                                >
                                    <CatIcon className="h-4 w-4" />
                                    {catLabels[cat]}
                                </button>
                            );
                        })}
                    </div>

                    {/* Services Grid */}
                    {(() => {
                        const filtered = activeCategory === "TODOS"
                            ? services
                            : services.filter((s: any) => s.category === activeCategory);

                        if (services.length === 0) {
                            return (
                                <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
                                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                                    <h3 className="text-lg font-medium text-foreground">Aún no hay servicios disponibles</h3>
                                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2">
                                        La residencia pronto agregará servicios extra que podrás adquirir aquí.
                                    </p>
                                </div>
                            );
                        }

                        if (filtered.length === 0) {
                            return (
                                <div className="text-center py-12 bg-card rounded-2xl border border-border">
                                    <Package className="h-10 w-10 mx-auto text-muted-foreground opacity-30 mb-3" />
                                    <p className="text-sm text-muted-foreground">No hay servicios en esta categoría.</p>
                                </div>
                            );
                        }

                        const categoryGradients: Record<string, string> = {
                            EXPERIENCIAS: "from-amber-500/10 to-orange-500/5 border-amber-500/20 hover:border-amber-500/40",
                            COMIDAS: "from-green-500/10 to-emerald-500/5 border-green-500/20 hover:border-green-500/40",
                            TERAPIAS: "from-blue-500/10 to-cyan-500/5 border-blue-500/20 hover:border-blue-500/40",
                            CUIDADOS: "from-pink-500/10 to-rose-500/5 border-pink-500/20 hover:border-pink-500/40",
                        };

                        const categoryIcons: Record<string, any> = {
                            EXPERIENCIAS: Gift,
                            COMIDAS: ChefHat,
                            TERAPIAS: Stethoscope,
                            CUIDADOS: HandHeart
                        };

                        const categoryColors: Record<string, string> = {
                            EXPERIENCIAS: "text-amber-500 bg-amber-500/15",
                            COMIDAS: "text-green-500 bg-green-500/15",
                            TERAPIAS: "text-blue-500 bg-blue-500/15",
                            CUIDADOS: "text-pink-500 bg-pink-500/15",
                        };

                        return (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {filtered.map((svc: any, i: number) => {
                                    const gradient = categoryGradients[svc.category] || categoryGradients.EXPERIENCIAS;
                                    const SvcIcon = categoryIcons[svc.category] || Gift;
                                    const iconColor = categoryColors[svc.category] || categoryColors.EXPERIENCIAS;

                                    const currentFreq = selectedFrequencies[svc.id] || "ONCE";
                                    const currentPrice = getFrequencyPrice(svc, currentFreq) || svc.price;
                                    const isRecurring = currentFreq !== "ONCE";
                                    const freqOptions = [
                                        { key: "ONCE", label: "Una vez", available: true },
                                        { key: "DAILY", label: "Diario", available: !!svc.priceDaily },
                                        { key: "WEEKLY", label: "Semanal", available: !!svc.priceWeekly },
                                        { key: "BIWEEKLY", label: "Quincenal", available: !!svc.priceBiweekly },
                                    ].filter(f => f.available);

                                    return (
                                        <SlideIn key={svc.id} delay={Math.min(i * 0.08, 0.4)}>
                                            <div className={`group relative rounded-2xl border bg-gradient-to-br ${gradient} p-5 transition-all hover:shadow-lg cursor-default h-full flex flex-col`}>
                                                {/* Icon + Category */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className={`h-11 w-11 rounded-xl ${iconColor} flex items-center justify-center`}>
                                                        <SvcIcon className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        {hasAnyFrequency(svc) && (
                                                            <Badge className="text-[10px] bg-purple-500/15 text-purple-400 border-purple-500/20 border gap-1">
                                                                <Repeat className="h-2.5 w-2.5" /> Suscripción
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider bg-card/50 border-border">
                                                            {svc.category?.toLowerCase() || "premium"}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Name + Description */}
                                                <h3 className="font-bold text-foreground text-lg mb-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                                                    {svc.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground flex-1 mb-3 line-clamp-2">
                                                    {svc.description || "Servicio premium para tu familiar."}
                                                </p>

                                                {/* Frequency Toggle */}
                                                {freqOptions.length > 1 && (
                                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                                        {freqOptions.map(f => {
                                                            const isSelected = currentFreq === f.key;
                                                            return (
                                                                <button
                                                                    key={f.key}
                                                                    onClick={() => setSelectedFrequencies(prev => ({ ...prev, [svc.id]: f.key }))}
                                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${isSelected
                                                                        ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm"
                                                                        : "bg-card/80 text-muted-foreground border border-border hover:border-pink-500/40 hover:text-foreground"
                                                                        }`}
                                                                >
                                                                    {f.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Price + CTA */}
                                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                                                    <div>
                                                        <span className="text-2xl font-bold text-foreground">${currentPrice?.toLocaleString("es-MX")}</span>
                                                        <span className="text-xs text-muted-foreground ml-1 font-mono">MXN</span>
                                                        {isRecurring && (
                                                            <span className="text-[10px] text-purple-400 ml-1.5 font-medium">/mes</span>
                                                        )}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-md shadow-pink-500/20 gap-1.5 font-semibold"
                                                        onClick={() => handlePurchase(svc)}
                                                    >
                                                        {isRecurring ? "Suscribirse" : "Comprar"} <ArrowRight className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </SlideIn>
                                    );
                                })}
                            </div>
                        );
                    })()}

                    {/* Purchase History */}
                    {purchases.length > 0 && (
                        <SlideIn delay={0.3}>
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <ShoppingBag className="h-4 w-4 text-purple-500" />
                                        Mis Compras
                                    </CardTitle>
                                    <CardDescription>{purchases.length} compra{purchases.length > 1 ? "s" : ""} realizadas</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {purchases.map((p: any) => {
                                            const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
                                                PENDING: { label: "Pendiente", color: "bg-amber-500/15 text-amber-600 border-amber-500/20", icon: Clock4 },
                                                PAID: { label: "Pagado", color: "bg-blue-500/15 text-blue-600 border-blue-500/20", icon: CheckCircle2 },
                                                FULFILLED: { label: "Entregado", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
                                            };
                                            const st = statusConfig[p.status] || statusConfig.PENDING;
                                            const StIcon = st.icon;
                                            return (
                                                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-card/[0.02] border border-border/60 hover:border-border transition-colors">
                                                    <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                                        <Store className="h-4 w-4 text-purple-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-foreground truncate">{p.service?.name || "Servicio"}</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(p.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                                                            </p>
                                                            {p.frequency && p.frequency !== "ONCE" && (
                                                                <Badge className="text-[9px] bg-purple-500/15 text-purple-400 border-purple-500/20 border gap-0.5 py-0">
                                                                    <Repeat className="h-2 w-2" />
                                                                    {p.frequency === "DAILY" ? "Diario" : p.frequency === "WEEKLY" ? "Semanal" : "Quincenal"}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-bold text-foreground">${p.service?.price?.toLocaleString("es-MX")}</span>
                                                    <Badge className={`${st.color} border text-[10px] gap-1`}>
                                                        <StIcon className="h-3 w-3" /> {st.label}
                                                    </Badge>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </SlideIn>
                    )}
                </FadeIn>
            )}
        </FadeIn>
    );
}
