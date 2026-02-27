export function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

export function adjustMonthYear(month: number, year: number) {
    let m = month;
    let y = year;

    while (m > 12) {
        m -= 12;
        y += 1;
    }

    return { month: m, year: y };
}
