"use client";
import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
      
      const [rows] = await connection.execute('SELECT * FROM timetable');
      connection.end();
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  }
}// app/api/auth/ChangePassword/route.js


import { PrismaClient } from '@prisma/client';
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = await req.json();

    // Basic validation: all fields must be provided.
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return new Response(
        JSON.stringify({ message: "All fields are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if new password and confirmation match.
    if (newPassword !== confirmPassword) {
      return new Response(
        JSON.stringify({ message: "New password and confirmation do not match." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Ensure the new password meets criteria (e.g., minimum length).
    if (newPassword.length < 8) {
      return new Response(
        JSON.stringify({ message: "New password must be at least 8 characters long." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find the user by email.
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ message: "User not found." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify that the provided old password matches the stored hashed password.
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password || "");
    if (!isOldPasswordValid) {
      return new Response(
        JSON.stringify({ message: "Old password is incorrect." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash the new password.
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database.
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Return a success response.
    return new Response(
      JSON.stringify({ message: "Password changed successfully!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error during password change:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
