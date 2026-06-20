import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function AddExpense() {
    const [description, setDescription] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [myAmount, setMyAmount] = useState(""); // Ce parte din total mă afectează pe mine
    const [roommates, setRoommates] = useState([]);
    const [selectedDebtors, setSelectedDebtors] = useState({});
    const [showCustomSplit, setShowCustomSplit] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoommates = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                setCurrentUser(user);

                const { data } = await API.get("/apartments/roommates");
                const others = data.filter((r) => r.id !== user.id);
                setRoommates(others);
                const initialDebtors = {};
                others.forEach((r) => {
                    initialDebtors[r.id] = { selected: true, amount: "" };
                });
                setSelectedDebtors(initialDebtors);
            } catch (err) {
                console.error("Eroare la încărcare colegi:", err);
            }
        };
        fetchRoommates();
    }, []);

    const handleCheckboxChange = (id) => {
        setSelectedDebtors({
            ...selectedDebtors,
            [id]: {
                ...selectedDebtors[id],
                selected: !selectedDebtors[id]?.selected,
            },
        });
    };

    const handleAmountChange = (id, value) => {
        setSelectedDebtors({
            ...selectedDebtors,
            [id]: { ...selectedDebtors[id], amount: value },
        });
    };

    const getSelectedCount = () =>
        Object.values(selectedDebtors).filter((d) => d?.selected).length;

    const getEqualSplitAmountPerPerson = () => {
        if (!totalAmount || (getSelectedCount() === 0 && !myAmount)) return 0;
        const total = parseFloat(totalAmount);
        const myPart = parseFloat(myAmount) || 0;
        const remainingForDebtors = total - myPart;
        const splitCount = getSelectedCount();

        if (splitCount === 0) return 0;
        return (remainingForDebtors / splitCount).toFixed(2);
    };

    const validateSplit = (debtorsData) => {
        const totalDebtors = debtorsData.reduce(
            (sum, d) => sum + parseFloat(d.amountOwed),
            0,
        );
        const myPart = parseFloat(myAmount) || 0;
        const totalExpected = parseFloat(totalAmount) || 0;
        const totalAllocated = totalDebtors + myPart;
        const remainingForDebtors = totalExpected - myPart;
        if (Math.abs(totalDebtors - remainingForDebtors) > 0.01) {
            alert(
                `Suma alocată (${totalAllocated.toFixed(2)}) nu egalează totalul (${totalExpected.toFixed(2)})`,
            );
            return false;
        }

        if (totalExpected === 0) {
            alert("Introdu o sumă totală mai mare decât 0");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let debtorsData;
        if (showCustomSplit) {
            debtorsData = Object.entries(selectedDebtors)
                .filter(([_, d]) => d?.selected)
                .map(([id, d]) => ({
                    userId: parseInt(id),
                    amountOwed: parseFloat(d?.amount || 0).toFixed(2),
                }));
        } else {
            // Modul egal: restul după ce scad suma mea se-mparte egal între debitori
            const myPart = parseFloat(myAmount) || 0;
            const remainingForDebtors = parseFloat(totalAmount) - myPart;
            const amountPerDebtor =
                getSelectedCount() > 0
                    ? (remainingForDebtors / getSelectedCount()).toFixed(2)
                    : "0.00";

            debtorsData = Object.entries(selectedDebtors)
                .filter(([_, d]) => d?.selected)
                .map(([id, _]) => ({
                    userId: parseInt(id),
                    amountOwed: amountPerDebtor,
                }));
        }

        if (!validateSplit(debtorsData)) return;

        try {
            await API.post("/expenses", {
                description,
                totalAmount: parseFloat(totalAmount),
                category: "General",
                debtors: debtorsData,
            });
            navigate("/dashboard");
        } catch (err) {
            alert("Eroare: " + err.response?.data?.message);
        }
    };

    return (
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <header style={{ marginBottom: "32px" }}>
                <h1
                    style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        color: "var(--text-main)",
                        margin: "0",
                    }}
                >
                    Adaugă Cheltuială 💸
                </h1>
                <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
                    Introdu detaliile și împarte suma cu colegii de apartament.
                </p>
            </header>

            <form onSubmit={handleSubmit} style={formCardStyle}>
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Ce ai plătit?</label>
                    <input
                        type="text"
                        placeholder="Ex: Factură Enel, Consumabile, Pizza..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        style={inputStyle}
                    />
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Suma Totală (RON)</label>
                    <input
                        type="number"
                        placeholder="0.00"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        required
                        step="0.01"
                        style={inputStyle}
                    />
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>
                        Suma care mă afectează pe mine (RON)
                    </label>
                    <input
                        type="number"
                        placeholder="0.00"
                        value={myAmount}
                        onChange={(e) => setMyAmount(e.target.value)}
                        step="0.01"
                        min="0"
                        style={inputStyle}
                    />
                    <p
                        style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            margin: "4px 0 0 0",
                        }}
                    >
                        Lasa gol sau introdu 0 dacă toată suma o datorează
                        colegii.
                    </p>
                </div>

                <div style={{ marginTop: "10px" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                        }}
                    >
                        <label style={labelStyle}>
                            Cine participă la cheltuială?
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowCustomSplit(!showCustomSplit)}
                            style={toggleButtonStyle}
                        >
                            {showCustomSplit ? "🔒 Egal" : "⚙️ Custom"}
                        </button>
                    </div>
                    <p
                        style={{
                            fontSize: "13px",
                            color: "var(--text-muted)",
                            marginBottom: "12px",
                        }}
                    >
                        {showCustomSplit
                            ? "Editează suma pe care fiecare persoană o datorează."
                            : "Restul sumei se va împărți egal între colegii selectați."}
                    </p>
                    <div style={debtorsGridStyle}>
                        {roommates.map((roommate) => (
                            <div key={roommate.id}>
                                <label
                                    style={debtorOptionStyle(
                                        selectedDebtors[roommate.id]?.selected,
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedDebtors[roommate.id]
                                                ?.selected || false
                                        }
                                        onChange={() =>
                                            handleCheckboxChange(roommate.id)
                                        }
                                        style={{ marginRight: "10px" }}
                                    />
                                    {roommate.name}
                                </label>
                                {showCustomSplit &&
                                    selectedDebtors[roommate.id]?.selected && (
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={
                                                selectedDebtors[roommate.id]
                                                    ?.amount || ""
                                            }
                                            onChange={(e) =>
                                                handleAmountChange(
                                                    roommate.id,
                                                    e.target.value,
                                                )
                                            }
                                            step="0.01"
                                            min="0"
                                            style={customAmountInputStyle}
                                        />
                                    )}
                            </div>
                        ))}
                    </div>
                </div>

                {!showCustomSplit && (
                    <div style={summaryBoxStyle}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "10px",
                            }}
                        >
                            <span style={{ color: "var(--text-muted)" }}>
                                Suma mea:
                            </span>
                            <span
                                style={{
                                    fontWeight: "700",
                                    color: "var(--text-main)",
                                    fontSize: "18px",
                                }}
                            >
                                {(parseFloat(myAmount) || 0).toFixed(2)} RON
                            </span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span style={{ color: "var(--text-muted)" }}>
                                Per coleg selectat:
                            </span>
                            <span
                                style={{
                                    fontWeight: "700",
                                    color: "var(--primary)",
                                    fontSize: "18px",
                                }}
                            >
                                {getEqualSplitAmountPerPerson()} RON
                            </span>
                        </div>
                    </div>
                )}

                {showCustomSplit && (
                    <div style={summaryBoxStyle}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "10px",
                            }}
                        >
                            <span style={{ color: "var(--text-muted)" }}>
                                Suma mea:
                            </span>
                            <span
                                style={{
                                    fontWeight: "700",
                                    color: "var(--text-main)",
                                    fontSize: "18px",
                                }}
                            >
                                {(parseFloat(myAmount) || 0).toFixed(2)} RON
                            </span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "12px",
                            }}
                        >
                            <span style={{ color: "var(--text-muted)" }}>
                                Total alocat debitorilor:
                            </span>
                            <span
                                style={{
                                    fontWeight: "700",
                                    color: "var(--primary)",
                                    fontSize: "18px",
                                }}
                            >
                                {Object.entries(selectedDebtors)
                                    .filter(([_, d]) => d?.selected)
                                    .reduce(
                                        (sum, [_, d]) =>
                                            sum + parseFloat(d?.amount || 0),
                                        0,
                                    )
                                    .toFixed(2)}{" "}
                                RON
                            </span>
                        </div>
                        {(() => {
                            const total = parseFloat(totalAmount) || 0;
                            const myPart = parseFloat(myAmount) || 0;
                            const debtorsTotal = Object.entries(selectedDebtors)
                                .filter(([_, d]) => d?.selected)
                                .reduce(
                                    (sum, [_, d]) =>
                                        sum + parseFloat(d?.amount || 0),
                                    0,
                                );
                            const isCorrect =
                                Math.abs(debtorsTotal - (total - myPart)) <
                                0.01;
                            return (
                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: isCorrect
                                            ? "#22c55e"
                                            : "#ef4444",
                                    }}
                                >
                                    {isCorrect
                                        ? "✅ Suma este corectă"
                                        : "❌ Suma debitorilor nu egalează restul de plată!"}
                                </div>
                            );
                        })()}
                    </div>
                )}

                <div
                    style={{ display: "flex", gap: "12px", marginTop: "10px" }}
                >
                    <button type="submit" style={submitButtonStyle}>
                        Salvează Cheltuiala
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        style={cancelButtonStyle}
                    >
                        Anulează
                    </button>
                </div>
            </form>
        </div>
    );
}

// Stiluri pentru AddExpense
const formCardStyle = {
    background: "var(--bg-card)",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "var(--shadow)",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
};

const inputGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
};

const labelStyle = {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--text-main)",
};

const inputStyle = {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.2s",
};

const customAmountInputStyle = {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    marginTop: "6px",
    width: "100%",
    outline: "none",
};

const debtorsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "12px",
};

const debtorOptionStyle = (isSelected) => ({
    display: "flex",
    alignItems: "center",
    padding: "10px 14px",
    borderRadius: "8px",
    border: `1px solid ${isSelected ? "var(--primary)" : "#e5e7eb"}`,
    backgroundColor: isSelected ? "#f5f3ff" : "transparent",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
});

const summaryBoxStyle = {
    background: "#f9fafb",
    padding: "20px",
    borderRadius: "12px",
    border: "1px dashed #e5e7eb",
};

const toggleButtonStyle = {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f3f4f6",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s",
};

const submitButtonStyle = {
    flex: 1,
    backgroundColor: "var(--primary)",
    color: "white",
    padding: "14px",
    border: "none",
    fontSize: "16px",
    fontWeight: "600",
};

const cancelButtonStyle = {
    padding: "14px 24px",
    backgroundColor: "transparent",
    color: "var(--text-muted)",
    border: "1px solid #e5e7eb",
    fontSize: "16px",
};

export default AddExpense;
