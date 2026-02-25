"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
    const [menuAberto, setMenuAberto] = useState(false);
    const [modalDespesa, setModalDespesa] = useState(false);
    const [categorias, setCategorias] = useState<any[]>([]);

    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [tipo, setTipo] = useState("normal");
    const [parcelado, setParcelado] = useState(false);
    const [parcelas, setParcelas] = useState(1);

    useEffect(() => {
        buscarCategorias();
    }, []);

    async function buscarCategorias() {
        const { data } = await supabase.from("categorias").select("*");
        if (data) setCategorias(data);
    }

    async function salvarDespesa() {
        if (!descricao || !valor || !categoriaId) {
            alert("Preencha todos os campos");
            return;
        }

        const valorNumero = parseFloat(valor);

        if (parcelado && parcelas > 1) {
            for (let i = 1; i <= parcelas; i++) {
                await supabase.from("despesas").insert({
                    descricao,
                    valor: valorNumero / parcelas,
                    categoria_id: categoriaId,
                    tipo,
                    parcela_atual: i,
                    total_parcelas: parcelas,
                });
            }
        } else {
            await supabase.from("despesas").insert({
                descricao,
                valor: valorNumero,
                categoria_id: categoriaId,
                tipo,
                parcela_atual: 1,
                total_parcelas: 1,
            });
        }

        alert("Despesa salva!");
        setModalDespesa(false);
        setDescricao("");
        setValor("");
        setParcelado(false);
        setParcelas(1);
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className="w-72 bg-gradient-to-b from-purple-900 to-purple-700 text-white p-6">
                <h2 className="text-2xl font-bold mb-6">💳 Cartões</h2>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 p-10">
                <h1 className="text-3xl font-bold mb-6">
                    Resumo Financeiro 📊
                </h1>
            </div>

            {/* Botão flutuante */}
            <button
                onClick={() => setMenuAberto(true)}
                className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 
                   text-white w-16 h-16 rounded-full shadow-2xl 
                   flex items-center justify-center text-3xl 
                   transition-all duration-300 hover:scale-110 z-50"
            >
                +
            </button>

            {/* Menu central */}
            {menuAberto && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
                    <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col gap-6 animate-fadeIn">
                        <button
                            onClick={() => {
                                setMenuAberto(false);
                                setModalDespesa(true);
                            }}
                            className="bg-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold"
                        >
                            💰 Nova Despesa
                        </button>

                        <button
                            onClick={() => setMenuAberto(false)}
                            className="text-gray-500 mt-4"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Despesa */}
            {modalDespesa && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 animate-fadeIn">
                        <h2 className="text-xl font-bold mb-4">Nova Despesa</h2>

                        <input
                            placeholder="Descrição"
                            className="w-full p-3 mb-3 border rounded-lg"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                        />

                        <input
                            type="number"
                            placeholder="Valor"
                            className="w-full p-3 mb-3 border rounded-lg"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                        />

                        <select
                            className="w-full p-3 mb-3 border rounded-lg"
                            value={categoriaId}
                            onChange={(e) => setCategoriaId(e.target.value)}
                        >
                            <option value="">Selecione a categoria</option>
                            {categorias.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nome}
                                </option>
                            ))}
                        </select>

                        <select
                            className="w-full p-3 mb-3 border rounded-lg"
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                        >
                            <option value="normal">Despesa Normal</option>
                            <option value="fixa">Despesa Fixa</option>
                        </select>

                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                checked={parcelado}
                                onChange={(e) => setParcelado(e.target.checked)}
                            />
                            <label>Parcelado?</label>
                        </div>

                        {parcelado && (
                            <input
                                type="number"
                                placeholder="Número de parcelas"
                                className="w-full p-3 mb-3 border rounded-lg"
                                value={parcelas}
                                onChange={(e) =>
                                    setParcelas(parseInt(e.target.value))
                                }
                            />
                        )}

                        <button
                            onClick={salvarDespesa}
                            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold mt-3"
                        >
                            Salvar
                        </button>

                        <button
                            onClick={() => setModalDespesa(false)}
                            className="w-full text-gray-500 mt-3"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
