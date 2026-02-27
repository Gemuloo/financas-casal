import { supabase } from "@/lib/supabase";

export const financeService = {
    async getAll(month: number, year: number) {
        const { data: cards } = await supabase.from("cards").select("*");
        const { data: categories } = await supabase
            .from("categories")
            .select("*");

        const { data: expenses } = await supabase
            .from("expenses")
            .select("*, cards(name), categories(name)")
            .eq("month", month)
            .eq("year", year)
            .order("created_at", { ascending: false });

        return {
            cards: cards || [],
            categories: categories || [],
            expenses: expenses || [],
        };
    },

    async addCard(name: string) {
        await supabase.from("cards").insert({ name });
    },

    async deleteCard(id: string) {
        await supabase.from("cards").delete().eq("id", id);
    },

    async addCategory(name: string) {
        await supabase.from("categories").insert({ name });
    },

    async deleteCategory(id: string) {
        await supabase.from("categories").delete().eq("id", id);
    },

    async addExpense(payload: any) {
        await supabase.from("expenses").insert(payload);
    },

    async deleteExpense(id: string) {
        await supabase.from("expenses").delete().eq("id", id);
    },
};
