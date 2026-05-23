import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

function DebtsDetails() {
    const [debtsTo, setDebtsTo] = useState([]);
    const [creditsFrom, setCreditsFrom] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedDebt, setExpandedDebt] = useState(null);
    const [expandedCredit, setExpandedCredit] = useState(null);
    const [reminderSending, setReminderSending] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDebtsDetails();
    }, []);

    const fetchDebtsDetails = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/expenses/debts-details');
            setDebtsTo(data.debtsTo || []);
            setCreditsFrom(data.creditsFrom || []);
            setError('');
        } catch (err) {
            console.error('Eroare la preluarea datoriilor:', err);
            if (err.response?.status === 401) {
                navigate('/login');
            } else {
                setError(err.response?.data?.message || 'Eroare la preluarea datelor');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSendReminder = async (debtId, isCredit = false) => {
        try {
            setReminderSending(debtId);
            const endpoint = isCredit ? '/expenses/send-reminder-credit' : '/expenses/send-reminder';
            const { data } = await API.post(endpoint, { debtId });
            alert(data.message);
        } catch (err) {
            alert('Eroare: ' + (err.response?.data?.message || err.message));
        } finally {
            setReminderSending(null);
        }
    };

    const totalToPay = debtsTo.reduce((sum, debt) => sum + debt.totalAmount, 0);
    const totalToReceive = creditsFrom.reduce((sum, credit) => sum + credit.totalAmount, 0);

    return (
        <MainLayout>
            <div style={containerStyle}>
                <header style={headerStyle}>
                    <h1 style={titleStyle}>💰 Situația Financiară</h1>
                    <p style={subtitleStyle}>Rezumatul datoriilor și creditelor tale</p>
                </header>

                {error && (
                    <div style={errorAlertStyle}>
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError('')} style={closeButtonStyle}>✕</button>
                    </div>
                )}

                {loading ? (
                    <div style={loadingContainerStyle}>
                        <div style={spinnerStyle}>⏳</div>
                        <p style={loadingTextStyle}>Se încarcă datele...</p>
                    </div>
                ) : (
                    <>
                        {/* REZUMAT CARTELE */}
                        <div style={summaryGridStyle}>
                            <div style={summaryCardStyle('var(--danger)', debtsTo.length > 0)}>
                                <div style={summaryIconStyle}>💸</div>
                                <p style={summaryLabelStyle}>De Plătit</p>
                                <h2 style={summaryAmountStyle}>{totalToPay.toFixed(2)}</h2>
                                <p style={summaryCurrencyStyle}>lei</p>
                                <p style={summaryCountStyle}>{debtsTo.length} persoan{debtsTo.length === 1 ? 'ă' : 'e'}</p>
                            </div>

                            <div style={summaryCardStyle('var(--success)', creditsFrom.length > 0)}>
                                <div style={summaryIconStyle}>💵</div>
                                <p style={summaryLabelStyle}>De Recuperat</p>
                                <h2 style={summaryAmountStyle}>{totalToReceive.toFixed(2)}</h2>
                                <p style={summaryCurrencyStyle}>lei</p>
                                <p style={summaryCountStyle}>{creditsFrom.length} persoan{creditsFrom.length === 1 ? 'ă' : 'e'}</p>
                            </div>

                            <div style={summaryCardStyle('var(--primary)', true)}>
                                <div style={summaryIconStyle}>📊</div>
                                <p style={summaryLabelStyle}>Balanță</p>
                                <h2 style={{...summaryAmountStyle, color: totalToReceive - totalToPay >= 0 ? 'var(--success)' : 'var(--danger)'}}>
                                    {(totalToReceive - totalToPay).toFixed(2)}
                                </h2>
                                <p style={summaryCurrencyStyle}>lei</p>
                                <p style={summaryCountStyle}>
                                    {totalToReceive - totalToPay >= 0 ? '✓ Vei primi' : '✗ Vei plăti'}
                                </p>
                            </div>
                        </div>

                        {/* DATORII - Cât datorez eu */}
                        <section style={sectionStyle}>
                            <div style={sectionHeaderStyle}>
                                <span style={sectionTitleStyle}>
                                    <span style={badgeStyle('var(--danger)')}>⬆️</span>
                                    De Plătit - Datorii către Colegi
                                </span>
                            </div>

                            {debtsTo.length === 0 ? (
                                <div style={emptyStateStyle}>
                                    <span style={emptyIconStyle}>🎉</span>
                                    <p style={emptyTextStyle}>Nu ai datorii! Bravo!</p>
                                </div>
                            ) : (
                                <div style={cardsGridStyle}>
                                    {debtsTo.map((debt) => (
                                        <div key={`debt-${debt.personId}`} style={debtCardStyle}>
                                            <div style={cardHeaderStyle}>
                                                <div style={personInfoStyle}>
                                                    <div style={avatarStyle(debt.personName)}>
                                                        {debt.personName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={personNameStyle}>{debt.personName}</p>
                                                        <p style={transactionCountStyle}>
                                                            {debt.details.length} tranzacție{debt.details.length !== 1 ? 'i' : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div style={amountBadgeStyle('var(--danger)')}>
                                                    -{debt.totalAmount.toFixed(2)} lei
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setExpandedDebt(expandedDebt === debt.personId ? null : debt.personId)}
                                                style={expandButtonStyle}
                                            >
                                                {expandedDebt === debt.personId ? '▼' : '▶'} Detalii
                                            </button>

                                            {expandedDebt === debt.personId && (
                                                <div style={detailsStyle}>
                                                    {debt.details.map((d, idx) => (
                                                        <div key={idx} style={detailItemStyle}>
                                                            <span style={detailDescriptionStyle}>{d.description}</span>
                                                            <span style={detailAmountStyle}>{d.amount.toFixed(2)} lei</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div style={actionButtonsStyle}>
                                                <button
                                                    onClick={() => alert(`Integrare plată pentru ${debt.personName}: ${debt.totalAmount.toFixed(2)} lei`)}
                                                    style={payButtonStyle}
                                                >
                                                    💳 Plătește Acum
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* CREDITE - Cine îmi datorează */}
                        <section style={sectionStyle}>
                            <div style={sectionHeaderStyle}>
                                <span style={sectionTitleStyle}>
                                    <span style={badgeStyle('var(--success)')}>⬇️</span>
                                    De Recuperat - Credite de la Colegi
                                </span>
                            </div>

                            {creditsFrom.length === 0 ? (
                                <div style={emptyStateStyle}>
                                    <span style={emptyIconStyle}>✓</span>
                                    <p style={emptyTextStyle}>Nu ai credite. Toți ti-au achitat datoriile!</p>
                                </div>
                            ) : (
                                <div style={cardsGridStyle}>
                                    {creditsFrom.map((credit) => (
                                        <div key={`credit-${credit.personId}`} style={creditCardStyle}>
                                            <div style={cardHeaderStyle}>
                                                <div style={personInfoStyle}>
                                                    <div style={avatarStyle(credit.personName)}>
                                                        {credit.personName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={personNameStyle}>{credit.personName}</p>
                                                        <p style={transactionCountStyle}>
                                                            {credit.details.length} tranzacție{credit.details.length !== 1 ? 'i' : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div style={amountBadgeStyle('var(--success)')}>
                                                    +{credit.totalAmount.toFixed(2)} lei
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setExpandedCredit(expandedCredit === credit.personId ? null : credit.personId)}
                                                style={expandButtonStyle}
                                            >
                                                {expandedCredit === credit.personId ? '▼' : '▶'} Detalii
                                            </button>

                            {expandedCredit === credit.personId && (
                                                <div style={detailsStyle}>
                                                    {credit.details.map((d, idx) => (
                                                        <div key={idx} style={{...detailItemStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '8px'}}>
                                                            <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                                <span style={detailDescriptionStyle}>{d.description}</span>
                                                                <span style={detailAmountStyle}>{d.amount.toFixed(2)} lei</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleSendReminder(d.debtId, true)}
                                                                disabled={reminderSending === d.debtId}
                                                                style={{
                                                                    ...reminderButtonStyle,
                                                                    width: '100%',
                                                                    padding: '6px 12px',
                                                                    fontSize: '12px',
                                                                    opacity: reminderSending === d.debtId ? 0.6 : 1,
                                                                    cursor: reminderSending === d.debtId ? 'not-allowed' : 'pointer'
                                                                }}
                                                            >
                                                                {reminderSending === d.debtId ? '⏳ Se trimite...' : '🔔 Reaminteste să plătească'}
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div style={actionButtonsStyle}>
                                                <button
                                                    onClick={() => {
                                                        const detailsText = credit.details
                                                            .map((d) => `• ${d.description}: ${d.amount.toFixed(2)} lei`)
                                                            .join('\n');
                                                        alert(`${credit.personName} ți datorează:\n\n${detailsText}\n\nTotal: ${credit.totalAmount.toFixed(2)} lei`);
                                                    }}
                                                    style={{...reminderButtonStyle, background: 'var(--primary)'}}
                                                >
                                                    👁️ Vezi Rezumat
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </MainLayout>
    );
}

// STYLE DEFINITIONS
const containerStyle = {
    padding: '32px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
};

const headerStyle = {
    marginBottom: '40px',
};

const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: '0 0 8px 0',
};

const subtitleStyle = {
    fontSize: '16px',
    color: 'var(--text-muted)',
    margin: '0',
};

const errorAlertStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fee2e2',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #fca5a5',
};

const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '20px',
    padding: '0',
};

const loadingContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
};

const spinnerStyle = {
    fontSize: '48px',
    marginBottom: '16px',
};

const loadingTextStyle = {
    fontSize: '16px',
    color: 'var(--text-muted)',
};

const summaryGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
};

const summaryCardStyle = (color, hasData) => ({
    background: 'var(--bg-card)',
    border: `2px solid ${color}20`,
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    transform: hasData ? 'scale(1)' : 'scale(0.98)',
    opacity: hasData ? 1 : 0.7,
});

const summaryIconStyle = {
    fontSize: '36px',
    marginBottom: '12px',
};

const summaryLabelStyle = {
    fontSize: '14px',
    color: 'var(--text-muted)',
    margin: '0 0 8px 0',
    fontWeight: '500',
};

const summaryAmountStyle = {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0',
    color: 'var(--text-main)',
};

const summaryCurrencyStyle = {
    fontSize: '13px',
    color: 'var(--text-muted)',
    margin: '4px 0 0 0',
};

const summaryCountStyle = {
    fontSize: '12px',
    color: 'var(--text-muted)',
    margin: '8px 0 0 0',
};

const sectionStyle = {
    marginBottom: '40px',
};

const sectionHeaderStyle = {
    marginBottom: '24px',
};

const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: 'var(--text-main)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
};

const badgeStyle = (color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: `${color}15`,
    color: color,
    fontSize: '16px',
});

const cardsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
};

const debtCardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid #fee2e2',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    borderLeft: '4px solid var(--danger)',
};

const creditCardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid #dcfce7',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    borderLeft: '4px solid var(--success)',
};

const cardHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
};

const personInfoStyle = {
    display: 'flex',
    gap: '12px',
    flex: 1,
};

const avatarStyle = (name) => ({
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    backgroundColor: `hsl(${name.charCodeAt(0) * 137 % 360}, 70%, 85%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '18px',
    color: `hsl(${name.charCodeAt(0) * 137 % 360}, 70%, 35%)`,
    flexShrink: 0,
});

const personNameStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-main)',
    margin: '0',
};

const transactionCountStyle = {
    fontSize: '12px',
    color: 'var(--text-muted)',
    margin: '4px 0 0 0',
};

const amountBadgeStyle = (color) => ({
    fontSize: '16px',
    fontWeight: '700',
    color: color,
    backgroundColor: `${color}10`,
    padding: '8px 12px',
    borderRadius: '8px',
    whiteSpace: 'nowrap',
});

const expandButtonStyle = {
    width: '100%',
    background: 'var(--bg-secondary)',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text-main)',
    fontWeight: '500',
    marginBottom: '16px',
    transition: 'all 0.2s ease',
};

const detailsStyle = {
    background: 'var(--bg-secondary)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
};

const detailItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    padding: '8px 0',
    borderBottom: '1px solid var(--bg-card)',
};

const detailItemStyle2 = {
    ...detailItemStyle,
    borderBottom: 'none',
};

const detailDescriptionStyle = {
    color: 'var(--text-main)',
};

const detailAmountStyle = {
    fontWeight: '600',
    color: 'var(--text-main)',
};

const actionButtonsStyle = {
    display: 'flex',
    gap: '8px',
};

const payButtonStyle = {
    flex: 1,
    background: 'var(--danger)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
};

const reminderButtonStyle = {
    flex: 1,
    background: 'var(--warning)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
};

const emptyStateStyle = {
    textAlign: 'center',
    padding: '60px 24px',
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '2px dashed var(--bg-card)',
};

const emptyIconStyle = {
    fontSize: '48px',
    display: 'block',
    marginBottom: '12px',
};

const emptyTextStyle = {
    fontSize: '16px',
    color: 'var(--text-muted)',
    margin: '0',
};

export default DebtsDetails;
