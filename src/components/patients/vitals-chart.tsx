"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Lun', sistolica: 120, diastolica: 80, glucosa: 110 },
    { name: 'Mar', sistolica: 122, diastolica: 82, glucosa: 105 },
    { name: 'Mie', sistolica: 118, diastolica: 79, glucosa: 115 },
    { name: 'Jue', sistolica: 125, diastolica: 85, glucosa: 120 },
    { name: 'Vie', sistolica: 121, diastolica: 81, glucosa: 108 },
    { name: 'Sab', sistolica: 119, diastolica: 78, glucosa: 102 },
    { name: 'Dom', sistolica: 120, diastolica: 80, glucosa: 106 },
];

export const VitalsChart = () => {
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
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sistolica" stroke="#ef4444" name="P. Sistólica" />
                    <Line type="monotone" dataKey="diastolica" stroke="#f97316" name="P. Diastólica" />
                    <Line type="monotone" dataKey="glucosa" stroke="#3b82f6" name="Glucosa (mg/dL)" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
