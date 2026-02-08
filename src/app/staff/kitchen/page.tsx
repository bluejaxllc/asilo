import { db } from "@/lib/db";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Utensils, AlertTriangle } from "lucide-react";
import { FadeIn, SlideIn, HoverScale } from "@/components/ui/motion-wrapper";

export default async function KitchenPage() {
    const patients = await db.patient.findMany({
        orderBy: { room: 'asc' },
        select: {
            id: true,
            name: true,
            room: true,
            dietaryNeeds: true,
            status: true
        }
    });

    return (
        <FadeIn className="space-y-6">
            <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <Search className="text-slate-400 h-6 w-6" />
                <Input className="text-xl h-14 border-0 focus-visible:ring-0 placeholder:text-slate-400" placeholder="Buscar residente o habitación..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map((p, i) => (
                    <SlideIn key={p.id} delay={i * 0.1}>
                        <HoverScale>
                            <Card className="shadow-md transition-shadow duration-300 border-t-4 border-t-orange-400">
                                <CardHeader className="pb-3 bg-slate-50/50">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-2xl font-bold text-slate-800">{p.name}</CardTitle>
                                        <Badge variant="outline" className="text-lg px-3 py-1 bg-white shadow-sm font-mono">Hab {p.room || 'N/A'}</Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-2 mt-2 text-slate-600 font-medium">
                                        <Utensils className="h-4 w-4" /> Perfil Dietético
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tipo de Dieta</div>
                                        <div className="text-2xl font-bold text-slate-900">{p.dietaryNeeds || "General / Sin Restricciones"}</div>
                                    </div>

                                    {/* Since we don't have separate fields for texture/allergies in simple schema yet, we verify if dietaryNeeds implies them or add placeholders */}
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estado</div>
                                        <Badge className={`text-md px-3 py-1 ${p.status === 'Estable' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {p.status}
                                        </Badge>
                                    </div>

                                    {p.dietaryNeeds?.toLowerCase().includes('alerg') && (
                                        <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-3">
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                            <div>
                                                <div className="text-xs font-bold text-red-500 uppercase tracking-widest">Alerta</div>
                                                <div className="text-sm font-bold text-red-700">Revisar restricciones</div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </HoverScale>
                    </SlideIn>
                ))}
            </div>
        </FadeIn>
    );
}
