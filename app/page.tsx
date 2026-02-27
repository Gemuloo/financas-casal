"use client";

import { useEffect, useState } from "react";
import { getCards } from "@/services/cards";
import { getCategories } from "@/services/categories";
import { getExpenses, createExpense, deleteExpense } from "@/services/expenses";
import { formatCurrency } from "@/utils/currency";

export default function Home() {
    const [cards, setCards] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [month, setMonth] = useState(2);
    const [year, setYear] = useState(2026);

    const [form, setForm] = useState({
        description: "",
        amount: "",
        card_id: "",
        category_id: "",
        is_fixed: false,
        is_installment: false,
        installment_total: 1,
    });

    async function load() {
        setCards(await getCards());
        setCategories(await getCategories());
        setExpenses(await getExpenses(month, year));
    }

    useEffect(() => {
        load();
    }, [month, year]);

    async function handleSubmit() {
        const amount = Number(form.amount);

        if (form.is_installment) {
            for (let i = 1; i <= form.installment_total; i++) {
                await createExpense({
                    ...form,
                    amount,
                    month: month + (i - 1),
                    year,
                    installment_current: i,
                });
            }
        } else {
            await createExpense({
                ...form,
                amount,
                month,
                year,
            });
        }

        setForm({
            description: "",
            amount: "",
            card_id: "",
            category_id: "",
            is_fixed: false,
            is_installment: false,
            installment_total: 1,
        });

        load();
    }

    const total = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

    return (
        <div className="p-10 max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Finance App 2026</h1>

            {/* RESUMO */}
            <div className="text-xl font-bold">
                Total: {formatCurrency(total)}
            </div>

            {/* FORM */}
            <div className="space-y-3 border p-4 rounded-lg">
                <input
                    placeholder="Descrição"
                    value={form.description}
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                    className="border p-2 w-full"
                />

                <input
                    type="number"
                    placeholder="Valor"
                    value={form.amount}
                    onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                    }
                    className="border p-2 w-full"
                />

                <select
                    onChange={(e) =>
                        setForm({ ...form, card_id: e.target.value })
                    }
                    className="border p-2 w-full"
                >
                    <option>Selecione Cartão</option>
                    {cards.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <select
                    onChange={(e) =>
                        setForm({ ...form, category_id: e.target.value })
                    }
                    className="border p-2 w-full"
                >
                    <option>Selecione Categoria</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <label>
                    <input
                        type="checkbox"
                        checked={form.is_installment}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                is_installment: e.target.checked,
                            })
                        }
                    />
                    Parcelado?
                </label>

                {form.is_installment && (
                    <input
                        type="number"
                        placeholder="Nº Parcelas"
                        value={form.installment_total}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                installment_total: Number(e.target.value),
                            })
                        }
                        className="border p-2 w-full"
                    />
                )}

                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Salvar
                </button>
            </div>

            {/* LISTA */}
            <div className="space-y-2">
                {expenses.map((e) => (
                    <div
                        key={e.id}
                        className="flex justify-between border p-3 rounded"
                    >
                        <div>
                            <div className="font-bold">{e.description}</div>
                            <div className="text-sm text-gray-500">
                                {e.cards?.name} • {e.categories?.name}
                            </div>
                        </div>

                        <div className="flex gap-3 items-center">
                            <div>{formatCurrency(Number(e.amount))}</div>
                            <button
                                onClick={() => {
                                    deleteExpense(e.id);
                                    load();
                                }}
                                className="text-red-500"
                            >
                                X
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
