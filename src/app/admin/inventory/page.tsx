"use client"

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MedicationForm } from "@/components/inventory/medication-form";
import { Plus, AlertTriangle, Pill, BarChart3, Loader2 } from "lucide-react";
import { ClientStockChart } from "@/components/inventory/client-stock-chart";
import { FadeIn, SlideInRow } from "@/components/ui/motion-wrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAllMedications, updateMedicationStock } from "@/actions/medication";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SearchInput } from "@/components/ui/search-input";
import { useSearchParams } from "next/navigation";

export default function InventoryPage() {
    return (
        <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>}>
            <InventoryPageContent />
        </Suspense>
    );
}

function InventoryPageContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || "";
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [selectedMed, setSelectedMed] = useState<any>(null);
    const [newStock, setNewStock] = useState("");

    const fetchMedications = async () => {
        setLoading(true);
        const data = await getAllMedications(query);
        setInventory(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchMedications();
    }, [query]);

    const handleMedicationAdded = () => {
        setAddOpen(false);
        fetchMedications();
    };

    const handleUpdateStock = async () => {
        if (!selectedMed || !newStock) return;

        const stockNum = Number(newStock);
        if (isNaN(stockNum) || stockNum < 0) {
            toast.error("Ingrese un número válido");
            return;
        }

        const result = await updateMedicationStock(selectedMed.id, stockNum);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success!);
            setUpdateOpen(false);
            setSelectedMed(null);
            setNewStock("");
            fetchMedications();
        }
    };

    const openUpdateDialog = (item: any) => {
        setSelectedMed(item);
        setNewStock(item.stock.toString());
        setUpdateOpen(true);
    };

    const lowStockCount = inventory.filter(i => i.status !== "OK").length;
    const okCount = inventory.filter(i => i.status === "OK").length;
    const lowCount = inventory.filter(i => i.status === "BAJO").length;
    const outCount = inventory.filter(i => i.status === "AGOTADO").length;
    const total = inventory.length || 1;

    return (
        <FadeIn className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Inventario Médico</h2>
                    <p className="text-muted-foreground">
                        Rastree medicamentos, suministros y alertas de stock.
                    </p>
                </div>
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Agregar Medicamento
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Nuevo Medicamento</DialogTitle>
                        </DialogHeader>
                        <MedicationForm onSuccess={handleMedicationAdded} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <SearchInput placeholder="Buscar medicamento..." />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" /> Nivel de Inventario
                        </CardTitle>
                        <CardDescription>Visualización de stock vs nivel mínimo requerido</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ClientStockChart medications={inventory} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Resumen de Estado</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <span className="font-medium text-green-900">En Orden</span>
                            </div>
                            <span className="font-bold text-green-700 text-xl">
                                {Math.round((okCount / total) * 100)}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                <span className="font-medium text-yellow-900">Stock Bajo</span>
                            </div>
                            <span className="font-bold text-yellow-700 text-xl">
                                {Math.round((lowCount / total) * 100)}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-red-500" />
                                <span className="font-medium text-red-900">Agotado</span>
                            </div>
                            <span className="font-bold text-red-700 text-xl">
                                {Math.round((outCount / total) * 100)}%
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {lowStockCount > 0 && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Alerta de Stock Bajo</AlertTitle>
                    <AlertDescription>
                        {lowStockCount} artículos están agotados o por agotarse. Reordene inmediatamente.
                    </AlertDescription>
                </Alert>
            )}

            <div className="border rounded-xl shadow-sm bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="font-semibold text-slate-700">Medicamento</TableHead>
                            <TableHead className="font-semibold text-slate-700">Nivel Stock</TableHead>
                            <TableHead className="font-semibold text-slate-700">Nivel Min.</TableHead>
                            <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> Cargando inventario...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : inventory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Pill className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p>No hay medicamentos en el inventario.</p>
                                        <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
                                            Agregar el primero
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : inventory.map((item, i) => (
                            <SlideInRow key={item.id} delay={i * 0.05} className="hover:bg-slate-50 transition-colors group border-b">
                                <TableCell className="font-medium">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                                            <Pill className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <span className="text-slate-700">{item.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-slate-600">{item.stock} <span className="text-xs text-slate-400">{item.unit}</span></TableCell>
                                <TableCell className="font-mono text-slate-400">{item.min} <span className="text-xs">{item.unit}</span></TableCell>
                                <TableCell>
                                    {item.status === 'OK' && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shadow-sm">En Stock</Badge>}
                                    {item.status === 'BAJO' && <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 shadow-sm animate-pulse">Stock Bajo</Badge>}
                                    {item.status === 'AGOTADO' && <Badge variant="destructive" className="shadow-sm">Agotado</Badge>}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => openUpdateDialog(item)} className="hover:text-blue-600">
                                        Actualizar
                                    </Button>
                                </TableCell>
                            </SlideInRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Update Stock Dialog */}
            <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Actualizar Stock - {selectedMed?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Stock Actual</label>
                            <p className="text-2xl font-bold">{selectedMed?.stock} {selectedMed?.unit}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nuevo Stock</label>
                            <Input
                                type="number"
                                min="0"
                                value={newStock}
                                onChange={(e) => setNewStock(e.target.value)}
                                placeholder="Ingrese nuevo stock"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setUpdateOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdateStock}>
                            Guardar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </FadeIn>
    );
}
