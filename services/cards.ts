import { supabase } from "@/lib/supabase";

export async function getCards() {
    const { data } = await supabase.from("cards").select("*");
    return data || [];
}

export async function createCard(name: string) {
    await supabase.from("cards").insert([{ name }]);
}

export async function deleteCard(id: string) {
    await supabase.from("cards").delete().eq("id", id);
}
