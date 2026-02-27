"use client";

interface Props {
    aberto: boolean;
    fechar: () => void;
    nomeCard: string;
    setNomeCard: (valor: string) => void;
    salvar: () => void;
}

export default function ModalCartao({
    aberto,
    fechar,
    nomeCard,
    setNomeCard,
    salvar,
}: Props) {
    if (!aberto) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-[90%] max-w-md p-6 animate-fadeIn">
                <h2 className="text-xl font-bold mb-4">Novo Cartão</h2>

                <input
                    type="text"
                    placeholder="Nome do cartão"
                    value={nomeCard}
                    onChange={(e) => setNomeCard(e.target.value)}
                    className="w-full border p-3 rounded mb-4"
                />

                <div className="flex justify-end gap-3">
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
