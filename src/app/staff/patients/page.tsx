import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Activity, Pill, Utensils } from "lucide-react";
import { LogForm } from "@/components/staff/log-form";
import { FadeIn, SlideIn, HoverScale } from "@/components/ui/motion-wrapper";

export default async function StaffPatientsPage() {
    const patients = await db.patient.findMany({
        orderBy: { name: 'asc' },
        include: {
            dailyLogs: {
                where: { type: 'VITALS' },
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        }
    });

    // Format patients with last vital time
    const patientsWithVitals = patients.map(p => {
        const lastVital = p.dailyLogs[0];
        let lastVitalTime = "--:--";

        if (lastVital) {
            const now = new Date();
            const vitalDate = new Date(lastVital.createdAt);
            const diffMs = now.getTime() - vitalDate.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);

            if (diffHours > 0) {
                lastVitalTime = `${diffHours}h`;
            } else if (diffMins > 0) {
                lastVitalTime = `${diffMins}m`;
            } else {
                lastVitalTime = "ahora";
            }
        }

        return {
            ...p,
            lastVitalTime
        };
    });

    return (
        <FadeIn className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-slate-800">Bitácora de Cuidado</h2>
                <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    Seleccione un residente para registrar actividad
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {patients.map((p, index) => (
                    <SlideIn key={p.id} delay={index * 0.1}>
                        <HoverScale className="h-full">
                            <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer border-t-8 border-t-blue-500 h-full flex flex-col">
                                <CardHeader className="pb-4 bg-slate-50/50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <CardTitle className="text-3xl font-bold text-slate-800">{p.name}</CardTitle>
                                            <span className="text-lg text-slate-500 mt-1">Habitación {p.room || "N/A"}</span>
                                        </div>
                                        <Badge className={`text-lg px-4 py-1 ${p.status === 'Estable' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                                            {p.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="py-6 flex-grow">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                                            <span className="block text-xs font-bold text-slate-400 uppercase">Última Vital</span>
                                            <span className="block text-lg font-semibold text-slate-700">--:--</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                                            <span className="block text-xs font-bold text-slate-400 uppercase">Dieta</span>
                                            <span className="block text-lg font-semibold text-slate-700">{p.dietaryNeeds || "General"}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="grid grid-cols-3 gap-3 p-4 bg-slate-50/30">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="flex flex-col h-24 gap-2 border-2 hover:border-blue-500 hover:bg-blue-50 active:scale-95 transition-all" title="Registrar Vitales">
                                                <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                                    <Activity className="h-6 w-6" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-600">Vitales</span>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px]">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl">Registrar Signos Vitales</DialogTitle>
                                                <div className="text-muted-foreground">Residente: {p.name}</div>
                                            </DialogHeader>
                                            <LogForm initialType="VITALS" patientName={p.name} patientId={p.id} />
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="flex flex-col h-24 gap-2 border-2 hover:border-orange-500 hover:bg-orange-50 active:scale-95 transition-all" title="Registrar Alimentos">
                                                <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                                                    <Utensils className="h-6 w-6" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-600">Alimentos</span>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px]">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl">Registrar Alimentación</DialogTitle>
                                                <div className="text-muted-foreground">Residente: {p.name}</div>
                                            </DialogHeader>
                                            <LogForm initialType="FOOD" patientName={p.name} patientId={p.id} />
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="flex flex-col h-24 gap-2 border-2 hover:border-green-500 hover:bg-green-50 active:scale-95 transition-all" title="Registrar Medicamentos">
                                                <div className="p-2 bg-green-100 rounded-full text-green-600">
                                                    <Pill className="h-6 w-6" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-600">Meds</span>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px]">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl">Administrar Medicamento</DialogTitle>
                                                <div className="text-muted-foreground">Residente: {p.name}</div>
                                            </DialogHeader>
                                            <LogForm initialType="MEDS" patientName={p.name} patientId={p.id} />
                                        </DialogContent>
                                    </Dialog>
                                </CardFooter>
                            </Card>
                        </HoverScale>
                    </SlideIn>
                ))}
            </div>
        </FadeIn>
    );
}
