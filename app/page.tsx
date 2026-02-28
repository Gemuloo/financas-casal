"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
    // --- ESTADOS DE INTERFACE E FILTROS ---
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
    const [anoSelecionado, setAnoSelecionado] = useState(
        new Date().getFullYear(),
    );
    const [cartaoFiltro, setCartaoFiltro] = useState<string | null>(null);
    const [filtroSomenteParcelados, setFiltroSomenteParcelados] =
        useState(false);

    // --- ESTADOS DE DADOS ---
    const [cartoes, setCartoes] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [despesas, setDespesas] = useState<any[]>([]);

    // --- ESTADOS DOS FORMULÁRIOS ---
    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [cartaoId, setCartaoId] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [isParcelado, setIsParcelado] = useState(false);
    const [qtdParcelas, setQtdParcelas] = useState("1");
    const [isFixa, setIsFixa] = useState(false);
    const [nomeNovoCartao, setNomeNovoCartao] = useState("");
    const [nomeNovaCategoria, setNomeNovaCategoria] = useState("");

    // --- CARREGAMENTO INICIAL E SINCRONIZAÇÃO ---
    useEffect(() => {
        fetchCartoes();
        fetchCategorias();
    }, []);

    useEffect(() => {
        fetchDespesas();
    }, [mesSelecionado, anoSelecionado, cartaoFiltro, filtroSomenteParcelados]);

    async function fetchCartoes() {
        const { data } = await supabase
            .from("cartoes")
            .select("*")
            .order("nome");
        if (data) setCartoes(data);
    }

    async function fetchCategorias() {
        const { data } = await supabase
            .from("categorias")
            .select("*")
            .order("nome");
        if (data) setCategorias(data);
    }

    async function fetchDespesas() {
        const firstDay = new Date(
            anoSelecionado,
            mesSelecionado,
            1,
        ).toISOString();
        const lastDay = new Date(
            anoSelecionado,
            mesSelecionado + 1,
            0,
            23,
            59,
            59,
        ).toISOString();

        let query = supabase
            .from("despesas")
            .select("*, cartoes(nome), categorias(nome)")
            .gte("data", firstDay)
            .lte("data", lastDay);

        if (cartaoFiltro) query = query.eq("cartao_id", cartaoFiltro);
        if (filtroSomenteParcelados) query = query.eq("is_parcelado", true);

        const { data } = await query.order("data", { ascending: false });
        if (data) setDespesas(data);
    }

    // --- LÓGICA DE RESUMO DINÂMICO (Instruções Salvas) ---
    const totalNaoParcelados = despesas
        .filter((d) => !d.is_parcelado)
        .reduce((acc, curr) => acc + Number(curr.valor), 0);
    const totalParcelados = despesas
        .filter((d) => d.is_parcelado)
        .reduce((acc, curr) => acc + Number(curr.valor), 0);
    const somaTotal = totalNaoParcelados + totalParcelados;

    // Alteração dinâmica dos títulos conforme o tipo de visualização
    const label1 = cartaoFiltro ? "Contas não Parceladas" : "Saldo em Conta";
    const label2 = cartaoFiltro ? "Contas Parceladas" : "Faturas";
    const label3 = cartaoFiltro ? "Somatório Total" : "Balanço do Mês";

    // --- FUNÇÕES DE CRIAÇÃO E EXCLUSÃO ---
    async function handleConfirmarLancamento() {
        if (!descricao || !valor || !cartaoId)
            return alert("Preencha descrição, valor e selecione um cartão!");
        const { error } = await supabase.from("despesas").insert([
            {
                descricao,
                valor: parseFloat(valor),
                cartao_id: cartaoId,
                categoria_id: categoriaId || null,
                is_fixa: isFixa,
                is_parcelado: isParcelado,
                parcelas: isParcelado ? parseInt(qtdParcelas) : 1,
            },
        ]);
        if (!error) {
            setDescricao("");
            setValor("");
            setActiveModal(null);
            fetchDespesas();
        }
    }

    async function handleSalvarCartao() {
        if (!nomeNovoCartao) return;
        await supabase.from("cartoes").insert([{ nome: nomeNovoCartao }]);
        setNomeNovoCartao("");
        setActiveModal(null);
        fetchCartoes();
    }

    async function handleSalvarCategoria() {
        if (!nomeNovaCategoria) return;
        await supabase.from("categorias").insert([{ nome: nomeNovaCategoria }]);
        setNomeNovaCategoria("");
        fetchCategorias();
    }

    async function handleExcluir(tabela: string, id: string) {
        if (!confirm("Tem certeza que deseja excluir?")) return;
        const { error } = await supabase.from(tabela).delete().eq("id", id);
        if (!error) {
            fetchCartoes();
            fetchCategorias();
            fetchDespesas();
        }
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
            {/* SIDEBAR */}
            <aside className="hidden md:flex flex-col w-[260px] bg-white border-r h-full flex-shrink-0">
                <div className="p-6 border-b text-center">
                    <h2 className="font-black text-slate-800 text-lg uppercase tracking-tighter">
                        Finanças
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">
                    <button
                        onClick={() => setCartaoFiltro(null)}
                        className={`w-full text-left p-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${!cartaoFiltro ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-500"}`}
                    >
                        <i className="fas fa-th-large mr-2"></i> Todos
                    </button>
                    {cartoes.map((c) => (
                        <div key={c.id} className="group relative">
                            <button
                                onClick={() => setCartaoFiltro(c.id)}
                                className={`w-full text-left p-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${cartaoFiltro === c.id ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-500 hover:bg-blue-50"}`}
                            >
                                <i className="fas fa-credit-card mr-2"></i>{" "}
                                {c.nome}
                            </button>
                            <button
                                onClick={() => handleExcluir("cartoes", c.id)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 p-2 hover:text-red-600 transition-all"
                            >
                                <i className="fas fa-trash-alt text-[10px]"></i>
                            </button>
                        </div>
                    ))}
                </div>
            </aside>

            <main className="flex-1 h-full relative overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scroll pb-[160px]">
                    {/* HEADER / FILTROS DATA */}
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="flex items-center gap-2">
                            <select
                                value={mesSelecionado}
                                onChange={(e) =>
                                    setMesSelecionado(Number(e.target.value))
                                }
                                className="bg-white border px-6 py-2 rounded-full font-black text-[10px] uppercase text-slate-700 outline-none shadow-sm cursor-pointer border-slate-200"
                            >
                                {[
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
                                ].map((m, i) => (
                                    <option key={i} value={i}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={anoSelecionado}
                                onChange={(e) =>
                                    setAnoSelecionado(Number(e.target.value))
                                }
                                className="bg-white border px-6 py-2 rounded-full font-black text-[10px] uppercase text-slate-700 outline-none shadow-sm cursor-pointer border-slate-200"
                            >
                                {[2025, 2026, 2027].map((a) => (
                                    <option key={a} value={a}>
                                        {a}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* CARDS DE RESUMO */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
                        <div className="bg-white p-8 rounded-[1.2rem] shadow-sm border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">
                                {label1}
                            </p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tighter">
                                {totalNaoParcelados.toLocaleString("pt-br", {
                                    style: "currency",
                                    currency: "BRL",
                                })}
                            </h3>
                        </div>
                        <div className="bg-white p-8 rounded-[1.2rem] shadow-sm border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">
                                {label2}
                            </p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tighter">
                                {totalParcelados.toLocaleString("pt-br", {
                                    style: "currency",
                                    currency: "BRL",
                                })}
                            </h3>
                        </div>
                        <div className="bg-white p-8 rounded-[1.2rem] shadow-sm border border-blue-100 bg-blue-50/20">
                            <p className="text-[9px] font-black text-blue-600 uppercase mb-1 tracking-widest">
                                {label3}
                            </p>
                            <h3 className="text-3xl font-black text-blue-700 tracking-tighter">
                                {somaTotal.toLocaleString("pt-br", {
                                    style: "currency",
                                    currency: "BRL",
                                })}
                            </h3>
                        </div>
                    </section>

                    {/* BOTÃO SOMENTE PARCELADOS */}
                    <div className="flex justify-center mb-8">
                        <button
                            onClick={() =>
                                setFiltroSomenteParcelados(
                                    !filtroSomenteParcelados,
                                )
                            }
                            className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shadow-lg ${filtroSomenteParcelados ? "bg-orange-500 text-white" : "bg-blue-600 text-white"}`}
                        >
                            {filtroSomenteParcelados
                                ? "Ver Todos os Lançamentos"
                                : "Somente Contas Parceladas"}
                        </button>
                    </div>

                    {/* TABELA DE LISTAGEM */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="p-5">Descrição</th>
                                    <th className="p-5">Cartão/Banco</th>
                                    <th className="p-5">Valor</th>
                                    <th className="p-5 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-bold text-slate-700">
                                {despesas.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="p-10 text-center text-slate-300 italic"
                                        >
                                            Nenhum lançamento encontrado para
                                            este período.
                                        </td>
                                    </tr>
                                ) : (
                                    despesas.map((d) => (
                                        <tr
                                            key={d.id}
                                            className="border-t border-slate-50 hover:bg-slate-50/50 transition-all"
                                        >
                                            <td className="p-5">
                                                {d.descricao}{" "}
                                                {d.is_parcelado && (
                                                    <span className="text-[8px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded ml-2 font-black uppercase">
                                                        Parcelado
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-5 text-slate-400 text-[10px] uppercase">
                                                {d.cartoes?.nome}
                                            </td>
                                            <td className="p-5">
                                                {Number(d.valor).toLocaleString(
                                                    "pt-br",
                                                    {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    },
                                                )}
                                            </td>
                                            <td className="p-5 text-center">
                                                <button
                                                    onClick={() =>
                                                        handleExcluir(
                                                            "despesas",
                                                            d.id,
                                                        )
                                                    }
                                                    className="text-red-200 hover:text-red-500 transition-colors"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CONTROLES FLUTUANTES (FOOTER) */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-6 z-50">
                    <button
                        onClick={() => setActiveModal("resumo")}
                        className="bg-white w-20 h-20 rounded-[1.2rem] shadow-2xl border border-slate-50 flex flex-col items-center justify-center hover:scale-105 transition-all"
                    >
                        <i className="fas fa-chart-pie text-slate-300 text-xl"></i>
                        <span className="text-[9px] font-black mt-1 text-slate-400 uppercase">
                            Resumo
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveModal("lancar")}
                        className="bg-blue-600 w-28 h-28 rounded-[1.8rem] shadow-2xl border-8 border-white flex flex-col items-center justify-center -translate-y-4 hover:scale-105 active:scale-95 transition-all"
                    >
                        <i className="fas fa-plus text-white text-4xl"></i>
                        <span className="text-[10px] font-black mt-1 text-white uppercase tracking-widest">
                            Lançar
                        </span>
                    </button>

                    <div className="relative group">
                        <button className="bg-white w-20 h-20 rounded-[1.2rem] shadow-2xl border border-slate-50 flex flex-col items-center justify-center hover:scale-105 transition-all">
                            <i className="fas fa-plus-square text-slate-300 text-xl"></i>
                            <span className="text-[9px] font-black mt-1 text-slate-400 uppercase">
                                Criar
                            </span>
                        </button>
                        <div className="absolute bottom-24 right-0 w-48 bg-white rounded-[1.2rem] shadow-2xl border p-2 hidden group-hover:block transition-all">
                            <button
                                onClick={() => setActiveModal("cartao")}
                                className="w-full text-left p-3 hover:bg-blue-50 rounded-xl text-[9px] font-black uppercase flex items-center gap-3 text-slate-600 transition-colors"
                            >
                                <i className="fas fa-credit-card text-blue-500"></i>{" "}
                                Criar Cartão
                            </button>
                            <button
                                onClick={() => setActiveModal("categoria")}
                                className="w-full text-left p-3 hover:bg-blue-50 rounded-xl text-[9px] font-black uppercase flex items-center gap-3 text-slate-600 transition-colors"
                            >
                                <i className="fas fa-tags text-emerald-500"></i>{" "}
                                Criar Categoria
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- MODAIS --- */}

            {/* MODAL LANÇAMENTO */}
            {activeModal === "lancar" && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-[400px] rounded-[2rem] p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-slate-800 text-xl uppercase tracking-tighter">
                                Novo Lançamento
                            </h3>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Descrição"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                className="w-full bg-slate-50 border p-4 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-300"
                            />
                            <input
                                type="number"
                                placeholder="0,00"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                className="w-full bg-slate-50 border p-4 rounded-xl font-black text-blue-600 text-xl outline-none"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={cartaoId}
                                    onChange={(e) =>
                                        setCartaoId(e.target.value)
                                    }
                                    className="bg-slate-50 border p-3 rounded-xl font-bold text-[10px] uppercase"
                                >
                                    <option value="">Selecione Cartão</option>
                                    {cartoes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nome}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={categoriaId}
                                    onChange={(e) =>
                                        setCategoriaId(e.target.value)
                                    }
                                    className="bg-slate-50 border p-3 rounded-xl font-bold text-[10px] uppercase"
                                >
                                    <option value="">Categoria</option>
                                    {categorias.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2 p-1">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                                    <input
                                        type="checkbox"
                                        checked={isParcelado}
                                        onChange={(e) =>
                                            setIsParcelado(e.target.checked)
                                        }
                                        className="w-4 h-4 accent-blue-600"
                                    />{" "}
                                    Conta Parcelada?
                                </label>
                                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                                    <input
                                        type="checkbox"
                                        checked={isFixa}
                                        onChange={(e) =>
                                            setIsFixa(e.target.checked)
                                        }
                                        className="w-4 h-4 accent-emerald-600"
                                    />{" "}
                                    Despesa Fixa?
                                </label>
                            </div>
                            {isParcelado && (
                                <input
                                    type="number"
                                    placeholder="Nº de parcelas"
                                    value={qtdParcelas}
                                    onChange={(e) =>
                                        setQtdParcelas(e.target.value)
                                    }
                                    className="w-full bg-blue-50 border border-blue-100 p-3 rounded-xl text-xs font-bold"
                                />
                            )}
                            <button
                                onClick={handleConfirmarLancamento}
                                className="w-full bg-blue-600 text-white font-black py-4 rounded-xl mt-4 uppercase tracking-widest text-[10px] shadow-lg shadow-blue-100"
                            >
                                Confirmar Lançamento
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CARTÃO */}
            {activeModal === "cartao" && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-[400px] rounded-[2rem] p-8 shadow-2xl">
                        <h3 className="font-black text-slate-800 text-xl uppercase mb-6 tracking-tighter">
                            Novo Cartão / Banco
                        </h3>
                        <input
                            type="text"
                            placeholder="Ex: Nubank, Inter..."
                            value={nomeNovoCartao}
                            onChange={(e) => setNomeNovoCartao(e.target.value)}
                            className="w-full bg-slate-50 border p-4 rounded-xl font-bold text-slate-700 mb-4 outline-none"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="flex-1 bg-slate-100 text-slate-500 font-black py-4 rounded-xl text-[10px] uppercase"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSalvarCartao}
                                className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl text-[10px] uppercase shadow-lg shadow-blue-100"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CATEGORIA */}
            {activeModal === "categoria" && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-[400px] rounded-[2rem] p-8 shadow-2xl">
                        <h3 className="font-black text-slate-800 text-xl uppercase mb-6 tracking-tighter">
                            Nova Categoria
                        </h3>
                        <input
                            type="text"
                            placeholder="Ex: Alimentação, Lazer..."
                            value={nomeNovaCategoria}
                            onChange={(e) =>
                                setNomeNovaCategoria(e.target.value)
                            }
                            className="w-full bg-slate-50 border p-4 rounded-xl font-bold text-slate-700 mb-4 outline-none"
                        />
                        <button
                            onClick={handleSalvarCategoria}
                            className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl text-[10px] uppercase shadow-lg shadow-emerald-100"
                        >
                            Salvar Categoria
                        </button>
                        <div className="mt-6 space-y-2 max-h-[150px] overflow-y-auto custom-scroll pr-1">
                            {categorias.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-500 uppercase border border-slate-100 group"
                                >
                                    {cat.nome}
                                    <button
                                        onClick={() =>
                                            handleExcluir("categorias", cat.id)
                                        }
                                        className="text-red-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
