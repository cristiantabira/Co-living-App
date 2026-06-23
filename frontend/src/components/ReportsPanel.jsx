import React, { useState } from "react";
import API from "../api/axios";

const ReportsPanel = () => {
    // Setăm luna curentă ca default
    const [selectedPeriod, setSelectedPeriod] = useState("2026-06");
    const [loading, setLoading] = useState(false);

    // Lista lunilor pentru dropdown
    const periods = [
        { value: "2026-06", label: "Iunie 2026" },
        { value: "2026-05", label: "Mai 2026" },
        { value: "2026-04", label: "Aprilie 2026" },
        { value: "2026-03", label: "Martie 2026" },
        { value: "2026-02", label: "Februarie 2026" },
        { value: "2026-01", label: "Ianuarie 2026" },
    ];

    const handleDownload = async () => {
        const [year, month] = selectedPeriod.split("-");

        try {
            setLoading(true);

            // Apelăm endpoint-ul tău din backend
            // IMPORTANT: responseType 'blob' este esențial pentru descărcarea de fișiere PDF!
            const response = await API.get(
                `/expenses/report/monthly?year=${year}&month=${month}`,
                {
                    responseType: "blob",
                },
            );

            // Creăm un link temporar în browser pentru a forța descărcarea
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `Raport_Cheltuieli_${month}_${year}.pdf`,
            );
            document.body.appendChild(link);
            link.click();

            // Curățăm memoria browserului după descărcare
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Eroare la descărcare PDF:", error);
            alert(
                "Eroare: Nu s-a putut genera raportul. Verifică dacă ai cheltuieli în această lună.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "20px",
                marginBottom: "24px",
            }}
        >
            <div style={{ marginBottom: "20px" }}>
                <h3 style={{ margin: 0, color: "#1f2937" }}>
                    📄 Rapoarte Lunare
                </h3>
                <p
                    style={{
                        margin: "8px 0 0 0",
                        fontSize: "14px",
                        color: "#6b7280",
                    }}
                >
                    Selectează luna pentru a descărca situația cheltuielilor
                    apartamentului.
                </p>
            </div>

            <div
                style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                    flexWrap: "wrap",
                }}
            >
                <div style={{ flex: 1, minWidth: "200px" }}>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: "6px",
                            border: "1px solid #d1d5db",
                            fontSize: "15px",
                            backgroundColor: "#f9fafb",
                            color: "#374151",
                            cursor: "pointer",
                        }}
                    >
                        {periods.map((p) => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={loading}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        transition: "all 0.2s ease",
                        opacity: loading ? 0.7 : 1,
                        whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) =>
                        !loading && (e.target.style.backgroundColor = "#1d4ed8")
                    }
                    onMouseLeave={(e) =>
                        !loading && (e.target.style.backgroundColor = "#3b82f6")
                    }
                >
                    {loading ? "⏳ Se generează..." : "📥 Descarcă PDF"}
                </button>
            </div>
        </div>
    );
};

export default ReportsPanel;
