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
}// app/api/auth/Logout/route.js

import { parse as parseCookie, serialize as serializeCookie } from 'cookie';

export async function POST(req) {
  try {
    // Expire the session cookie
    const logoutCookie = cookie.serialize('user_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      expires: new Date(0), // Set cookie expiration to the past
      path: '/',
    });

    return new Response(
      JSON.stringify({ message: "Logged out successfully" }),
      {
        status: 200,
        headers: {
          'Set-Cookie': logoutCookie,
        },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
