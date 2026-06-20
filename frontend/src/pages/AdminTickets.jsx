import React, { useEffect, useState } from "react";
import API from "../api/axios";

function AdminTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [complex, setComplex] = useState(null);

    const user = JSON.parse(localStorage.getItem("user")) || {};

    // 1. Verificare securitate
    if (user.role !== "ADMIN" && user.role !== "GOD") {
        return (
            <div style={{ padding: "40px", color: "red", textAlign: "center" }}>
                Nu ai permisiunea de a accesa această pagină.
            </div>
        );
    }

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const res = await API.get("/auth/me");
                const managedComplexes = res.data.ManagedComplexes;

                if (managedComplexes && managedComplexes.length > 0) {
                    const activeComplex = managedComplexes[0];
                    setComplex(activeComplex);
                    fetchTickets(activeComplex.id);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Eroare la inițializare admin:", err);
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchTickets = async (complexId) => {
        try {
            const { data } = await API.get(`/tickets/${complexId}`);
            setTickets(data.tickets || []);
        } catch (err) {
            console.error("Eroare la încărcarea tichetelor:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (ticketId) => {
        try {
            await API.patch(`/tickets/${ticketId}/assign`, {
                assignedToId: user.id,
            });
            alert("Tichet preluat!");
            fetchTickets(complex.id);
        } catch (err) {
            alert("Eroare: " + (err.response?.data?.message || err.message));
        }
    };

    const handleResolve = async (ticketId) => {
        try {
            await API.patch(`/tickets/${ticketId}/resolve`);
            alert("Tichet marcat ca rezolvat!");
            fetchTickets(complex.id);
        } catch (err) {
            alert("Eroare: " + (err.response?.data?.message || err.message));
        }
    };

    const handleCancel = async (ticketId) => {
        if (!window.confirm("Anulezi acest tichet?")) return;
        try {
            await API.patch(`/tickets/${ticketId}/cancel`);
            alert("Tichet anulat!");
            fetchTickets(complex.id);
        } catch (err) {
            alert("Eroare: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading)
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                Se încarcă...
            </div>
        );
    if (!complex)
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                Nu administrezi niciun complex.
            </div>
        );

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
            <header style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: "700" }}>
                    Mentenanță: {complex.name}
                </h1>
            </header>

            <div style={{ display: "grid", gap: "20px" }}>
                {tickets.map((t) => (
                    <div key={t.id} style={cardStyle}>
                        <h3>{t.title}</h3>
                        <p>{t.description}</p>
                        <small>
                            <strong>Status:</strong> {t.status}
                        </small>

                        <div
                            style={{
                                marginTop: "15px",
                                display: "flex",
                                gap: "10px",
                            }}
                        >
                            {t.status === "OPEN" && (
                                <button
                                    onClick={() => handleAssign(t.id)}
                                    style={btnBlue}
                                >
                                    🤝 Preluare
                                </button>
                            )}
                            {t.status === "IN_PROGRESS" && (
                                <button
                                    onClick={() => handleResolve(t.id)}
                                    style={btnGreen}
                                >
                                    ✅ Rezolvat
                                </button>
                            )}
                            {/* Buton Cancel conform diagramei UML */}
                            {(t.status === "OPEN" ||
                                t.status === "IN_PROGRESS") && (
                                <button
                                    onClick={() => handleCancel(t.id)}
                                    style={btnRed}
                                >
                                    ❌ Anulează
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const cardStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
};
const btnBlue = {
    padding: "8px 16px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
};
const btnGreen = {
    padding: "8px 16px",
    backgroundColor: "#059669",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
};
const btnRed = {
    padding: "8px 16px",
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
};

export default AdminTickets;
