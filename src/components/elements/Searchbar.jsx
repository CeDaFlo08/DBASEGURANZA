import React from "react";
import "./Searchbar.css";

export const Searchbar = ({ value, onChange }) => {
    return (
        <div className="input-container">
        <input
            type="text"
            className="input"
            placeholder="Buscar por nombre, póliza o TRAD..."
            value={value}
            onChange={onChange}
        />

        <span className="icon">
            <svg
            width="19px"
            height="19px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            >
            <path d="M14 5H20" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M14 8H17" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            <path
                d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            <path d="M22 22L20 20" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
        </span>
        </div>
    );
    };
