import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";



export default function Login(){

  const emptyForm = {
    username : '',
    password : ''
  }

  const [form, setForm] = useState(emptyForm)
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  function handleChange(e){
    setForm(
      {
        ...form,
        [e.target.name]:e.target.value
      }
    )
  }

  const handleLogin = async (e) =>{

    e.preventDefault()

    if (form.username.length<2){
      alert("name field must 2 character")
      return
    }

    if (form.password.length<2){
      alert("Password field must 2 character")
      return
    }

    try{

      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
  
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail);
      }


      // ========================================================
      // Login successful
      // Now get logged-in user
      // ========================================================
      const success = await login();

      if (!success) {
        throw new Error("Unable to get logged-in user");
      }


      // Now navigate
      navigate("/master/company", { replace: true });

      alert("Login Successfully");

    }
    catch (err) {
      alert(err);
    }

  }

  const styles = {

  container: {
    width: "100%",
    maxWidth: "420px",
    margin: "100px auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f6f8",
    borderRadius: "10px",
    padding: "40px",
    border: "1px solid #e5e7eb",
  },


    header: { 
      marginBottom: "30px", 
    },

    logo: { 
      fontSize: "28px", 
      fontWeight: "700", 
      color: "#1f2937", 
      marginBottom: "8px", 
    },

    formGroup: { 
      marginBottom: "20px", 
    },

    label: { 
      display: "block", 
      fontSize: "14px", 
      fontWeight: "600", 
      color: "#374151", 
      marginBottom: "8px", 
    },

    input: { 
      width: "100%", 
      boxSizing: "border-box", 
      padding: "12px 14px", 
      border: "1px solid #d1d5db",
      borderRadius: "6px", 
      fontSize: "15px", 
      outline: "none", 
      backgroundColor: "#ffffff", 
    },

    passwordWrapper: { 
      position: "relative", 
    },

    passwordInput: { 
      width: "100%", 
      boxSizing: "border-box", 
      padding: "12px 70px 12px 14px",
      border: "1px solid #d1d5db", 
      borderRadius: "6px", 
      fontSize: "15px", 
      outline: "none", 
    },

    showButton: { 
      position: "absolute", 
      right: "10px", 
      top: "50%", 
      transform: "translateY(-50%)", 
      border: "none", 
      background: "none", 
      color: "#2563eb", 
      cursor: "pointer", 
      fontSize: "13px", 
      fontWeight: "600", 
    },

    loginButton: { 
      width: "100%", 
      padding: "13px", 
      marginTop: "5px",
      border: "none",
      borderRadius: "6px", 
      backgroundColor: "#2563eb", 
      color: "#ffffff", 
      fontSize: "15px",
      fontWeight: "600", 
      cursor: "pointer", 
    },

    footer: { 
      marginTop: "25px", 
      textAlign: "center", 
      fontSize: "13px", 
      color: "#9ca3af", 
    },


  }

  return ( 
  
      <div style={styles.container}> 

        <div style={styles.header}>
          <h1 style={styles.logo}>SIMS System Login</h1>
          <h5>SMART INVENTORY MANAGEMENT SYSTEM</h5>
        </div> 
    
        <form onSubmit={handleLogin}> 

          <div style={styles.formGroup}> 
            <label style={styles.label} htmlFor="username"> Username </label> 
            <input 
              id="username" 
              name="username" 
              type="text" 
              placeholder="ADMIN" 
              value={form.username} 
              onChange={handleChange} 
              style={styles.input} 
              required 
            /> 
          </div> 
          
          <div style={styles.formGroup}>

            <label style={styles.label} htmlFor="password"> 
              Password 
            </label> 
            
            <div style={styles.passwordWrapper}> 
              <input 
                id="password" 
                name="password" 
                value={form.password} 
                onChange={handleChange}
                type={showPassword ? "text" : "password"} 
                placeholder="ADMIN"  
                style={styles.passwordInput} 
                required 
              /> 
              
              <button 
                type="button" 
                style={styles.showButton} 
                onClick={() => setShowPassword(!showPassword)} > 
                {showPassword ? "Hide" : "Show"} 
              </button> 

            </div> 
          </div> 
          
          <button type="submit" style={styles.loginButton}> 
            Login 
          </button>

        </form> 
        
        <div style={styles.footer}> 
          © 2026 SIMS. All rights reserved. 
        </div> 
      </div> 
  );


}