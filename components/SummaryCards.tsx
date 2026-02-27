import { formatCurrency } from "@/utils/format";

export default function SummaryCards({ expenses }: any) {
    const nonInstallment = expenses
        .filter((e: any) => !e.is_installment)
        .reduce((a: number, b: any) => a + Number(b.amount), 0);

    const installment = expenses
        .filter((e: any) => e.is_installment)
        .reduce((a: number, b: any) => a + Number(b.amount), 0);

    const total = nonInstallment + installment;

    return (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
            <Card title="Contas não Parceladas" value={nonInstallment} />
            <Card title="Contas Parceladas" value={installment} />
            <Card title="Valor Total" value={total} highlight />
        </section>
    );
}

function Card({ title, value, highlight }: any) {
    return (
        <div
            className={`bg-white p-8 rounded-[1.2rem] shadow-sm border 
      ${highlight ? "border-blue-100 bg-blue-50/20" : "border-slate-100"}`}
        >
            <p
                className={`text-[9px] font-black uppercase mb-1 tracking-widest 
        ${highlight ? "text-blue-600" : "text-slate-400"}`}
            >
                {title}
            </p>
            <h3
                className={`text-3xl font-black tracking-tighter 
        ${highlight ? "text-blue-700" : "text-slate-800"}`}
            >
                {formatCurrency(value)}
            </h3>
        </div>
    );
}
