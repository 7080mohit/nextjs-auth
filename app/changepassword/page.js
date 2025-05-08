"use client";
import React, { useState, useEffect } from 'react';
import "./style.css";
import Link from 'next/link';
import { useRouter } from 'next/navigation';


const Page = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState(""); // You need to get the user's email somehow
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false); // Track the success state
    const router = useRouter(); // Initialize useRouter

    useEffect(() => {
        if (isSuccess) {
            router.push('/login'); // Redirect to login page after success
        }
    }, [isSuccess, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (newPassword !== confirmPassword) {
            setError("New password and confirmation do not match");
            return;
        }

        if (!email || !oldPassword || !newPassword || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        try {
            // Send password change request to the backend
            const response = await fetch('/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    oldPassword,
                    newPassword,
                    confirmPassword,  // Ensure to send confirmPassword as well
                }),
            });

            const data = await response.json();
            if (response.ok) {
                // Password successfully changed
                alert("Password changed successfully!");
                setIsSuccess(true);  // Set success to true for redirect
            } else {
                setError(data.message || "Error changing password");
            }
        } catch (error) {
            setError("An error occurred while changing password.");
        }
    };

    return (
        <>
            <div className='flex main100 gap-28 mb-14 max-w-screen-lg'>
                <div>
                    <img className='main266' src='/image300.png' alt="Password Change" />
                </div>
                <form className="form" onSubmit={handleSubmit}>
                    <div className="flex-column">
                        <label>Email</label>
                    </div>
                    <div className="inputForm">
                    <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg">
                        <g id="Layer_3" data-name="Layer 3">
                            <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path>
                        </g>
                    </svg>
                        <input 
                            type="email" 
                            className="input" 
                            placeholder="Enter your email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>

                    <div className="flex-column">
                        <label>Old Password</label>
                    </div>
                    <div className="inputForm">
                    <svg height="20" viewBox="-64 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg">
                        <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
                        <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
                    </svg>
                    <input type="text" className="input" placeholder="Enter your Old password" />
                    
                        <input 
                            type="password" 
                            className="input" 
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)} 
                        />
                    </div>

                    <div className="flex-column">
                        <label>New Password</label>
                    </div>
                    <div className="inputForm">
                    <svg height="20" viewBox="-64 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg">
                        <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
                        <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
                    </svg>
                    <input type="text" className="input" placeholder="Enter your New password" />
                        <input 
                            type="password" 
                            className="input" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)} 
                        />
                    </div>

                    <div className="flex-column">
                        <label>Confirm Password</label>
                    </div>
                    <div className="inputForm">
                    <svg height="20" viewBox="-64 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg">
                        <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
                        <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
                    </svg>
                    <input type="text" className="input" placeholder="Enter your Confirm password" />
                        <input 
                            type="password" 
                            className="input" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                        />
                    </div>

                    <div className="error-message">{error && <span>{error}</span>}</div>

                    <div className="btnWrapper">
                        <button type="submit">Change Password</button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default Page;
