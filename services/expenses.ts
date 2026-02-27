import { supabase } from "@/lib/supabase";

export async function getExpenses(month: number, year: number) {
    const { data } = await supabase
        .from("expenses")
        .select("*, cards(name), categories(name)")
        .eq("month", month)
        .eq("year", year)
        .order("created_at", { ascending: false });

    return data || [];
}

export async function createExpense(data: any) {
    await supabase.from("expenses").insert([data]);
}

export async function deleteExpense(id: string) {
    await supabase.from("expenses").delete().eq("id", id);
}
