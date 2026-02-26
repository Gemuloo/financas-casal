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

const nomesMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
];

export default function Home() {
    const hoje = new Date();

    const [mes, setMes] = useState(hoje.getMonth() + 1);
    const [ano, setAno] = useState(hoje.getFullYear());

    const [cards, setCards] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [despesas, setDespesas] = useState<any[]>([]);

    const [cardSelecionado, setCardSelecionado] = useState<string | null>(null);
    const [modoResumo, setModoResumo] = useState(false);

    const [modalDespesa, setModalDespesa] = useState(false);
    const [modalCard, setModalCard] = useState(false);
    const [modalCategoria, setModalCategoria] = useState(false);

    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [cardIdModal, setCardIdModal] = useState("");
    const [tipo, setTipo] = useState("normal");
    const [parcelado, setParcelado] = useState(false);
    const [parcelas, setParcelas] = useState(1);

    const [nomeCard, setNomeCard] = useState("");
    const [nomeCategoria, setNomeCategoria] = useState("");
    const [tipoCategoria, setTipoCategoria] = useState("normal");

    useEffect(() => {
        carregar();
    }, []);

    async function carregar() {
        const { data: c } = await supabase.from("cards").select("*");
        const { data: cat } = await supabase.from("categorias").select("*");
        const { data: d } = await supabase.from("despesas").select("*");

        setCards(c || []);
        setCategorias(cat || []);
        setDespesas(d || []);
    }

    async function criarCard() {
        if (!nomeCard) return;
        await supabase.from("cards").insert({ nome: nomeCard });
        setNomeCard("");
        setModalCard(false);
        carregar();
    }

    async function criarCategoria() {
        if (!nomeCategoria) return;
        await supabase.from("categorias").insert({
            nome: nomeCategoria,
            tipo: tipoCategoria,
        });
        setNomeCategoria("");
        setModalCategoria(false);
        carregar();
    }

    async function salvarDespesa() {
        if (!cardIdModal || !categoriaId) {
            alert("Selecione cartão e categoria");
            return;
        }

        const valorNumero = parseFloat(valor);
        const grupo = uuidv4();

        if (parcelado && parcelas > 1) {
            const valorParcela = valorNumero / parcelas;

            for (let i = 0; i < parcelas; i++) {
                const novaData = new Date(ano, mes - 1 + i, 1);

                await supabase.from("despesas").insert({
                    descricao,
                    valor: valorParcela,
                    categoria_id: categoriaId,
                    card_id: cardIdModal,
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
                card_id: cardIdModal,
                tipo,
                parcelado: false,
                mes,
                ano,
                data: new Date(),
            });
        }

        setModalDespesa(false);
        carregar();
    }

    // 🔥 FILTROS

    const despesasMes = despesas.filter(
        (d) =>
            d.mes === mes &&
            d.ano === ano &&
            (modoResumo ? true : d.card_id === cardSelecionado),
    );

    const totalMes = despesasMes.reduce((acc, d) => acc + Number(d.valor), 0);

    // 📊 DASHBOARD ANUAL (SOMA TODOS OS CARTÕES)

    const resumoAnual = Array.from({ length: 12 }, (_, i) => {
        const total = despesas
            .filter((d) => d.mes === i + 1 && d.ano === ano)
            .reduce((acc, d) => acc + Number(d.valor), 0);

        return { mes: nomesMeses[i], total };
    });

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className="w-64 bg-purple-800 text-white p-6">
                <h2 className="font-bold mb-4">Cartões</h2>

                {cards.map((card) => (
                    <div
                        key={card.id}
                        onClick={() => {
                            setCardSelecionado(card.id);
                            setModoResumo(false);
                        }}
                        className="cursor-pointer p-2 bg-purple-700 rounded mb-2"
                    >
                        {card.nome}
                    </div>
                ))}

                <button
                    onClick={() => setModoResumo(true)}
                    className="mt-4 w-full bg-white text-purple-800 p-2 rounded"
                >
                    📊 Resumo Geral
                </button>

                <button
                    onClick={() => setModalCard(true)}
                    className="mt-2 w-full bg-white text-purple-800 p-2 rounded"
                >
                    + Cartão
                </button>

                <button
                    onClick={() => setModalCategoria(true)}
                    className="mt-2 w-full bg-white text-purple-800 p-2 rounded"
                >
                    + Categoria
                </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 p-6">
                {!modoResumo && cardSelecionado && (
                    <>
                        <h2 className="text-xl font-bold mb-4">
                            {cards.find((c) => c.id === cardSelecionado)?.nome}
                        </h2>

                        <div className="mb-4 font-bold">
                            Total do mês: R$ {totalMes.toFixed(2)}
                        </div>

                        {despesasMes.map((d) => (
                            <div
                                key={d.id}
                                className="bg-white p-3 mb-2 rounded shadow"
                            >
                                {d.descricao} - R$ {Number(d.valor).toFixed(2)}
                            </div>
                        ))}
                    </>
                )}

                {modoResumo && (
                    <div className="bg-white p-6 rounded shadow h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={resumoAnual}>
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total" fill="#7c3aed" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Botão flutuante */}
            <button
                onClick={() => setModalDespesa(true)}
                className="fixed bottom-6 right-6 bg-purple-600 text-white w-16 h-16 rounded-full text-3xl"
            >
                +
            </button>
        </div>
    );
}
