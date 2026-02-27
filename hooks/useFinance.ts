"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useFinance(month: number, year: number) {
    const [cards, setCards] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);

    async function loadAll() {
        const { data: c } = await supabase.from("cards").select("*");
        const { data: cat } = await supabase.from("categories").select("*");
        const { data: exp } = await supabase
            .from("expenses")
            .select("*, cards(name), categories(name)")
            .eq("month", month)
            .eq("year", year)
            .order("created_at", { ascending: false });

        setCards(c || []);
        setCategories(cat || []);
        setExpenses(exp || []);
    }

    async function addExpense(payload: any) {
        if (payload.is_installment) {
            for (let i = 1; i <= payload.installment_total; i++) {
                await supabase.from("expenses").insert({
                    ...payload,
                    installment_index: i,
                    month: month + (i - 1),
                    year,
                });
            }
        } else {
            await supabase.from("expenses").insert({
                ...payload,
                month,
                year,
            });
        }

        loadAll();
    }

    async function deleteExpense(id: string) {
        await supabase.from("expenses").delete().eq("id", id);
        loadAll();
    }

    useEffect(() => {
        loadAll();
    }, [month, year]);

    return {
        cards,
        categories,
        expenses,
        addExpense,
        deleteExpense,
        reload: loadAll,
    };
}
