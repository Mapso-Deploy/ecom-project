import React from 'react';
import './Modal.css'; // We'll create this for basic styling

const Modal = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times; {/* Or an icon */}
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal; 