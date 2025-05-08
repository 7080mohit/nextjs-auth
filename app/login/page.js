"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./Style.css";

const Page = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showMessage, setShowMessage] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (message) {
            setShowMessage(true);
            const timer = setTimeout(() => {
                setShowMessage(false);
                setMessage("");
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/auth/Login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.status === 200) {
                setMessage("Login successful!");
                
                // Store login status in localStorage
                localStorage.setItem("isLoggedIn", "true");
                
                // Dispatch event to notify Navbar of login change
                window.dispatchEvent(new Event("storage"));

                // Redirect to dashboard
                router.push("/dashboard");
            } else {
                setMessage(data.message || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Error during login:", error);
            setMessage("An unexpected error occurred. Please try again.");
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <>
            <div className="flex main100 gap-28">
                <div>
                    <img className="main266" src="/image1.png" alt="Image" />
                </div>
                <form className="form" onSubmit={handleSubmit}>
                    {showMessage && (
                        <div className="message-popup text-red-800">
                            <p>{message}</p>
                        </div>
                    )}
                    <div className="flex-column">
                        <label>Email</label>
                    </div>
                    <div className="inputForm">
                        <input
                            type="email"
                            className="input"
                            placeholder="Enter your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex-column">
                        <label>Password</label>
                    </div>
                    <div className="inputForm">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            className="input"
                            placeholder="Enter your Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="show-password-btn mb-3 mr-3"
                        >
                            {passwordVisible ? <img className="imagewe" src={"/eye.png"} /> : <img className="imagewe" src={"/visible.png"} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="main relative px-8 py-2 rounded-md bg-black text-white"
                        style={{ width: '100%' }}
                    >
                        Log In
                    </button>
                </form>
            </div>
        </>
    );
};

export default Page;
