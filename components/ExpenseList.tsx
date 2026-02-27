import { formatCurrency } from "@/utils/format";

export default function ExpenseList({ expenses, onDelete }: any) {
    if (!expenses.length) {
        return (
            <div className="border-2 border-dashed border-slate-200 rounded-[2rem] min-h-[350px] flex items-center justify-center bg-white/50">
                <p className="text-slate-300 font-bold italic uppercase tracking-widest text-xs opacity-50">
                    Área de listagem de despesas...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {expenses.map((e: any) => (
                <div
                    key={e.id}
                    className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-slate-100"
                >
                    <div>
                        <p className="font-bold text-slate-700">
                            {e.description}
                        </p>
                        <p className="text-xs text-slate-400">
                            {e.cards?.name} • {e.categories?.name}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="font-black text-slate-800">
                            {formatCurrency(Number(e.amount))}
                        </span>

                        <button
                            onClick={() => onDelete(e.id)}
                            className="text-red-400 hover:text-red-600"
                        >
                            <i className="fas fa-trash-alt text-sm"></i>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
