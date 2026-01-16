import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export const Login = () => {
  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/");
    } catch (error) {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="containerBackground">
      <form className="form" onSubmit={handleSubmit}>
        
        <div className="logo-container">
          <img src="/logoDB.png" />
        </div>
        <p id="heading">Iniciar sesión</p>

        <div className="field">
          <input
            className="input-field"
            type="text"
            placeholder="Usuario"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
            required
          />
        </div>

        <div className="field">
          <input
            className="input-field"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />
        </div>

        <div className="btn">
          <button className="button1" type="submit">
            ACCEDER
          </button>
        </div>
      </form>
      
    </div>
    

  );
};
