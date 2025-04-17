import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { jwtDecode } from "jwt-decode"; // Ensure jwt-decode is installed (npm install jwt-decode)

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Track form submission state
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true); // Disable button while submitting

    const url = isLogin
      ? "https://activus-server-production.up.railway.app/api/auth/login"
      : "https://activus-server-production.up.railway.app/api/auth/register";
    const payload = isLogin
      ? { username, password, role }
      : { username, password, emailId: email, role };

    try {
      if (!username || !password || (isLogin && !role)) {
        setError("Please fill in all fields.");
        setIsSubmitting(false);
        return;
      }

      console.log("Sending request to URL:", url);
      console.log("Payload:", payload);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response received:", response);

      const data = await response.json();
      console.log("Data received:", data);

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      if (isLogin) {
        const decodedToken = jwtDecode(data.data);
        console.log("Decoded token:", decodedToken);

        const userRole = decodedToken.role;
        if (!userRole) throw new Error("Role not found in the token");

        localStorage.setItem("token", data.data);
        localStorage.setItem("role", userRole);

        switch (userRole) {
          case "PM":
            router.push("/tds");
            break;
          case "SUPER_ADMIN":
            router.push("/UserApproval");
            break;
          case "L2":
            router.push("/TDSFinalApproval");
            break;
          case "L1":
            router.push("/L1TDSApproval");
            break;
          case "L3":
            router.push("/L3TDSApproval");
            break;
          case "BU":
            router.push("/BUTDSApproval");
            break;
          case "SME":
            router.push("/SMEValidateDocument");
            break;
          case "Contractor":
            router.push("/ContractorFullyApprovedTDS");
            break;
          default:
            router.push("/ProjectsPage");
        }
      } else {
        alert("User Created Successfully! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Error during login/signup:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false); // Re-enable button after submission
    }
  };

  const styles = {
    input: {
      width: "100%",
      padding: "0.7rem",
      marginBottom: "1rem",
      border: "1px solid #D1D5DB",
      borderRadius: "8px",
      fontSize: "14px",
      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      "&:focus": {
        borderColor: "#48C9B0",
        boxShadow: "0 0 8px rgba(72,201,176,0.4)",
      },
    },
    button: {
      width: "100%",
      padding: "0.8rem",
      background: "linear-gradient(to right, #0E7C85, #1BA098)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "600",
      textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
      transition: "all 0.3s ease",
      "&:hover": {
        background: "linear-gradient(to right, #066E75, #159D8B)",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      },
      "&:disabled": {
        background: "#D1D5DB",
        cursor: "not-allowed",
      },
    },
  };

  return (
    <div
      style={{
        background: "linear-gradient(to bottom right, #0A3D62, #67E6DC)",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          padding: "2rem",
          borderRadius: "15px",
          width: "400px",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "#117285",
            marginBottom: "1.5rem",
            fontWeight: "600",
          }}
        >
          {isLogin ? "Login" : "Signup"}
        </h2>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: "0.7rem",
              border: "none",
              backgroundColor: isLogin ? "#117285" : "white",
              color: isLogin ? "white" : "#117285",
              cursor: "pointer",
              borderRadius: "5px 0 0 5px",
              border: "1px solid #117285",
              fontWeight: "500",
            }}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: "0.7rem",
              border: "1px solid #117285",
              backgroundColor: !isLogin ? "#117285" : "white",
              color: !isLogin ? "white" : "#117285",
              cursor: "pointer",
              borderRadius: "0 5px 5px 0",
              fontWeight: "500",
            }}
          >
            Signup
          </button>
        </div>
        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          {isLogin && (
            <input
              type="text"
              placeholder="Role (e.g., PM, SME, etc.)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.input}
            />
          )}
          {!isLogin && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          )}
          {isLogin && (
            <a
              href="#"
              style={{
                color: "#117285",
                display: "block",
                marginBottom: "1rem",
                fontWeight: "500",
              }}
            >
              Forgot password?
            </a>
          )}
          <button type="submit" style={styles.button} disabled={isSubmitting}>
            {isLogin ? "Login" : "Signup"}
          </button>
        </form>
        <p style={{ marginTop: "1rem" }}>
          {isLogin ? "Not a member?" : "Already have an account?"}{" "}
          <Link href={isLogin ? "/register" : "/login"} legacyBehavior>
  <a style={{ color: "#117285", fontWeight: "500" }}>
    {isLogin ? "Signup now" : "Login"}
  </a>
</Link>
          
        </p>
      </div>
    </div>
  );
};

export default Login;
