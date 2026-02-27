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

    useEffect(() => {
        carregar();
    }, []);

    useEffect(() => {
        if (cards.length > 0 && !cardSelecionado) {
            setCardSelecionado(cards[0].id);
        }
    }, [cards]);

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
        setDescricao("");
        setValor("");
        setParcelado(false);
        setParcelas(1);
        carregar();
    }

    // 🔥 Filtro mês + ano + cartão
    const despesasMes = despesas.filter((d) => {
        const mesmoMes = d.mes === mes;
        const mesmoAno = d.ano === ano;

        if (!mesmoMes || !mesmoAno) return false;

        if (modoResumo) return true;

        return d.card_id === cardSelecionado;
    });

    const totalMes = despesasMes.reduce((acc, d) => acc + Number(d.valor), 0);

    // 🔥 Resumo geral anual correto
    const resumoAnual = Array.from({ length: 12 }, (_, i) => {
        const total = despesas
            .filter((d) => d.mes === i + 1 && d.ano === ano)
            .reduce((acc, d) => {
                return acc + Number(d.valor);
            }, 0);

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

            {/* Modal Cartão */}
            {modalCard && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-80">
                        <h2 className="font-bold mb-4">Novo Cartão</h2>
                        <input
                            placeholder="Nome do cartão"
                            className="w-full border p-2 mb-3 rounded"
                            value={nomeCard}
                            onChange={(e) => setNomeCard(e.target.value)}
                        />
                        <button
                            onClick={criarCard}
                            className="w-full bg-purple-600 text-white py-2 rounded"
                        >
                            Salvar
                        </button>
                        <button
                            onClick={() => setModalCard(false)}
                            className="w-full mt-2 text-gray-500"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Categoria */}
            {modalCategoria && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-80">
                        <h2 className="font-bold mb-4">Nova Categoria</h2>
                        <input
                            placeholder="Nome da categoria"
                            className="w-full border p-2 mb-3 rounded"
                            value={nomeCategoria}
                            onChange={(e) => setNomeCategoria(e.target.value)}
                        />
                        <button
                            onClick={criarCategoria}
                            className="w-full bg-purple-600 text-white py-2 rounded"
                        >
                            Salvar
                        </button>
                        <button
                            onClick={() => setModalCategoria(false)}
                            className="w-full mt-2 text-gray-500"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Despesa */}
            {modalDespesa && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-96">
                        <h2 className="font-bold mb-4">Nova Despesa</h2>

                        <input
                            placeholder="Descrição"
                            className="w-full border p-2 mb-3 rounded"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                        />

                        <input
                            type="number"
                            placeholder="Valor"
                            className="w-full border p-2 mb-3 rounded"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                        />

                        <select
                            className="w-full border p-2 mb-3 rounded"
                            value={cardIdModal}
                            onChange={(e) => setCardIdModal(e.target.value)}
                        >
                            <option value="">Selecione o cartão</option>
                            {cards.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nome}
                                </option>
                            ))}
                        </select>

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

                        <select
                            className="w-full border p-2 mb-3 rounded"
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                        >
                            <option value="normal">Normal</option>
                            <option value="fixa">Fixa</option>
                        </select>

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
                            className="w-full bg-purple-600 text-white py-2 rounded"
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
        </div>
    );
}
