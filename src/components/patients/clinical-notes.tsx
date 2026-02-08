"use client"

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ClinicalNotes = () => {
    const [isAdding, setIsAdding] = useState(false);

    // Mock Data
    const notes = [
        { id: 1, date: "07/02/2026", doctor: "Dr. Ramirez", text: "Paciente estable. Se ajustó dosis de Losartán. Continuar monitoreo de presión arterial matutina." },
        { id: 2, date: "01/02/2026", doctor: "Dra. Elena", text: "Presentó leve mareo después del desayuno. Se descartó hipoglucemia. Posible deshidratación leve." },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Notas de Evolución</h3>
                <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
                    <Plus className="h-4 w-4 mr-2" /> Nueva Nota
                </Button>
            </div>

            {isAdding && (
                <div className="p-4 border rounded-md bg-slate-50 space-y-3 animation-in fade-in slide-in-from-top-2">
                    <Textarea placeholder="Escriba la nota de evolución clínica..." className="min-h-[100px] bg-white" />
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancelar</Button>
                        <Button size="sm">
                            <Save className="h-4 w-4 mr-2" /> Guardar Nota
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {notes.map((note) => (
                    <div key={note.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">{note.date}</Badge>
                                <span className="font-semibold text-sm text-slate-700">{note.doctor}</span>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {note.text}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
