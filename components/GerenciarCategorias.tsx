"use client";

interface Props {
    categorias: any[];
    atualizar: () => void;
}

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function GerenciarCategorias({ categorias, atualizar }: Props) {
    const [editando, setEditando] = useState<string | null>(null);
    const [novoNome, setNovoNome] = useState("");

    async function excluir(id: string) {
        if (!confirm("Deseja excluir essa categoria?")) return;

        await supabase.from("categorias").delete().eq("id", id);
        atualizar();
    }

    async function salvar(id: string) {
        await supabase
            .from("categorias")
            .update({ nome: novoNome })
            .eq("id", id);

        setEditando(null);
        atualizar();
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow mt-6">
            <h2 className="font-bold mb-4">Gerenciar Categorias</h2>

            {categorias.map((c) => (
                <div
                    key={c.id}
                    className="flex justify-between items-center mb-2"
                >
                    {editando === c.id ? (
                        <>
                            <input
                                value={novoNome}
                                onChange={(e) => setNovoNome(e.target.value)}
                                className="border p-2 rounded flex-1 mr-2"
                            />
                            <button
                                onClick={() => salvar(c.id)}
                                className="bg-purple-600 text-white px-3 py-1 rounded mr-2"
                            >
                                Salvar
                            </button>
                        </>
                    ) : (
                        <>
                            <span>{c.nome}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditando(c.id);
                                        setNovoNome(c.nome);
                                    }}
                                    className="text-blue-600"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => excluir(c.id)}
                                    className="text-red-600"
                                >
                                    Excluir
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
