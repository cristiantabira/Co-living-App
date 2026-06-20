import { useState } from 'react';
import CreateTicketModal from './CreateTicketModal';

const CreateTicketButton = () => {
  const [showModal, setShowModal] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const complexId = currentUser?.Apartment?.complexId;

  const handleClick = () => {
    if (!complexId) {
      alert('Nu ești alocat niciunui complex. Contactează un administrator.');
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        style={{
          padding: '10px 16px',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
      >
        🔧 Raportează Defecțiune
      </button>

      {showModal && <CreateTicketModal onClose={() => setShowModal(false)} complexId={complexId} />}
    </>
  );
};

export default CreateTicketButton;
