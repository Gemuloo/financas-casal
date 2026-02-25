"use client";

export default function Sidebar({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 shadow-xl">
                <h2 className="text-2xl font-bold mb-6 tracking-wide">
                    💳 Cartões
                </h2>
                {children}
            </div>
        </div>
    );
}
