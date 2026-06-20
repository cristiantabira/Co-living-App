import { useState } from "react";
import API from "../api/axios";

const CreateTicketModal = ({ onClose, onTicketCreated }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "OTHER",
        priority: "MEDIUM",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Backend-ul este configurat să își ia singur complexId
            const response = await API.post("/tickets", formData);

            if (response.status === 201) {
                alert(
                    "✓ Tichet creat cu succes! Administratorii complexului au fost notificați.",
                );

                // Dacă am primit funcția onTicketCreated ca prop, o apelăm
                if (onTicketCreated) {
                    onTicketCreated();
                }

                onClose();
            }
        } catch (err) {
            const message =
                err.response?.data?.message || "Eroare la crearea tichetului";
            setError(message);
            console.error("Eroare la crearea tichetului:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                    width: "90%",
                    maxWidth: "500px",
                    padding: "24px",
                }}
            >
                <h2
                    style={{
                        marginTop: 0,
                        marginBottom: "20px",
                        color: "#1f2937",
                    }}
                >
                    Raportează o Defecțiune
                </h2>

                {error && (
                    <div
                        style={{
                            backgroundColor: "#fee2e2",
                            color: "#dc2626",
                            padding: "12px",
                            borderRadius: "6px",
                            marginBottom: "16px",
                            fontSize: "14px",
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Title Field */}
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "6px",
                                fontWeight: "500",
                                color: "#374151",
                            }}
                        >
                            Titlu *
                        </label>
                        <input
                            type="text"
                            placeholder="ex: Țeavă sparta la baie"
                            required
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    title: e.target.value,
                                })
                            }
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "14px",
                                boxSizing: "border-box",
                                fontFamily: "inherit",
                            }}
                        />
                    </div>

                    {/* Description Field */}
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "6px",
                                fontWeight: "500",
                                color: "#374151",
                            }}
                        >
                            Descriere *
                        </label>
                        <textarea
                            placeholder="Descrie detailat problema..."
                            required
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "14px",
                                boxSizing: "border-box",
                                fontFamily: "inherit",
                                minHeight: "100px",
                                resize: "vertical",
                            }}
                        />
                    </div>

                    {/* Category Select */}
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "6px",
                                fontWeight: "500",
                                color: "#374151",
                            }}
                        >
                            Categorie *
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    category: e.target.value,
                                })
                            }
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "14px",
                                boxSizing: "border-box",
                                fontFamily: "inherit",
                            }}
                        >
                            <option value="PLUMBING">
                                Instalații Sanitare 🚿
                            </option>
                            <option value="ELECTRICAL">Electricitate ⚡</option>
                            <option value="HVAC">
                                Climatizare/Încălzire 🌡️
                            </option>
                            <option value="CLEANING">Curățenie 🧹</option>
                            <option value="STRUCTURAL">
                                Structură/Zidărie 🏗️
                            </option>
                            <option value="FURNITURE">
                                Mobilier/Echipamente 🪑
                            </option>
                            <option value="OTHER">Altele 📝</option>
                        </select>
                    </div>

                    {/* Priority Select */}
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "6px",
                                fontWeight: "500",
                                color: "#374151",
                            }}
                        >
                            Prioritate *
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    priority: e.target.value,
                                })
                            }
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "14px",
                                boxSizing: "border-box",
                                fontFamily: "inherit",
                            }}
                        >
                            <option value="LOW">Redusă - Pot astepta</option>
                            <option value="MEDIUM">
                                Medie - In cateva zile
                            </option>
                            <option value="HIGH">Ridicata - Urgent</option>
                            <option value="URGENT">
                                Foarte Urgenta - Acum!
                            </option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            marginTop: "24px",
                        }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: "10px 16px",
                                backgroundColor: "#f3f4f6",
                                color: "#374151",
                                border: "none",
                                borderRadius: "6px",
                                cursor: loading ? "not-allowed" : "pointer",
                                fontWeight: "500",
                                transition: "all 0.2s ease",
                                opacity: loading ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) =>
                                !loading &&
                                (e.target.style.backgroundColor = "#e5e7eb")
                            }
                            onMouseLeave={(e) =>
                                !loading &&
                                (e.target.style.backgroundColor = "#f3f4f6")
                            }
                        >
                            Anulează
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: "10px 16px",
                                backgroundColor: "#dc2626",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: loading ? "not-allowed" : "pointer",
                                fontWeight: "500",
                                transition: "all 0.2s ease",
                                opacity: loading ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) =>
                                !loading &&
                                (e.target.style.backgroundColor = "#b91c1c")
                            }
                            onMouseLeave={(e) =>
                                !loading &&
                                (e.target.style.backgroundColor = "#dc2626")
                            }
                        >
                            {loading ? "Se trimite..." : "Trimite Ticket"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicketModal;
