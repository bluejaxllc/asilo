"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface StockChartProps {
    medications: any[];
}

export const StockChart = ({ medications }: StockChartProps) => {
    // Transform medications data for chart
    const chartData = medications.map(med => ({
        name: med.name.length > 15 ? med.name.substring(0, 12) + '...' : med.name,
        stock: med.stock,
        min: med.min,
        status: med.status
    }));

    if (chartData.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                No hay datos para mostrar
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stock" name="Existencias Actuales" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.status === 'OK' ? '#3b82f6' : entry.status === 'BAJO' ? '#fbbf24' : '#ef4444'} />
                        ))}
                    </Bar>
                    <Bar dataKey="min" name="Nivel Mínimo" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
