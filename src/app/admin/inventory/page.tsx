"use client"

import { useState, useEffect } from "react";
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
import { Plus, AlertTriangle, Pill, BarChart3 } from "lucide-react";
import { ClientStockChart } from "@/components/inventory/client-stock-chart";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAllMedications, updateMedicationStock } from "@/actions/medication";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function InventoryPage() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [selectedMed, setSelectedMed] = useState<any>(null);
    const [newStock, setNewStock] = useState("");

    const fetchMedications = async () => {
        setLoading(true);
        const data = await getAllMedications();
        setInventory(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchMedications();
    }, []);

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

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Medicamento</TableHead>
                            <TableHead>Nivel Stock</TableHead>
                            <TableHead>Nivel Min.</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Cargando inventario...
                                </TableCell>
                            </TableRow>
                        ) : inventory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No hay medicamentos en el inventario. Agregue uno para comenzar.
                                </TableCell>
                            </TableRow>
                        ) : inventory.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium flex items-center">
                                    <Pill className="mr-2 h-4 w-4 text-slate-500" />
                                    {item.name}
                                </TableCell>
                                <TableCell>{item.stock} {item.unit}</TableCell>
                                <TableCell>{item.min} {item.unit}</TableCell>
                                <TableCell>
                                    {item.status === 'OK' && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">En Stock</Badge>}
                                    {item.status === 'BAJO' && <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Stock Bajo</Badge>}
                                    {item.status === 'AGOTADO' && <Badge variant="destructive">Agotado</Badge>}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => openUpdateDialog(item)}>
                                        Actualizar Stock
                                    </Button>
                                </TableCell>
                            </TableRow>
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
