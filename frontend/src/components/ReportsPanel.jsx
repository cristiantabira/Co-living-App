import { useState } from 'react';
import ReportDownloadButton from './ReportDownloadButton';

const ReportsPanel = () => {
  // Mock data - later from backend
  const [reports] = useState([
    {
      id: 1,
      period: 'Iunie 2026',
      apartment: 'Apt 304',
      generatedDate: '2026-06-02',
      totalAmount: 1250.75,
      status: 'COMPLETED',
    },
    {
      id: 2,
      period: 'Mai 2026',
      apartment: 'Apt 304',
      generatedDate: '2026-05-03',
      totalAmount: 980.50,
      status: 'COMPLETED',
    },
  ]);

  const handleGenerateReport = () => {
    alert('✓ Raport generat! (Vizual only - backend pending)');
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      padding: '20px',
      marginBottom: '24px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#1f2937' }}>📄 Rapoarte Lunare</h3>
        <button
          onClick={handleGenerateReport}
          style={{
            padding: '8px 14px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
        >
          + Genereaza Raport
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Perioada</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Apartament</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Total</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Generat</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '10px', color: '#1f2937' }}>{report.period}</td>
                <td style={{ padding: '10px', color: '#1f2937' }}>{report.apartment}</td>
                <td style={{ padding: '10px', color: '#1f2937' }}>{report.totalAmount.toFixed(2)} RON</td>
                <td style={{ padding: '10px', color: '#6b7280' }}>{report.generatedDate}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}>
                    ✓ Gata
                  </span>
                </td>
                <td style={{ padding: '10px' }}>
                  <ReportDownloadButton reportId={report.period} apartmentName={report.apartment} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsPanel;
