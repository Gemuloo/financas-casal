"use client";

interface Props {
    aberto: boolean;
    fechar: () => void;
    salvar: () => void;

    cards: any[];
    categorias: any[];

    descricao: string;
    setDescricao: (v: string) => void;

    valor: string;
    setValor: (v: string) => void;

    categoriaId: string;
    setCategoriaId: (v: string) => void;

    cardId: string;
    setCardId: (v: string) => void;

    tipo: string;
    setTipo: (v: string) => void;

    parcelado: boolean;
    setParcelado: (v: boolean) => void;

    parcelas: number;
    setParcelas: (v: number) => void;
}

export default function ModalDespesa({
    aberto,
    fechar,
    salvar,
    cards,
    categorias,
    descricao,
    setDescricao,
    valor,
    setValor,
    categoriaId,
    setCategoriaId,
    cardId,
    setCardId,
    tipo,
    setTipo,
    parcelado,
    setParcelado,
    parcelas,
    setParcelas,
}: Props) {
    if (!aberto) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-[95%] max-w-lg p-6 animate-fadeIn overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-bold mb-4">Nova Despesa</h2>

                {/* Descrição */}
                <input
                    type="text"
                    placeholder="Descrição"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="w-full border p-3 rounded mb-3"
                />

                {/* Valor */}
                <input
                    type="number"
                    placeholder="Valor"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full border p-3 rounded mb-3"
                />

                {/* Cartão */}
                <select
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    className="w-full border p-3 rounded mb-3"
                >
                    <option value="">Selecione o cartão</option>
                    {cards.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.nome}
                        </option>
                    ))}
                </select>

                {/* Categoria */}
                <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className="w-full border p-3 rounded mb-3"
                >
                    <option value="">Selecione a categoria</option>
                    {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.nome}
                        </option>
                    ))}
                </select>

                {/* Tipo */}
                <div className="flex gap-4 mb-3">
                    <button
                        onClick={() => setTipo("normal")}
                        className={`flex-1 p-3 rounded ${
                            tipo === "normal"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-200"
                        }`}
                    >
                        Normal
                    </button>

                    <button
                        onClick={() => setTipo("fixa")}
                        className={`flex-1 p-3 rounded ${
                            tipo === "fixa"
                                ? "bg-purple-600 text-white"
                                : "bg-gray-200"
                        }`}
                    >
                        Fixa
                    </button>
                </div>

                {/* Parcelamento */}
                <div className="mb-3">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={parcelado}
                            onChange={(e) => setParcelado(e.target.checked)}
                        />
                        Parcelado
                    </label>
                </div>

                {parcelado && (
                    <input
                        type="number"
                        min={2}
                        value={parcelas}
                        onChange={(e) => setParcelas(Number(e.target.value))}
                        className="w-full border p-3 rounded mb-3"
                        placeholder="Quantidade de parcelas"
                    />
                )}

                {/* Botões */}
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={fechar}
                        className="px-4 py-2 rounded bg-gray-200"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={salvar}
                        className="px-4 py-2 rounded bg-purple-600 text-white"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}
