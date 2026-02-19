"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Bell,
    CheckCheck,
    Trash2,
    AlertTriangle,
    Info,
    AlertCircle,
    Filter,
    Loader2,
    BellOff,
    Plus,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FadeIn, SlideIn } from "@/components/ui/motion-wrapper";
import { SearchInput } from "@/components/ui/search-input";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    getUnreadCount,
} from "@/actions/notifications";
import { toast } from "sonner";

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; activeBg: string; dot: string }> = {
    INFO: { label: "Información", icon: Info, color: "text-blue-400", bg: "bg-blue-500/10", activeBg: "bg-blue-600 text-white", dot: "bg-blue-500/100" },
    WARNING: { label: "Advertencia", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", activeBg: "bg-amber-500/100 text-white", dot: "bg-amber-500/100" },
    CRITICAL: { label: "Crítico", icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", activeBg: "bg-red-600 text-white", dot: "bg-red-500/100" },
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [unreadCount, setUnreadCount] = useState(0);
    const [createOpen, setCreateOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [newType, setNewType] = useState("INFO");

    const fetchData = async () => {
        setLoading(true);
        const [data, count] = await Promise.all([
            getNotifications(activeFilter !== "ALL" ? activeFilter : undefined),
            getUnreadCount(),
        ]);
        setNotifications(data);
        setUnreadCount(count);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [activeFilter]);

    const handleMarkRead = async (id: string) => {
        await markAsRead(id);
        toast.success("Marcada como leída");
        fetchData();
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        toast.success("Todas marcadas como leídas");
        fetchData();
    };

    const handleDelete = async (id: string) => {
        await deleteNotification(id);
        toast.success("Notificación eliminada");
        fetchData();
    };

    const handleCreate = async () => {
        if (!newTitle.trim() || !newMessage.trim()) {
            toast.error("Complete todos los campos");
            return;
        }
        await createNotification(newTitle, newMessage, newType);
        toast.success("Notificación creada");
        setCreateOpen(false);
        setNewTitle("");
        setNewMessage("");
        setNewType("INFO");
        fetchData();
    };

    const typeCounts = notifications.reduce((acc: Record<string, number>, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
    }, {});

    return (
        <FadeIn className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Centro de Notificaciones</h2>
                    <p className="text-muted-foreground mt-1">
                        {unreadCount > 0 ? (
                            <span>{unreadCount} sin leer · {notifications.length} en total</span>
                        ) : (
                            <span>{notifications.length} notificaciones · Todas leídas</span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={handleMarkAllRead} className="gap-2">
                            <CheckCheck className="h-4 w-4" /> Marcar todas leídas
                        </Button>
                    )}
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                                <Plus className="h-4 w-4" /> Nueva
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Crear Notificación</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Título</label>
                                    <Input
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="Título de la notificación"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mensaje</label>
                                    <Textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Descripción detallada..."
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tipo</label>
                                    <Select value={newType} onValueChange={setNewType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INFO">ℹ️ Información</SelectItem>
                                            <SelectItem value="WARNING">⚠️ Advertencia</SelectItem>
                                            <SelectItem value="CRITICAL">🚨 Crítico</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                                    <Button onClick={handleCreate}>Crear Notificación</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card className="border-0 bg-gradient-to-br from-zinc-700 to-zinc-900 text-white shadow-lg shadow-zinc-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Total</p>
                                <p className="text-2xl font-bold mt-0.5">{notifications.length}</p>
                            </div>
                            <div className="h-9 w-9 bg-card/10 rounded-lg flex items-center justify-center">
                                <Bell className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-100 font-medium">Sin Leer</p>
                                <p className="text-2xl font-bold mt-0.5">{unreadCount}</p>
                            </div>
                            <div className="h-9 w-9 bg-card/10 rounded-lg flex items-center justify-center">
                                <BellOff className="h-4 w-4 text-blue-100" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-amber-100 font-medium">Advertencias</p>
                                <p className="text-2xl font-bold mt-0.5">{typeCounts["WARNING"] || 0}</p>
                            </div>
                            <div className="h-9 w-9 bg-card/10 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-amber-100" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-red-100 font-medium">Críticos</p>
                                <p className="text-2xl font-bold mt-0.5">{typeCounts["CRITICAL"] || 0}</p>
                            </div>
                            <div className="h-9 w-9 bg-card/10 rounded-lg flex items-center justify-center">
                                <AlertCircle className="h-4 w-4 text-red-100" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 flex-wrap">
                {[
                    { key: "ALL", label: "Todas", icon: Filter },
                    ...Object.entries(TYPE_CONFIG).map(([key, cfg]) => ({
                        key,
                        label: cfg.label,
                        icon: cfg.icon,
                    })),
                ].map((tab) => {
                    const isActive = activeFilter === tab.key;
                    const count = tab.key === "ALL" ? notifications.length : (typeCounts[tab.key] || 0);
                    const cfg = TYPE_CONFIG[tab.key];
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveFilter(tab.key)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isActive
                                ? (cfg?.activeBg || "bg-zinc-700 text-white") + " shadow-sm"
                                : (cfg?.bg || "bg-muted/60") + " " + (cfg?.color || "text-muted-foreground") + " hover:opacity-80"
                                }`}
                        >
                            <tab.icon className="h-3 w-3" />
                            {tab.label}
                            <span className={`ml-0.5 text-[10px] ${isActive ? "opacity-80" : "opacity-60"}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Notification List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <span className="text-sm text-muted-foreground">Cargando notificaciones...</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-16">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium text-muted-foreground">No hay notificaciones</p>
                        <p className="text-xs text-muted-foreground mt-1">Las alertas del sistema aparecerán aquí.</p>
                    </div>
                ) : (
                    notifications.map((n, index) => {
                        const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.INFO;
                        const Icon = cfg.icon;
                        return (
                            <SlideIn key={n.id} delay={Math.min(index * 0.04, 0.8)}>
                                <Card className={`border shadow-sm transition-all hover:shadow-md ${!n.read ? "bg-card border-l-4 border-l-blue-500" : "bg-card opacity-80"}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`h-10 w-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                <Icon className={`h-5 w-5 ${cfg.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className={`font-semibold text-sm ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                                                        {n.title}
                                                    </h4>
                                                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-0 ${cfg.bg} ${cfg.color}`}>
                                                        {cfg.label}
                                                    </Badge>
                                                    {!n.read && (
                                                        <span className="h-2 w-2 rounded-full bg-blue-500/100 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1.5">
                                                    {new Date(n.createdAt).toLocaleString("es-MX", {
                                                        day: "numeric",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {!n.read && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:text-emerald-400 hover:bg-emerald-500/10"
                                                        onClick={() => handleMarkRead(n.id)}
                                                        title="Marcar como leída"
                                                    >
                                                        <CheckCheck className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:text-red-400 hover:bg-red-500/10"
                                                    onClick={() => handleDelete(n.id)}
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </SlideIn>
                        );
                    })
                )}
            </div>
        </FadeIn>
    );
}
