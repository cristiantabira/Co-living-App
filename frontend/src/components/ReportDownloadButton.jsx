const ReportDownloadButton = ({ reportId = '2026-06', apartmentName = 'Apt 304' }) => {
  const handleDownload = () => {
    // TODO: Backend call when ready
    console.log('Download Report:', reportId);
    alert(`✓ Descarcă raport PDF pentru ${apartmentName} (${reportId})\n(Vizual only)`);
  };

  return (
    <button
      onClick={handleDownload}
      style={{
        padding: '8px 14px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
      onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
    >
      📥 Descarcă PDF
    </button>
  );
};

export default ReportDownloadButton;
