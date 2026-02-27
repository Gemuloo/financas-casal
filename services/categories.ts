import { supabase } from "@/lib/supabase";

export async function getCategories() {
    const { data } = await supabase.from("categories").select("*");
    return data || [];
}

export async function createCategory(name: string) {
    await supabase.from("categories").insert([{ name }]);
}

export async function deleteCategory(id: string) {
    await supabase.from("categories").delete().eq("id", id);
}
