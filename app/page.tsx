"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import ModalCartao from "@/components/ModalCartao";
import ModalCategoria from "@/components/ModalCategoria";
import ModalDespesa from "@/components/ModalDespesa";

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
    const [modalCartao, setModalCartao] = useState(false);
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

    async function criarCartao() {
        if (!nomeCard) return;
        await supabase.from("cards").insert({ nome: nomeCard });
        setNomeCard("");
        setModalCartao(false);
        carregar();
    }

    async function criarCategoria() {
        if (!nomeCategoria) return;

        await supabase.from("categorias").insert({
            nome: nomeCategoria,
        });

        setNomeCategoria("");
        setModalCategoria(false);

        const { data } = await supabase.from("categorias").select("*");
        setCategorias(data || []);
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

    const despesasMes = despesas.filter((d) => {
        if (d.mes !== mes || d.ano !== ano) return false;
        if (modoResumo) return true;
        return d.card_id === cardSelecionado;
    });

    const totalMes = despesasMes.reduce((acc, d) => acc + Number(d.valor), 0);

    const resumoAnual = Array.from({ length: 12 }, (_, i) => {
        const total = despesas
            .filter((d) => d.mes === i + 1 && d.ano === ano)
            .reduce((acc, d) => acc + Number(d.valor), 0);

        return { mes: nomesMeses[i], total };
    });

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar
                cards={cards}
                selecionarCard={(id) => {
                    setCardSelecionado(id);
                    setModoResumo(false);
                }}
                abrirResumo={() => setModoResumo(true)}
                abrirModalCartao={() => setModalCartao(true)}
                abrirModalCategoria={() => setModalCategoria(true)}
            />

            <div className="flex-1 p-6">
                {/* Seletor mês/ano */}
                <div className="flex gap-4 mb-6 items-center">
                    <select
                        value={mes}
                        onChange={(e) => setMes(Number(e.target.value))}
                        className="border p-2 rounded"
                    >
                        {nomesMeses.map((nome, index) => (
                            <option key={index} value={index + 1}>
                                {nome}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        value={ano}
                        onChange={(e) => setAno(Number(e.target.value))}
                        className="border p-2 rounded w-28"
                    />
                </div>

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

                {modoResumo && <Dashboard resumoAnual={resumoAnual} />}
            </div>

            {/* Botão flutuante */}
            <button
                onClick={() => setModalDespesa(true)}
                className="fixed bottom-6 right-6 bg-purple-600 text-white w-16 h-16 rounded-full text-3xl shadow-lg"
            >
                +
            </button>

            {/* Modais */}
            <ModalCartao
                aberto={modalCartao}
                fechar={() => setModalCartao(false)}
                nomeCard={nomeCard}
                setNomeCard={setNomeCard}
                salvar={criarCartao}
            />

            <ModalCategoria
                aberto={modalCategoria}
                fechar={() => setModalCategoria(false)}
                nomeCategoria={nomeCategoria}
                setNomeCategoria={setNomeCategoria}
                salvar={criarCategoria}
            />

            <ModalDespesa
                aberto={modalDespesa}
                fechar={() => setModalDespesa(false)}
                salvar={salvarDespesa}
                cards={cards}
                categorias={categorias}
                descricao={descricao}
                setDescricao={setDescricao}
                valor={valor}
                setValor={setValor}
                categoriaId={categoriaId}
                setCategoriaId={setCategoriaId}
                cardId={cardIdModal}
                setCardId={setCardIdModal}
                tipo={tipo}
                setTipo={setTipo}
                parcelado={parcelado}
                setParcelado={setParcelado}
                parcelas={parcelas}
                setParcelas={setParcelas}
            />
        </div>
    );
}
