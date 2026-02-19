"use client"

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition } from "react";
import { Plus, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { addClinicalNote } from "@/actions/clinical-notes";
import { toast } from "sonner";
import { Prisma } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Define the type based on the include in getPatientById
type NoteWithAuthor = Prisma.DailyLogGetPayload<{
    include: { author: true }
}>;

interface ClinicalNotesProps {
    notes: NoteWithAuthor[];
    patientId: string;
}

export const ClinicalNotes = ({ notes, patientId }: ClinicalNotesProps) => {
    const [isAdding, setIsAdding] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSaveNote = () => {
        if (!noteText.trim()) return;

        startTransition(async () => {
            const result = await addClinicalNote(patientId, noteText);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Nota guardada exitosamente");
                setIsAdding(false);
                setNoteText("");
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h3 className="text-lg font-bold text-foreground">Notas de Evolución</h3>
                    <p className="text-sm text-muted-foreground">Historial clínico y reportes de guardia.</p>
                </div>
                <Button
                    onClick={() => setIsAdding(!isAdding)}
                    className={cn(
                        "transition-all duration-300",
                        isAdding ? "bg-red-500/15 text-red-400 hover:bg-red-200" : "bg-blue-600 hover:bg-blue-700"
                    )}
                >
                    {isAdding ? "Cancelar" : <><Plus className="h-4 w-4 mr-2" /> Nueva Nota</>}
                </Button>
            </div>

            {isAdding && (
                <div className="p-4 border rounded-xl bg-muted/50 shadow-inner space-y-4 animate-in fade-in slide-in-from-top-2">
                    <Textarea
                        placeholder="Escriba los detalles de la evolución del paciente, signos vitales relevantes o incidencias..."
                        className="min-h-[120px] bg-card text-base resize-none focus-visible:ring-blue-500"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        disabled={isPending}
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsAdding(false)} disabled={isPending}>Descartar</Button>
                        <Button onClick={handleSaveNote} disabled={isPending || !noteText.trim()} className="bg-blue-600 hover:bg-blue-700">
                            <Save className="h-4 w-4 mr-2" /> {isPending ? "Guardando..." : "Guardar Nota"}
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {notes.length === 0 ? (
                    <div className="text-center py-12 bg-card/[0.02] rounded-xl border border-dashed border-border">
                        <div className="mx-auto w-12 h-12 bg-muted/60 rounded-full flex items-center justify-center mb-3">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h4 className="text-sm font-medium text-foreground">Sin notas registradas</h4>
                        <p className="text-sm text-muted-foreground mt-1">Comience agregando una nueva nota de evolución.</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div key={note.id} className="group flex gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-colors bg-card shadow-sm hover:shadow-md">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                <AvatarFallback className="bg-blue-500/15 text-blue-400 font-bold">
                                    {note.author?.name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1.5">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-foreground">
                                            {note.author?.name || "Usuario Desconocido"}
                                        </span>
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-medium bg-muted/60 text-muted-foreground border-border">
                                            {note.author?.role || "STAFF"}
                                        </Badge>
                                    </div>
                                    <time className="text-xs text-muted-foreground font-medium tabular-nums">
                                        {new Date(note.createdAt).toLocaleDateString()} • {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </time>
                                </div>
                                <p className="text-secondary-foreground text-sm leading-relaxed whitespace-pre-wrap">
                                    {note.value}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
