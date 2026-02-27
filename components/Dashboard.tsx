"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface Props {
    resumoAnual: { mes: string; total: number }[];
}

export default function Dashboard({ resumoAnual }: Props) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow h-96">
            <h2 className="text-lg font-bold mb-4">Resumo Anual</h2>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resumoAnual}>
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
