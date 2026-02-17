"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DailyLog } from '@prisma/client';

interface VitalsChartProps {
    logs: DailyLog[];
}

export const VitalsChart = ({ logs = [] }: VitalsChartProps) => {
    // Process logs to extract BP data
    const data = logs
        .filter(log => log.type === 'VITALS' && log.value && log.value.includes('/'))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map(log => {
            const [systolic, diastolic] = (log.value || "").split('/').map(Number);
            const date = new Date(log.createdAt);

            // Format date as "DD/MM HH:mm"
            const name = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;

            return {
                name,
                sistolica: !isNaN(systolic) ? systolic : null,
                diastolica: !isNaN(diastolic) ? diastolic : null,
                // Attempt to parse glucose if it exists in notes or different format later
                // For now, we only handle BP as requested
            };
        })
        .filter(item => item.sistolica !== null && item.diastolica !== null);

    if (data.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                No hay datos de signos vitales disponibles (Formato: 120/80)
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sistolica" stroke="#ef4444" name="P. Sistólica" />
                    <Line type="monotone" dataKey="diastolica" stroke="#f97316" name="P. Diastólica" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
