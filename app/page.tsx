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

    const [modalDespesa, setModalDespesa] = useState(false);
    const [modalCard, setModalCard] = useState(false);
    const [modalCategoria, setModalCategoria] = useState(false);

    const [nomeCard, setNomeCard] = useState("");
    const [nomeCategoria, setNomeCategoria] = useState("");
    const [tipoCategoria, setTipoCategoria] = useState("normal");

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

    async function criarCard() {
        await supabase.from("cards").insert({ nome: nomeCard });
        setNomeCard("");
        setModalCard(false);
        carregar();
    }

    async function criarCategoria() {
        await supabase.from("categorias").insert({
            nome: nomeCategoria,
            tipo: tipoCategoria,
        });
        setNomeCategoria("");
        setModalCategoria(false);
        carregar();
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

        setModalDespesa(false);
        setDescricao("");
        setValor("");
        setParcelado(false);
        setParcelas(1);
        carregar();
    }

    const despesasFiltradas = despesas.filter(
        (d) => d.card_id === cardSelecionado && d.mes === mes && d.ano === ano,
    );

    const total = despesasFiltradas.reduce(
        (acc, d) => acc + Number(d.valor),
        0,
    );

    const resumoAnual = Array.from({ length: 12 }, (_, i) => {
        const mesNum = i + 1;
        const totalMes = despesas
            .filter((d) => d.mes === mesNum && d.ano === ano)
            .reduce((acc, d) => acc + Number(d.valor), 0);

        return { mes: mesNum, total: totalMes };
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

                <button
                    onClick={() => setModalCard(true)}
                    className="mt-4 bg-white text-purple-800 p-2 rounded w-full"
                >
                    + Novo Cartão
                </button>

                <button
                    onClick={() => setModalCategoria(true)}
                    className="mt-2 bg-white text-purple-800 p-2 rounded w-full"
                >
                    + Nova Categoria
                </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 p-6">
                <div className="flex gap-4 mb-6">
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

                <div className="bg-white p-4 rounded shadow mb-6">
                    Total: R$ {total.toFixed(2)}
                </div>

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
                onClick={() => setModalDespesa(true)}
                className="fixed bottom-6 right-6 bg-purple-600 text-white w-16 h-16 rounded-full shadow-lg text-3xl"
            >
                +
            </button>

            {/* Modal Despesa */}
            {modalDespesa && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-96">
                        <h2 className="font-bold mb-4 text-lg">Nova Despesa</h2>

                        {/* Descrição */}
                        <input
                            placeholder="Descrição"
                            className="w-full border p-2 mb-3 rounded"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                        />

                        {/* Valor */}
                        <input
                            type="number"
                            placeholder="Valor"
                            className="w-full border p-2 mb-3 rounded"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                        />

                        {/* Categoria */}
                        <select
                            className="w-full border p-2 mb-3 rounded"
                            value={categoriaId}
                            onChange={(e) => setCategoriaId(e.target.value)}
                        >
                            <option value="">Selecione a categoria</option>
                            {categorias.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nome}
                                </option>
                            ))}
                        </select>

                        {/* Tipo da despesa */}
                        <select
                            className="w-full border p-2 mb-3 rounded"
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                        >
                            <option value="normal">Despesa Normal</option>
                            <option value="fixa">Despesa Fixa</option>
                        </select>

                        {/* Parcelado */}
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                checked={parcelado}
                                onChange={(e) => setParcelado(e.target.checked)}
                            />
                            <label>Parcelado</label>
                        </div>

                        {parcelado && (
                            <input
                                type="number"
                                placeholder="Número de parcelas"
                                className="w-full border p-2 mb-3 rounded"
                                value={parcelas}
                                onChange={(e) =>
                                    setParcelas(Number(e.target.value))
                                }
                            />
                        )}

                        <button
                            onClick={salvarDespesa}
                            className="w-full bg-purple-600 text-white py-2 rounded mt-2"
                        >
                            Salvar
                        </button>

                        <button
                            onClick={() => setModalDespesa(false)}
                            className="w-full mt-2 text-gray-500"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Card */}
            {modalCard && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded w-96">
                        <h2 className="font-bold mb-4">Novo Cartão</h2>

                        <input
                            placeholder="Nome"
                            className="w-full border p-2 mb-2"
                            value={nomeCard}
                            onChange={(e) => setNomeCard(e.target.value)}
                        />

                        <button
                            onClick={criarCard}
                            className="w-full bg-purple-600 text-white py-2 rounded"
                        >
                            Criar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Categoria */}
            {modalCategoria && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded w-96">
                        <h2 className="font-bold mb-4">Nova Categoria</h2>

                        <input
                            placeholder="Nome"
                            className="w-full border p-2 mb-2"
                            value={nomeCategoria}
                            onChange={(e) => setNomeCategoria(e.target.value)}
                        />

                        <select
                            className="w-full border p-2 mb-2"
                            value={tipoCategoria}
                            onChange={(e) => setTipoCategoria(e.target.value)}
                        >
                            <option value="normal">Normal</option>
                            <option value="fixa">Fixa</option>
                        </select>

                        <button
                            onClick={criarCategoria}
                            className="w-full bg-purple-600 text-white py-2 rounded"
                        >
                            Criar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
