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

// Mock Data
const inventory = [
    { id: "1", name: "Paracetamol 500mg", stock: 150, min: 20, unit: "pastillas", status: "OK" },
    { id: "2", name: "Insulina Glargina", stock: 2, min: 5, unit: "plumas", status: "BAJO" },
    { id: "3", name: "Omeprazol 20mg", stock: 0, min: 30, unit: "pastillas", status: "AGOTADO" },
];

export default function InventoryPage() {
    const lowStockCount = inventory.filter(i => i.status !== "OK").length;

    return (
        <FadeIn className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Inventario Médico</h2>
                    <p className="text-muted-foreground">
                        Rastree medicamentos, suministros y alertas de stock.
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Agregar Medicamento
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Nuevo Medicamento</DialogTitle>
                        </DialogHeader>
                        <MedicationForm />
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
                        <ClientStockChart />
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
                            <span className="font-bold text-green-700 text-xl">85%</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                <span className="font-medium text-yellow-900">Stock Bajo</span>
                            </div>
                            <span className="font-bold text-yellow-700 text-xl">12%</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-red-500" />
                                <span className="font-medium text-red-900">Agotado</span>
                            </div>
                            <span className="font-bold text-red-700 text-xl">3%</span>
                        </div>
                    </CardContent>
                </Card>
            </div>


            {
                lowStockCount > 0 && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Alerta de Stock Bajo</AlertTitle>
                        <AlertDescription>
                            {lowStockCount} artículos están agotados o por agotarse. Reordene inmediatamente.
                        </AlertDescription>
                    </Alert>
                )
            }

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
                        {inventory.map((item) => (
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
                                    <Button variant="ghost" size="sm">Actualizar Stock</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </FadeIn>
    );
}
