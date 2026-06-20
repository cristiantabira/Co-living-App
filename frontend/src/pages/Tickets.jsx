// import React, { useEffect, useState } from "react";
// import API from "../api/axios";

// // Pentru a permite rularea în preview fără erori de localStorage, simulăm un user dacă nu există
// if (!localStorage.getItem("user")) {
//     localStorage.setItem(
//         "user",
//         JSON.stringify({
//             id: 1,
//             name: "Test User",
//             Apartment: { complexId: 1 },
//         }),
//     );
// }

// // --- Componentele tale pentru Buton și Modal ---

// const CreateTicketButton = ({ onTicketCreated }) => {
//     const [showModal, setShowModal] = useState(false);
//     const currentUser = JSON.parse(localStorage.getItem("user"));
//     // Asigură-te că proprietatea se numește corect în funcție de cum o salvezi în localStorage
//     const complexId =
//         currentUser?.apartment?.complexId || currentUser?.Apartment?.complexId;

//     const handleClick = () => {
//         if (!complexId) {
//             alert(
//                 "Nu ești alocat niciunui complex. Contactează un administrator.",
//             );
//             return;
//         }
//         setShowModal(true);
//     };

//     return (
//         <>
//             <button
//                 onClick={handleClick}
//                 style={{
//                     padding: "10px 16px",
//                     backgroundColor: "#dc2626",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "6px",
//                     cursor: "pointer",
//                     fontWeight: "500",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px",
//                     transition: "all 0.2s ease",
//                 }}
//                 onMouseEnter={(e) =>
//                     (e.target.style.backgroundColor = "#b91c1c")
//                 }
//                 onMouseLeave={(e) =>
//                     (e.target.style.backgroundColor = "#dc2626")
//                 }
//             >
//                 🔧 Raportează Defecțiune
//             </button>

//             {showModal && (
//                 <CreateTicketModal
//                     onClose={() => setShowModal(false)}
//                     complexId={complexId}
//                     onTicketCreated={onTicketCreated}
//                 />
//             )}
//         </>
//     );
// };

// const CreateTicketModal = ({ onClose, complexId, onTicketCreated }) => {
//     const [formData, setFormData] = useState({
//         title: "",
//         description: "",
//         category: "OTHER",
//         priority: "MEDIUM",
//     });
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError("");

//         try {
//             const response = await API.post("/tickets", {
//                 ...formData,
//                 complexId: parseInt(complexId),
//             });

//             if (response.status === 201) {
//                 alert(
//                     "✓ Tichet creat cu succes! Administratorii complexului au fost notificați.",
//                 );
//                 onTicketCreated(); // Apelăm funcția pentru a reîmprospăta lista
//                 onClose();
//             }
//         } catch (err) {
//             const message =
//                 err.response?.data?.message || "Eroare la crearea tichetului";
//             setError(message);
//             console.error("Eroare la crearea tichetului:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div
//             style={{
//                 position: "fixed",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 backgroundColor: "rgba(0, 0, 0, 0.5)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 zIndex: 1000,
//             }}
//         >
//             <div
//                 style={{
//                     backgroundColor: "white",
//                     borderRadius: "8px",
//                     boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
//                     width: "90%",
//                     maxWidth: "500px",
//                     padding: "24px",
//                 }}
//             >
//                 <h2
//                     style={{
//                         marginTop: 0,
//                         marginBottom: "20px",
//                         color: "#1f2937",
//                     }}
//                 >
//                     Raportează o Defecțiune
//                 </h2>

//                 {error && (
//                     <div
//                         style={{
//                             backgroundColor: "#fee2e2",
//                             color: "#dc2626",
//                             padding: "12px",
//                             borderRadius: "6px",
//                             marginBottom: "16px",
//                             fontSize: "14px",
//                         }}
//                     >
//                         {error}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit}>
//                     {/* Title Field */}
//                     <div style={{ marginBottom: "16px" }}>
//                         <label
//                             style={{
//                                 display: "block",
//                                 marginBottom: "6px",
//                                 fontWeight: "500",
//                                 color: "#374151",
//                             }}
//                         >
//                             Titlu *
//                         </label>
//                         <input
//                             type="text"
//                             placeholder="ex: Țeavă sparta la baie"
//                             required
//                             value={formData.title}
//                             onChange={(e) =>
//                                 setFormData({
//                                     ...formData,
//                                     title: e.target.value,
//                                 })
//                             }
//                             disabled={loading}
//                             style={{
//                                 width: "100%",
//                                 padding: "10px 12px",
//                                 border: "1px solid #d1d5db",
//                                 borderRadius: "6px",
//                                 fontSize: "14px",
//                                 boxSizing: "border-box",
//                                 fontFamily: "inherit",
//                             }}
//                         />
//                     </div>

//                     {/* Description Field */}
//                     <div style={{ marginBottom: "16px" }}>
//                         <label
//                             style={{
//                                 display: "block",
//                                 marginBottom: "6px",
//                                 fontWeight: "500",
//                                 color: "#374151",
//                             }}
//                         >
//                             Descriere *
//                         </label>
//                         <textarea
//                             placeholder="Descrie detailat problema..."
//                             required
//                             value={formData.description}
//                             onChange={(e) =>
//                                 setFormData({
//                                     ...formData,
//                                     description: e.target.value,
//                                 })
//                             }
//                             disabled={loading}
//                             style={{
//                                 width: "100%",
//                                 padding: "10px 12px",
//                                 border: "1px solid #d1d5db",
//                                 borderRadius: "6px",
//                                 fontSize: "14px",
//                                 boxSizing: "border-box",
//                                 fontFamily: "inherit",
//                                 minHeight: "100px",
//                                 resize: "vertical",
//                             }}
//                         />
//                     </div>

//                     {/* Category Select */}
//                     <div style={{ marginBottom: "16px" }}>
//                         <label
//                             style={{
//                                 display: "block",
//                                 marginBottom: "6px",
//                                 fontWeight: "500",
//                                 color: "#374151",
//                             }}
//                         >
//                             Categorie *
//                         </label>
//                         <select
//                             value={formData.category}
//                             onChange={(e) =>
//                                 setFormData({
//                                     ...formData,
//                                     category: e.target.value,
//                                 })
//                             }
//                             disabled={loading}
//                             style={{
//                                 width: "100%",
//                                 padding: "10px 12px",
//                                 border: "1px solid #d1d5db",
//                                 borderRadius: "6px",
//                                 fontSize: "14px",
//                                 boxSizing: "border-box",
//                                 fontFamily: "inherit",
//                             }}
//                         >
//                             <option value="PLUMBING">
//                                 Instalații Sanitare 🚿
//                             </option>
//                             <option value="ELECTRICAL">Electricitate ⚡</option>
//                             <option value="HVAC">
//                                 Climatizare/Încălzire 🌡️
//                             </option>
//                             <option value="CLEANING">Curățenie 🧹</option>
//                             <option value="STRUCTURAL">
//                                 Structură/Zidărie 🏗️
//                             </option>
//                             <option value="FURNITURE">
//                                 Mobilier/Echipamente 🪑
//                             </option>
//                             <option value="OTHER">Altele 📝</option>
//                         </select>
//                     </div>

//                     {/* Priority Select */}
//                     <div style={{ marginBottom: "16px" }}>
//                         <label
//                             style={{
//                                 display: "block",
//                                 marginBottom: "6px",
//                                 fontWeight: "500",
//                                 color: "#374151",
//                             }}
//                         >
//                             Prioritate *
//                         </label>
//                         <select
//                             value={formData.priority}
//                             onChange={(e) =>
//                                 setFormData({
//                                     ...formData,
//                                     priority: e.target.value,
//                                 })
//                             }
//                             disabled={loading}
//                             style={{
//                                 width: "100%",
//                                 padding: "10px 12px",
//                                 border: "1px solid #d1d5db",
//                                 borderRadius: "6px",
//                                 fontSize: "14px",
//                                 boxSizing: "border-box",
//                                 fontFamily: "inherit",
//                             }}
//                         >
//                             <option value="LOW">Redusă - Pot astepta</option>
//                             <option value="MEDIUM">
//                                 Medie - In cateva zile
//                             </option>
//                             <option value="HIGH">Ridicata - Urgent</option>
//                             <option value="URGENT">
//                                 Foarte Urgenta - Acum!
//                             </option>
//                         </select>
//                     </div>

//                     {/* Buttons */}
//                     <div
//                         style={{
//                             display: "flex",
//                             gap: "12px",
//                             marginTop: "24px",
//                         }}
//                     >
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             disabled={loading}
//                             style={{
//                                 flex: 1,
//                                 padding: "10px 16px",
//                                 backgroundColor: "#f3f4f6",
//                                 color: "#374151",
//                                 border: "none",
//                                 borderRadius: "6px",
//                                 cursor: loading ? "not-allowed" : "pointer",
//                                 fontWeight: "500",
//                                 transition: "all 0.2s ease",
//                                 opacity: loading ? 0.6 : 1,
//                             }}
//                             onMouseEnter={(e) =>
//                                 !loading &&
//                                 (e.target.style.backgroundColor = "#e5e7eb")
//                             }
//                             onMouseLeave={(e) =>
//                                 !loading &&
//                                 (e.target.style.backgroundColor = "#f3f4f6")
//                             }
//                         >
//                             Anulează
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             style={{
//                                 flex: 1,
//                                 padding: "10px 16px",
//                                 backgroundColor: "#dc2626",
//                                 color: "white",
//                                 border: "none",
//                                 borderRadius: "6px",
//                                 cursor: loading ? "not-allowed" : "pointer",
//                                 fontWeight: "500",
//                                 transition: "all 0.2s ease",
//                                 opacity: loading ? 0.6 : 1,
//                             }}
//                             onMouseEnter={(e) =>
//                                 !loading &&
//                                 (e.target.style.backgroundColor = "#b91c1c")
//                             }
//                             onMouseLeave={(e) =>
//                                 !loading &&
//                                 (e.target.style.backgroundColor = "#dc2626")
//                             }
//                         >
//                             {loading ? "Se trimite..." : "Trimite Ticket"}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// // --- Pagina Principală ---

// function Tickets() {
//     const [tickets, setTickets] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         fetchTickets();
//     }, []);

//     const fetchTickets = async () => {
//         try {
//             setLoading(true);
//             const { data } = await API.get("/tickets/my-tickets");
//             setTickets(data.tickets || []);
//         } catch (err) {
//             console.error("Eroare la încărcarea tichetelor:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleConfirmResolution = async (ticketId, confirmed) => {
//         try {
//             await API.patch(`/tickets/${ticketId}/confirm-resolution`, {
//                 confirmed,
//             });
//             fetchTickets();
//         } catch (err) {
//             alert("Eroare: " + (err.response?.data?.message || err.message));
//         }
//     };

//     const handleCancel = async (ticketId) => {
//         if (!window.confirm("Ești sigur că vrei să anulezi acest tichet?"))
//             return;
//         try {
//             await API.patch(`/tickets/${ticketId}/cancel`);
//             fetchTickets();
//         } catch (err) {
//             alert("Eroare: " + (err.response?.data?.message || err.message));
//         }
//     };

//     const getStatusBadge = (status) => {
//         const styles = {
//             OPEN: { bg: "#e5e7eb", color: "#374151", label: "Deschis" },
//             IN_PROGRESS: { bg: "#fef08a", color: "#b45309", label: "În Lucru" },
//             RESOLVED: { bg: "#ddd6fe", color: "#6d28d9", label: "Rezolvat" },
//             CLOSED: { bg: "#bbf7d0", color: "#15803d", label: "Închis" },
//             CANCELED: { bg: "#fecaca", color: "#b91c1c", label: "Anulat" },
//         };
//         const s = styles[status] || styles.OPEN;
//         return (
//             <span
//                 style={{
//                     backgroundColor: s.bg,
//                     color: s.color,
//                     padding: "4px 10px",
//                     borderRadius: "12px",
//                     fontSize: "12px",
//                     fontWeight: "bold",
//                 }}
//             >
//                 {s.label}
//             </span>
//         );
//     };

//     return (
//         <div
//             style={{
//                 maxWidth: "800px",
//                 margin: "0 auto",
//                 padding: "20px 0",
//                 fontFamily: "system-ui, -apple-system, sans-serif",
//             }}
//         >
//             <header
//                 style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     marginBottom: "32px",
//                 }}
//             >
//                 <div>
//                     <h1
//                         style={{
//                             fontSize: "28px",
//                             fontWeight: "700",
//                             color: "var(--text-main, #111827)",
//                             margin: "0",
//                         }}
//                     >
//                         Mentenanță 🛠️
//                     </h1>
//                     <p
//                         style={{
//                             color: "var(--text-muted, #6b7280)",
//                             marginTop: "8px",
//                             marginBottom: "0",
//                         }}
//                     >
//                         Raportează defecțiuni și urmărește stadiul reparațiilor.
//                     </p>
//                 </div>
//                 {/* Folosim componenta ta care se ocupă de afișarea modalului */}
//                 <CreateTicketButton onTicketCreated={fetchTickets} />
//             </header>

//             <div>
//                 {loading ? (
//                     <p style={{ color: "#6b7280" }}>Se încarcă tichetele...</p>
//                 ) : tickets.length === 0 ? (
//                     <div
//                         style={{
//                             textAlign: "center",
//                             padding: "40px",
//                             background: "var(--bg-card, #ffffff)",
//                             borderRadius: "16px",
//                             border: "1px dashed #e5e7eb",
//                         }}
//                     >
//                         <p style={{ color: "var(--text-muted, #6b7280)" }}>
//                             Nu ai raportat nicio defecțiune până acum.
//                         </p>
//                     </div>
//                 ) : (
//                     <div
//                         style={{
//                             display: "flex",
//                             flexDirection: "column",
//                             gap: "16px",
//                         }}
//                     >
//                         {tickets.map((ticket) => (
//                             <div key={ticket.id} style={cardStyle}>
//                                 <div
//                                     style={{
//                                         display: "flex",
//                                         justifyContent: "space-between",
//                                         alignItems: "flex-start",
//                                         marginBottom: "12px",
//                                     }}
//                                 >
//                                     <div>
//                                         <h4
//                                             style={{
//                                                 margin: "0 0 8px 0",
//                                                 color: "var(--text-main, #111827)",
//                                             }}
//                                         >
//                                             {ticket.title}
//                                         </h4>
//                                         <p
//                                             style={{
//                                                 margin: 0,
//                                                 fontSize: "14px",
//                                                 color: "var(--text-muted, #6b7280)",
//                                             }}
//                                         >
//                                             Categoria:{" "}
//                                             <strong>{ticket.category}</strong> |
//                                             Urgență:{" "}
//                                             <strong>{ticket.priority}</strong>
//                                         </p>
//                                     </div>
//                                     {getStatusBadge(ticket.status)}
//                                 </div>

//                                 <p
//                                     style={{
//                                         fontSize: "15px",
//                                         color: "#4b5563",
//                                         backgroundColor: "#f9fafb",
//                                         padding: "12px",
//                                         borderRadius: "8px",
//                                         border: "1px solid #f3f4f6",
//                                     }}
//                                 >
//                                     {ticket.description}
//                                 </p>

//                                 <div
//                                     style={{
//                                         display: "flex",
//                                         justifyContent: "space-between",
//                                         alignItems: "center",
//                                         marginTop: "16px",
//                                         fontSize: "13px",
//                                         color: "var(--text-muted, #6b7280)",
//                                     }}
//                                 >
//                                     <span>
//                                         Raportat:{" "}
//                                         {new Date(
//                                             ticket.createdAt,
//                                         ).toLocaleDateString("ro-RO")}
//                                     </span>
//                                     {ticket.AssignedTo && (
//                                         <span>
//                                             Preluat de: {ticket.AssignedTo.name}
//                                         </span>
//                                     )}
//                                 </div>

//                                 {/* Action Buttons based on Status */}
//                                 <div
//                                     style={{
//                                         display: "flex",
//                                         gap: "8px",
//                                         marginTop: "16px",
//                                     }}
//                                 >
//                                     {ticket.status === "OPEN" && (
//                                         <button
//                                             onClick={() =>
//                                                 handleCancel(ticket.id)
//                                             }
//                                             style={cancelButtonStyle}
//                                         >
//                                             Anulează Tichet
//                                         </button>
//                                     )}

//                                     {ticket.status === "RESOLVED" && (
//                                         <>
//                                             <button
//                                                 onClick={() =>
//                                                     handleConfirmResolution(
//                                                         ticket.id,
//                                                         true,
//                                                     )
//                                                 }
//                                                 style={{
//                                                     ...primaryButtonStyle,
//                                                     backgroundColor: "#15803d",
//                                                 }}
//                                             >
//                                                 Confirmă Repararea (Închide)
//                                             </button>
//                                             <button
//                                                 onClick={() =>
//                                                     handleConfirmResolution(
//                                                         ticket.id,
//                                                         false,
//                                                     )
//                                                 }
//                                                 style={cancelButtonStyle}
//                                             >
//                                                 Problema persistă (Redeschide)
//                                             </button>
//                                         </>
//                                     )}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// // Styles pentru pagina de Tichete
// const cardStyle = {
//     background: "var(--bg-card, #ffffff)",
//     padding: "24px",
//     borderRadius: "16px",
//     boxShadow:
//         "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
//     display: "flex",
//     flexDirection: "column",
//     gap: "12px",
//     border: "1px solid #f3f4f6",
// };

// const primaryButtonStyle = {
//     backgroundColor: "var(--primary, #4f46e5)",
//     color: "white",
//     padding: "10px 20px",
//     borderRadius: "8px",
//     border: "none",
//     fontSize: "15px",
//     fontWeight: "600",
//     cursor: "pointer",
//     transition: "background-color 0.2s",
// };

// const cancelButtonStyle = {
//     padding: "10px 20px",
//     backgroundColor: "transparent",
//     color: "#dc2626",
//     border: "1px solid #fca5a5",
//     borderRadius: "8px",
//     fontSize: "14px",
//     fontWeight: "600",
//     cursor: "pointer",
// };

// export default Tickets;

import React, { useEffect, useState } from "react";
import API from "../api/axios";
import CreateTicketButton from "../components/CreateTicketButton"; // Ajustează calea dacă butonul e în alt folder

function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/tickets/my-tickets");
            setTickets(data.tickets || []);
        } catch (err) {
            console.error("Eroare la încărcarea tichetelor:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmResolution = async (ticketId, confirmed) => {
        try {
            await API.patch(`/tickets/${ticketId}/confirm-resolution`, {
                confirmed,
            });
            fetchTickets();
        } catch (err) {
            alert("Eroare: " + (err.response?.data?.message || err.message));
        }
    };

    const handleCancel = async (ticketId) => {
        if (!window.confirm("Ești sigur că vrei să anulezi acest tichet?"))
            return;
        try {
            await API.patch(`/tickets/${ticketId}/cancel`);
            fetchTickets();
        } catch (err) {
            alert("Eroare: " + (err.response?.data?.message || err.message));
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            OPEN: { bg: "#e5e7eb", color: "#374151", label: "Deschis" },
            IN_PROGRESS: { bg: "#fef08a", color: "#b45309", label: "În Lucru" },
            RESOLVED: { bg: "#ddd6fe", color: "#6d28d9", label: "Rezolvat" },
            CLOSED: { bg: "#bbf7d0", color: "#15803d", label: "Închis" },
            CANCELED: { bg: "#fecaca", color: "#b91c1c", label: "Anulat" },
        };
        const s = styles[status] || styles.OPEN;
        return (
            <span
                style={{
                    backgroundColor: s.bg,
                    color: s.color,
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                }}
            >
                {s.label}
            </span>
        );
    };

    return (
        <div
            style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "20px 0",
                fontFamily: "system-ui, -apple-system, sans-serif",
            }}
        >
            <header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "32px",
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: "28px",
                            fontWeight: "700",
                            color: "var(--text-main, #111827)",
                            margin: "0",
                        }}
                    >
                        Mentenanță 🛠️
                    </h1>
                    <p
                        style={{
                            color: "var(--text-muted, #6b7280)",
                            marginTop: "8px",
                            marginBottom: "0",
                        }}
                    >
                        Raportează defecțiuni și urmărește stadiul reparațiilor.
                    </p>
                </div>
                <CreateTicketButton onTicketCreated={fetchTickets} />
            </header>

            <div>
                {loading ? (
                    <p style={{ color: "#6b7280" }}>Se încarcă tichetele...</p>
                ) : tickets.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "40px",
                            background: "var(--bg-card, #ffffff)",
                            borderRadius: "16px",
                            border: "1px dashed #e5e7eb",
                        }}
                    >
                        <p style={{ color: "var(--text-muted, #6b7280)" }}>
                            Nu ai raportat nicio defecțiune până acum.
                        </p>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                        }}
                    >
                        {tickets.map((ticket) => (
                            <div key={ticket.id} style={cardStyle}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        marginBottom: "12px",
                                    }}
                                >
                                    <div>
                                        <h4
                                            style={{
                                                margin: "0 0 8px 0",
                                                color: "var(--text-main, #111827)",
                                            }}
                                        >
                                            {ticket.title}
                                        </h4>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: "14px",
                                                color: "var(--text-muted, #6b7280)",
                                            }}
                                        >
                                            Categoria:{" "}
                                            <strong>{ticket.category}</strong> |
                                            Urgență:{" "}
                                            <strong>{ticket.priority}</strong>
                                        </p>
                                    </div>
                                    {getStatusBadge(ticket.status)}
                                </div>

                                <p
                                    style={{
                                        fontSize: "15px",
                                        color: "#4b5563",
                                        backgroundColor: "#f9fafb",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: "1px solid #f3f4f6",
                                    }}
                                >
                                    {ticket.description}
                                </p>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginTop: "16px",
                                        fontSize: "13px",
                                        color: "var(--text-muted, #6b7280)",
                                    }}
                                >
                                    <span>
                                        Raportat:{" "}
                                        {new Date(
                                            ticket.createdAt,
                                        ).toLocaleDateString("ro-RO")}
                                    </span>
                                    {ticket.AssignedTo && (
                                        <span>
                                            Preluat de: {ticket.AssignedTo.name}
                                        </span>
                                    )}
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "8px",
                                        marginTop: "16px",
                                    }}
                                >
                                    {ticket.status === "OPEN" && (
                                        <button
                                            onClick={() =>
                                                handleCancel(ticket.id)
                                            }
                                            style={cancelButtonStyle}
                                        >
                                            Anulează Tichet
                                        </button>
                                    )}

                                    {ticket.status === "RESOLVED" && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleConfirmResolution(
                                                        ticket.id,
                                                        true,
                                                    )
                                                }
                                                style={{
                                                    ...primaryButtonStyle,
                                                    backgroundColor: "#15803d",
                                                }}
                                            >
                                                Confirmă Repararea (Închide)
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleConfirmResolution(
                                                        ticket.id,
                                                        false,
                                                    )
                                                }
                                                style={cancelButtonStyle}
                                            >
                                                Problema persistă (Redeschide)
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const cardStyle = {
    background: "var(--bg-card, #ffffff)",
    padding: "24px",
    borderRadius: "16px",
    boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    border: "1px solid #f3f4f6",
};

const primaryButtonStyle = {
    backgroundColor: "var(--primary, #4f46e5)",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
};

const cancelButtonStyle = {
    padding: "10px 20px",
    backgroundColor: "transparent",
    color: "#dc2626",
    border: "1px solid #fca5a5",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
};

export default Tickets;
