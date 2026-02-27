"use client";

import { useState } from "react";
import { useFinance } from "@/hooks/useFinance";
import SummaryCards from "@/components/SummaryCards";
import ExpenseList from "@/components/ExpenseList";

export default function Home() {
    const [month, setMonth] = useState(2);
    const [year, setYear] = useState(2026);

    const { expenses, deleteExpense } = useFinance(month, year);

    return (
        <div className="layout-container">
            <main className="flex-1 p-8">
                <SummaryCards expenses={expenses} />
                <ExpenseList expenses={expenses} onDelete={deleteExpense} />
            </main>
        </div>
    );
}
