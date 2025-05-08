"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Get current page path

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const pathname = usePathname(); // Get current page path

    useEffect(() => {
        // Function to check login status
        const checkLoginStatus = () => {
            setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
        };

        checkLoginStatus(); // Initial check

        // Listen for login changes from Page.js
        window.addEventListener("storage", checkLoginStatus);

        return () => {
            window.removeEventListener("storage", checkLoginStatus);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
        window.dispatchEvent(new Event("storage")); // Notify other components
    };

    return (
        <div className="m-5 p-5 flex justify-between">
            <div className="right">
                <div className="flex">
                    <Link href={"/"}>
                        <svg
                            className="logo w-9 mb-5 h-9"
                            viewBox="0 0 200 200"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M158.026 23.5H41.974C31.771 23.5 23.5 31.771 23.5 41.974v116.052c0 10.203 8.271 18.474 18.474 18.474h116.052c10.203 0 18.474-8.271 18.474-18.474V41.974c0-10.203-8.271-18.474-18.474-18.474zM62.37 125.347c-8.382 1.206-16.154-4.611-17.36-12.992s4.611-16.154 12.992-17.36c8.382-1.206 16.154 4.611 17.36 12.992s-4.61 16.154-12.992 17.36zm89.787-43.89-47.193 63.061a14.978 14.978 0 0 1-12.021 6.014c-3.127 0-6.279-.974-8.976-2.992-6.633-4.964-7.985-14.364-3.022-20.997l47.193-63.061c4.964-6.633 14.363-7.985 20.997-3.022 6.632 4.964 7.985 14.365 3.022 20.997z"
                                fill="#111010"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
            <div className="left">
                <ul className="flex gap-5">
                    <li className="mt-1">Home</li>
                    <li className="mt-1">Contacts</li>
                    <li className="mt-1">Notifications</li>

                    {isLoggedIn ? (
                        <li className="w-8 h-8 cursor-pointer" onClick={handleLogout}>
                            <div className="flex gap-1">
                                <img src="/usericon.png" alt="User" />
                                <img className="main w-4 h-4" src="/down.png" alt="Dropdown" />
                            </div>
                        </li>
                    ) : (
                        <Link href="/login">
                            <li className="tool mt-1 mb-7 ml-4">
                                <button className="mb-20 relative px-8 py-2 rounded-md bg-white border-2 border-zinc-950">
                                    Login
                                </button>
                            </li>
                        </Link>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Navbar;
