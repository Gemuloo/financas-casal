"use client";

interface Props {
    cards: any[];
    selecionarCard: (id: string) => void;
    abrirResumo: () => void;
    abrirModalCartao: () => void;
    abrirModalCategoria: () => void;
}

export default function Sidebar({
    cards,
    selecionarCard,
    abrirResumo,
    abrirModalCartao,
    abrirModalCategoria,
}: Props) {
    return (
        <div className="w-64 bg-purple-800 text-white p-6 min-h-screen">
            <h2 className="font-bold mb-4 text-lg">Cartões</h2>

            {cards.map((card) => (
                <div
                    key={card.id}
                    onClick={() => selecionarCard(card.id)}
                    className="cursor-pointer p-2 bg-purple-700 rounded mb-2 hover:bg-purple-600 transition"
                >
                    {card.nome}
                </div>
            ))}

            <button
                onClick={abrirResumo}
                className="mt-6 w-full bg-white text-purple-800 p-2 rounded font-semibold"
            >
                📊 Resumo Geral
            </button>

            <button
                onClick={abrirModalCartao}
                className="mt-2 w-full bg-white text-purple-800 p-2 rounded"
            >
                + Cartão
            </button>

            <button
                onClick={abrirModalCategoria}
                className="mt-2 w-full bg-white text-purple-800 p-2 rounded"
            >
                + Categoria
            </button>
        </div>
    );
}
