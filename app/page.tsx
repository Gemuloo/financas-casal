"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function Home() {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    const [mes, setMes] = useState(mesAtual);
    const [ano, setAno] = useState(anoAtual);

    const [cards, setCards] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [despesas, setDespesas] = useState<any[]>([]);
    const [cardSelecionado, setCardSelecionado] = useState<string | null>(null);

    const [modal, setModal] = useState(false);

    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [tipo, setTipo] = useState("normal");
    const [parcelado, setParcelado] = useState(false);
    const [parcelas, setParcelas] = useState(1);

    useEffect(() => {
        carregar();
    }, []);

    async function carregar() {
        const { data: cardsData } = await supabase.from("cards").select("*");
        const { data: catData } = await supabase.from("categorias").select("*");
        const { data: despData } = await supabase.from("despesas").select("*");

        setCards(cardsData || []);
        setCategorias(catData || []);
        setDespesas(despData || []);
    }

    async function salvarDespesa() {
        if (!cardSelecionado) return alert("Selecione um cartão");

        const valorNumero = parseFloat(valor);
        const grupo = uuidv4();

        if (parcelado && parcelas > 1) {
            for (let i = 0; i < parcelas; i++) {
                const novaData = new Date(ano, mes - 1 + i, 1);

                await supabase.from("despesas").insert({
                    descricao,
                    valor: valorNumero / parcelas,
                    categoria_id: categoriaId,
                    card_id: cardSelecionado,
                    tipo,
                    parcelado: true,
                    grupo_parcela: grupo,
                    numero_parcela: i + 1,
                    total_parcelas: parcelas,
                    mes: novaData.getMonth() + 1,
                    ano: novaData.getFullYear(),
                    data: novaData,
                });
            }
        } else {
            await supabase.from("despesas").insert({
                descricao,
                valor: valorNumero,
                categoria_id: categoriaId,
                card_id: cardSelecionado,
                tipo,
                parcelado: false,
                mes,
                ano,
                data: new Date(),
            });
        }

        setModal(false);
        setDescricao("");
        setValor("");
        setParcelado(false);
        setParcelas(1);

        carregar();
    }

    async function excluirInteligente(despesa: any, modo: string) {
        if (!despesa.grupo_parcela) {
            await supabase.from("despesas").delete().eq("id", despesa.id);
        } else {
            if (modo === "uma") {
                await supabase.from("despesas").delete().eq("id", despesa.id);
            }

            if (modo === "futuras") {
                await supabase
                    .from("despesas")
                    .delete()
                    .eq("grupo_parcela", despesa.grupo_parcela)
                    .gte("numero_parcela", despesa.numero_parcela);
            }

            if (modo === "todas") {
                await supabase
                    .from("despesas")
                    .delete()
                    .eq("grupo_parcela", despesa.grupo_parcela);
            }
        }

        carregar();
    }

    const despesasFiltradas = despesas.filter(
        (d) => d.card_id === cardSelecionado && d.mes === mes && d.ano === ano,
    );

    const total = despesasFiltradas.reduce(
        (acc, d) => acc + Number(d.valor),
        0,
    );
    const fixas = despesasFiltradas
        .filter((d) => d.tipo === "fixa")
        .reduce((acc, d) => acc + Number(d.valor), 0);

    const parceladas = despesasFiltradas
        .filter((d) => d.parcelado)
        .reduce((acc, d) => acc + Number(d.valor), 0);

    const resumoAnual = Array.from({ length: 12 }, (_, i) => {
        const mesNum = i + 1;
        const totalMes = despesas
            .filter((d) => d.mes === mesNum && d.ano === ano)
            .reduce((acc, d) => acc + Number(d.valor), 0);

        return {
            mes: mesNum,
            total: totalMes,
        };
    });

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-72 bg-purple-800 text-white p-6">
                <h2 className="text-xl font-bold mb-4">Cartões</h2>
                {cards.map((card) => (
                    <div
                        key={card.id}
                        onClick={() => setCardSelecionado(card.id)}
                        className={`p-3 rounded mb-2 cursor-pointer ${
                            cardSelecionado === card.id
                                ? "bg-white text-purple-800"
                                : "bg-purple-700"
                        }`}
                    >
                        {card.nome}
                    </div>
                ))}
            </div>

            {/* Conteúdo */}
            <div className="flex-1 p-6">
                <div className="flex flex-wrap gap-4 mb-6">
                    <select
                        value={mes}
                        onChange={(e) => setMes(Number(e.target.value))}
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i + 1}>
                                Mês {i + 1}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        value={ano}
                        onChange={(e) => setAno(Number(e.target.value))}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded shadow">
                        Total: R$ {total.toFixed(2)}
                    </div>
                    <div className="bg-white p-4 rounded shadow">
                        Fixas: R$ {fixas.toFixed(2)}
                    </div>
                    <div className="bg-white p-4 rounded shadow">
                        Parceladas: R$ {parceladas.toFixed(2)}
                    </div>
                </div>

                {/* Lista */}
                <div className="bg-white p-4 rounded shadow mb-8">
                    {despesasFiltradas.map((d) => (
                        <div
                            key={d.id}
                            className="flex justify-between border-b py-2"
                        >
                            <div>
                                {d.descricao}
                                {d.parcelado && (
                                    <span className="text-sm text-gray-500 ml-2">
                                        ({d.numero_parcela}/{d.total_parcelas})
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2">
                                R$ {Number(d.valor).toFixed(2)}
                                <button
                                    onClick={() => excluirInteligente(d, "uma")}
                                >
                                    ❌
                                </button>
                                <button
                                    onClick={() =>
                                        excluirInteligente(d, "futuras")
                                    }
                                >
                                    ⏭
                                </button>
                                <button
                                    onClick={() =>
                                        excluirInteligente(d, "todas")
                                    }
                                >
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dashboard gráfico */}
                <div className="bg-white p-6 rounded shadow h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={resumoAnual}>
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="#7c3aed" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Botão flutuante */}
            <button
                onClick={() => setModal(true)}
                className="fixed bottom-6 right-6 bg-purple-600 text-white w-16 h-16 rounded-full shadow-lg text-3xl"
            >
                +
            </button>

            {modal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded w-96">
                        <h2 className="font-bold mb-4">Nova Despesa</h2>

                        <input
                            placeholder="Descrição"
                            className="w-full border p-2 mb-2"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                        />

                        <input
                            type="number"
                            placeholder="Valor"
                            className="w-full border p-2 mb-2"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                        />

                        <select
                            className="w-full border p-2 mb-2"
                            value={categoriaId}
                            onChange={(e) => setCategoriaId(e.target.value)}
                        >
                            <option value="">Categoria</option>
                            {categorias.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nome}
                                </option>
                            ))}
                        </select>

                        <select
                            className="w-full border p-2 mb-2"
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                        >
                            <option value="normal">Normal</option>
                            <option value="fixa">Fixa</option>
                        </select>

                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                checked={parcelado}
                                onChange={(e) => setParcelado(e.target.checked)}
                            />
                            Parcelado
                        </div>

                        {parcelado && (
                            <input
                                type="number"
                                placeholder="Parcelas"
                                className="w-full border p-2 mb-2"
                                value={parcelas}
                                onChange={(e) =>
                                    setParcelas(Number(e.target.value))
                                }
                            />
                        )}

                        <button
                            onClick={salvarDespesa}
                            className="w-full bg-purple-600 text-white py-2 rounded"
                        >
                            Salvar
                        </button>

                        <button
                            onClick={() => setModal(false)}
                            className="w-full mt-2 text-gray-500"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
