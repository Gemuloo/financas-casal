"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
    const [cards, setCards] = useState<any[]>([]);
    const [nome, setNome] = useState("");
    const [selecionado, setSelecionado] = useState<string | null>(null);
    const [menuAberto, setMenuAberto] = useState(false);

    async function carregarCards() {
        const { data } = await supabase.from("cards").select("*");
        setCards(data || []);
    }

    async function adicionarCard() {
        if (!nome) return;

        await supabase.from("cards").insert({
            nome,
            limite: 0,
        });

        setNome("");
        carregarCards();
    }

    useEffect(() => {
        carregarCards();
    }, []);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
            {/* SIDEBAR */}
            <div className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 shadow-xl">
                <h2 className="text-2xl font-bold mb-6 tracking-wide">
                    💳 Cartões
                </h2>

                <div className="mb-6">
                    <input
                        className="w-full p-3 rounded-lg text-black mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                        placeholder="Nome do cartão"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />

                    <button
                        onClick={adicionarCard}
                        className="w-full bg-purple-600 hover:bg-purple-700 transition-all duration-200 p-3 rounded-lg font-semibold shadow-md"
                    >
                        + Adicionar Cartão
                    </button>
                </div>

                <div className="space-y-3">
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => setSelecionado(card.id)}
                            className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                selecionado === card.id
                                    ? "bg-purple-600 shadow-lg"
                                    : "bg-gray-700 hover:bg-gray-600"
                            }`}
                        >
                            {card.nome}
                        </div>
                    ))}
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="flex-1 p-10">
                <h1 className="text-3xl font-bold mb-8">
                    Resumo Financeiro 📊
                </h1>

                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <p className="text-gray-500 text-sm">Não Parceladas</p>
                        <h2 className="text-2xl font-bold mt-2">R$ 0,00</h2>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <p className="text-gray-500 text-sm">Parceladas</p>
                        <h2 className="text-2xl font-bold mt-2">R$ 0,00</h2>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <p className="text-gray-500 text-sm">Total</p>
                        <h2 className="text-2xl font-bold mt-2">R$ 0,00</h2>
                    </div>
                </div>

                <div className="bg-white shadow-md rounded-xl p-6">
                    Aqui vai aparecer o resumo mensal e anual.
                </div>
            </div>

            {/* BOTÃO FLUTUANTE */}
            <button
                onClick={() => setMenuAberto(true)}
                className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 
                   text-white w-16 h-16 rounded-full shadow-2xl 
                   flex items-center justify-center text-3xl 
                   transition-all duration-300 hover:scale-110 z-50"
            >
                +
            </button>

            {/* MENU CENTRAL FLUTUANTE */}
            {menuAberto && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
                    <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col gap-6 animate-fadeIn">
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all">
                            💰 Nova Despesa
                        </button>

                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all">
                            💳 Novo Cartão
                        </button>

                        <button className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all">
                            📁 Nova Categoria
                        </button>

                        <button
                            onClick={() => setMenuAberto(false)}
                            className="text-gray-500 hover:text-gray-700 mt-4"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
