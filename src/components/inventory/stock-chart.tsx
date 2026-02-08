"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const data = [
    { name: 'Paracetamol', stock: 150, min: 20, status: 'OK' },
    { name: 'Insulina', stock: 2, min: 5, status: 'BAJO' },
    { name: 'Omeprazol', stock: 0, min: 30, status: 'AGOTADO' },
    { name: 'Metformina', stock: 85, min: 40, status: 'OK' },
    { name: 'Vendas 10cm', stock: 12, min: 15, status: 'BAJO' },
    { name: 'Guantes M', stock: 200, min: 50, status: 'OK' },
];

export const StockChart = () => {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
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
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.status === 'OK' ? '#3b82f6' : entry.status === 'BAJO' ? '#fbbf24' : '#ef4444'} />
                        ))}
                    </Bar>
                    <Bar dataKey="min" name="Nivel Mínimo" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
