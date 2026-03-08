"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Plus,
    Pencil,
    Trash2,
    Gift,
    Link as LinkIcon,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/motion-wrapper";
import {
    getAdminPremiumServices,
    createPremiumService,
    updatePremiumService,
    deletePremiumService,
    seedPremiumServices
} from "@/actions/premium-admin";

export default function PremiumExperiencesPage() {
    const [experiences, setExperiences] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("EXPERIENCIAS");
    const [price, setPrice] = useState("");
    const [priceDaily, setPriceDaily] = useState("");
    const [priceWeekly, setPriceWeekly] = useState("");
    const [priceBiweekly, setPriceBiweekly] = useState("");
    const [paymentUrl, setPaymentUrl] = useState("");
    const [icon, setIcon] = useState("Gift");
    const [isActive, setIsActive] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const data = await getAdminPremiumServices();
        if (data.length === 0) {
            // Auto-seed if empty
            await seedPremiumServices();
            const seeded = await getAdminPremiumServices();
            setExperiences(seeded);
        } else {
            setExperiences(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resetForm = () => {
        setName("");
        setDescription("");
        setCategory("EXPERIENCIAS");
        setPrice("");
        setPriceDaily("");
        setPriceWeekly("");
        setPriceBiweekly("");
        setPaymentUrl("");
        setIcon("Gift");
        setIsActive(true);
        setEditingId(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setDialogOpen(true);
    };

    const handleOpenEdit = (exp: any) => {
        setName(exp.name);
        setDescription(exp.description || "");
        setCategory(exp.category || "EXPERIENCIAS");
        setPrice(exp.price.toString());
        setPriceDaily(exp.priceDaily?.toString() || "");
        setPriceWeekly(exp.priceWeekly?.toString() || "");
        setPriceBiweekly(exp.priceBiweekly?.toString() || "");
        setPaymentUrl(exp.paymentUrl || "");
        setIcon(exp.icon || "Gift");
        setIsActive(exp.isActive);
        setEditingId(exp.id);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!name.trim() || !price) {
            toast.error("El nombre y el precio son obligatorios");
            return;
        }

        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice < 0) {
            toast.error("El precio debe ser un número válido");
            return;
        }

        const data: any = {
            name: name.trim(),
            description: description.trim() || undefined,
            category,
            price: numPrice,
            priceDaily: priceDaily ? parseFloat(priceDaily) : null,
            priceWeekly: priceWeekly ? parseFloat(priceWeekly) : null,
            priceBiweekly: priceBiweekly ? parseFloat(priceBiweekly) : null,
            paymentUrl: paymentUrl.trim() || undefined,
            icon,
            isActive
        };

        try {
            if (editingId) {
                await updatePremiumService(editingId, data);
                toast.success("Experiencia actualizada");
            } else {
                await createPremiumService(data);
                toast.success("Experiencia creada");
            }
            setDialogOpen(false);
            fetchData();
        } catch (err: any) {
            toast.error(err.message || "Error al guardar");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Está seguro de eliminar esta experiencia? Si tiene historial de compras, solo se desactivará.")) {
            try {
                const res = await deletePremiumService(id);
                toast.success(res.action === 'deactivated' ? "Experiencia desactivada (tiene historial)" : "Experiencia eliminada");
                fetchData();
            } catch (err: any) {
                toast.error(err.message || "Error al eliminar");
            }
        }
    };

    return (
        <FadeIn className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Gift className="h-8 w-8 text-blue-600 dark:text-blue-500" />
                        Experiencias & Cuidados
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Gestione los servicios premium e invitaciones a experiencias que se ofrecen a las familias en el portal.
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={handleOpenCreate}>
                            <Plus className="h-4 w-4" /> Agregar Experiencia
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Editar Experiencia" : "Nueva Experiencia"}</DialogTitle>
                            <DialogDescription>
                                Los servicios activos aparecen en el Portal de Familiares. Configure el link de pago si la experiencia tiene costo vía BlueJax.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre de la Experiencia</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej. Cena Gourmet, Terapia VIP"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Descripción</label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Detalles sobre lo que incluye..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Precio unitario (MXN)</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Categoría</label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EXPERIENCIAS">Experiencias</SelectItem>
                                            <SelectItem value="COMIDAS">Comidas</SelectItem>
                                            <SelectItem value="TERAPIAS">Terapias</SelectItem>
                                            <SelectItem value="CUIDADOS">Cuidados</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Frequency Pricing */}
                            <div className="rounded-lg border p-3 bg-muted/20 space-y-3">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium">Precios de Suscripción Mensual (Opcional)</label>
                                    <p className="text-[10px] text-muted-foreground">Deje vacío si el servicio es solo compra única. Las familias verán las opciones de frecuencia en la tienda.</p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] text-muted-foreground">Diario /mes</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={priceDaily}
                                            onChange={(e) => setPriceDaily(e.target.value)}
                                            placeholder="—"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] text-muted-foreground">Semanal /mes</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={priceWeekly}
                                            onChange={(e) => setPriceWeekly(e.target.value)}
                                            placeholder="—"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] text-muted-foreground">Quincenal /mes</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={priceBiweekly}
                                            onChange={(e) => setPriceBiweekly(e.target.value)}
                                            placeholder="—"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Icono (Lucide)</label>
                                    <Input
                                        value={icon}
                                        onChange={(e) => setIcon(e.target.value)}
                                        placeholder="Ej. Gift, Activity, Music"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Link de Pago (Opcional)</label>
                                <Input
                                    type="url"
                                    value={paymentUrl}
                                    onChange={(e) => setPaymentUrl(e.target.value)}
                                    placeholder="https://links.bluejax.ai/..."
                                />
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <LinkIcon className="h-3 w-3" /> Enlace de BlueJax donde la familia completará el pago.
                                </p>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30 mt-2">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium">Estado Activo</label>
                                    <p className="text-[10px] text-muted-foreground">
                                        Si se desactiva, las familias ya no podrán ver u ordenar este servicio.
                                    </p>
                                </div>
                                <Switch
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                                {editingId ? "Guardar Cambios" : "Crear Experiencia"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Experiencia</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Precio</TableHead>
                                    <TableHead>Suscripción</TableHead>
                                    <TableHead>Link Pago</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                                <span className="text-sm">Cargando experiencias...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : experiences.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                                                <Gift className="h-8 w-8 opacity-20" />
                                                <span className="text-sm font-medium">No hay servicios registrados</span>
                                                <p className="text-xs max-w-sm">Haga clic en 'Agregar Experiencia' para crear el primer servicio premium o paquete de cuidados.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    experiences.map((exp) => (
                                        <TableRow key={exp.id} className={!exp.isActive ? "opacity-60 bg-muted/10" : ""}>
                                            <TableCell className="font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center flex-shrink-0">
                                                        <Gift className="h-4 w-4" />
                                                    </div>
                                                    {exp.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[120px]">
                                                <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider">
                                                    {exp.category?.toLowerCase() || "experiencias"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">${exp.price.toFixed(0)}</span>
                                                    {(exp.priceDaily || exp.priceWeekly || exp.priceBiweekly) && (
                                                        <span className="text-[10px] text-purple-400">
                                                            {[exp.priceDaily && `D:$${exp.priceDaily}`, exp.priceWeekly && `S:$${exp.priceWeekly}`, exp.priceBiweekly && `Q:$${exp.priceBiweekly}`].filter(Boolean).join(" ")}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {(exp.priceDaily || exp.priceWeekly || exp.priceBiweekly) ? (
                                                    <Badge className="text-[10px] bg-purple-500/15 text-purple-400 border-purple-500/20 border">Sí</Badge>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground/50">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {exp.paymentUrl ? (
                                                    <a href={exp.paymentUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs flex items-center gap-1">
                                                        <LinkIcon className="h-3 w-3" /> Configurado
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                                                        <AlertTriangle className="h-3 w-3" /> Falta URL
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {exp.isActive ? (
                                                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Activo
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="text-muted-foreground">Inactivo</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenEdit(exp)}
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-500/15"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(exp.id)}
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-500/15"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </FadeIn>
    );
}
