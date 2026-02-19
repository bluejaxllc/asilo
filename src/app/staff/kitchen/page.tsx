import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Utensils, AlertTriangle, Users, Salad, Sun, Sunset, Moon } from "lucide-react";
import { FadeIn, SlideIn, ScaleIn, HoverScale } from "@/components/ui/motion-wrapper";

export const dynamic = 'force-dynamic';

interface KitchenPageProps {
    searchParams: {
        q?: string;
    }
}

const getMealPeriod = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return { label: "Desayuno", icon: Sun, color: "text-amber-500" };
    if (hour >= 11 && hour < 16) return { label: "Comida", icon: Sunset, color: "text-orange-500" };
    return { label: "Cena", icon: Moon, color: "text-indigo-500" };
};

export default async function KitchenPage({ searchParams }: KitchenPageProps) {
    const query = searchParams.q || "";

    const patients = await db.patient.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { room: { contains: query, mode: 'insensitive' } }
            ]
        },
        orderBy: { room: 'asc' },
        select: {
            id: true,
            name: true,
            room: true,
            dietaryNeeds: true,
            status: true
        }
    });

    const specialDietCount = patients.filter(p => p.dietaryNeeds && p.dietaryNeeds !== "Normal").length;
    const allergyCount = patients.filter(p => p.dietaryNeeds?.toLowerCase().includes('alerg')).length;
    const meal = getMealPeriod();
    const MealIcon = meal.icon;

    return (
        <FadeIn className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Cocina y Dietas</h2>
                    <p className="text-muted-foreground mt-1">
                        Supervisión de requerimientos dietéticos y distribución de alimentos.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border shadow-sm">
                        <MealIcon className={cn("h-5 w-5", meal.color)} />
                        <span className="text-sm font-semibold text-secondary-foreground">{meal.label}</span>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 grid-cols-3">
                <ScaleIn delay={0}>
                    <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-1">
                        <CardContent className="p-4 md:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-100 font-medium">Residentes</p>
                                    <p className="text-3xl font-bold mt-1">{patients.length}</p>
                                </div>
                                <div className="h-11 w-11 bg-card/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Users className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </ScaleIn>

                <ScaleIn delay={0.1}>
                    <Card className="border-0 bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:-translate-y-1">
                        <CardContent className="p-4 md:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-orange-100 font-medium">Dietas Especiales</p>
                                    <p className="text-3xl font-bold mt-1">{specialDietCount}</p>
                                </div>
                                <div className="h-11 w-11 bg-card/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Salad className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </ScaleIn>

                <ScaleIn delay={0.2}>
                    <Card className={`border-0 text-white shadow-lg transition-all hover:-translate-y-1 ${allergyCount > 0 ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/20 hover:shadow-red-500/40' : 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/20 hover:shadow-emerald-500/40'}`}>
                        <CardContent className="p-4 md:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${allergyCount > 0 ? 'text-red-100' : 'text-emerald-100'}`}>Alertas Alergia</p>
                                    <p className="text-3xl font-bold mt-1">{allergyCount}</p>
                                </div>
                                <div className="h-11 w-11 bg-card/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </ScaleIn>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
                <SearchInput placeholder="Buscar residente o habitación..." />
            </div>

            {/* Diet Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {patients.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-muted-foreground bg-card/[0.02] rounded-2xl border border-dashed border-border">
                        No se encontraron residentes.
                    </div>
                ) : patients.map((p, i) => {
                    const hasSpecialDiet = p.dietaryNeeds && p.dietaryNeeds !== "Normal";
                    const hasAllergy = p.dietaryNeeds?.toLowerCase().includes('alerg');

                    return (
                        <SlideIn key={p.id} delay={i * 0.04}>
                            <HoverScale>
                                <Card className={cn(
                                    "h-full shadow-md hover:shadow-lg transition-all duration-300 border-0 bg-card rounded-2xl overflow-hidden",
                                    hasAllergy ? "ring-2 ring-red-200" : ""
                                )}>
                                    {/* Top color bar */}
                                    <div className={cn(
                                        "h-1.5",
                                        hasAllergy ? "bg-gradient-to-r from-red-500 to-red-400" :
                                            hasSpecialDiet ? "bg-gradient-to-r from-orange-500 to-amber-400" :
                                                "bg-gradient-to-r from-emerald-500 to-green-400"
                                    )} />

                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl font-bold text-foreground">{p.name}</CardTitle>
                                                <p className="text-sm font-mono text-muted-foreground mt-0.5">Hab. {p.room}</p>
                                            </div>
                                            <Badge variant="outline" className="bg-card/[0.02] text-muted-foreground border-border text-xs">
                                                {p.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-0">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                                                <Utensils className="h-3.5 w-3.5 text-orange-500" />
                                                <span>Régimen Alimenticio</span>
                                            </div>
                                            <div className={cn(
                                                "p-3 rounded-xl border",
                                                hasSpecialDiet ? "bg-orange-500/10 border-orange-500/20" : "bg-emerald-500/10 border-emerald-500/20"
                                            )}>
                                                <span className={cn(
                                                    "text-base font-bold block",
                                                    hasSpecialDiet ? "text-orange-400" : "text-emerald-400"
                                                )}>
                                                    {p.dietaryNeeds || "Normal / Sin Restricciones"}
                                                </span>
                                            </div>
                                        </div>

                                        {hasAllergy && (
                                            <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 flex items-start gap-3">
                                                <div className="p-1 bg-red-500/15 rounded-lg mt-0.5">
                                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-0.5">Alerta de Alergia</div>
                                                    <div className="text-xs text-red-400 leading-snug">
                                                        Verificar expediente clínico para detalles específicos.
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </HoverScale>
                        </SlideIn>
                    );
                })}
            </div>
        </FadeIn>
    );
}
