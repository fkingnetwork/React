// Button.js
import React from 'react';

const Button = ({ onClick, label }) => {
    return (
        <button onClick={onClick} style={{ padding: '10px 20px', fontSize: '16px' }}>
            {label}
        </button>
    );
};

export default Button;
