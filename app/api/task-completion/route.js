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
}
import prisma from '@/lib/prisma';

// Get task completions for a user on a specific date
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');

    // Validate required parameters
    if (!userId || !date || isNaN(userId)) {
      return Response.json(
        { success: false, error: "Missing or invalid required parameters" },
        { status: 400 }
      );
    }

    // Parse date
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      return Response.json(
        { success: false, error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Query completions for this user and date
    const completions = await prisma.taskCompletion.findMany({
      where: {
        user_id: parseInt(userId),
        date: {
          gte: new Date(queryDate.setHours(0, 0, 0, 0)),
          lt: new Date(queryDate.setHours(23, 59, 59, 999))
        }
      }
    });

    return Response.json({ success: true, completions });
  } catch (error) {
    console.error('Error fetching task completions:', error);
    return Response.json(
      { success: false, error: error.message || 'Database operation failed' },
      { status: 500 }
    );
  }
}

// Toggle a task completion status (create if not exists, update if exists)
export async function POST(request) {
  try {
    const { userId, taskId, date, completed } = await request.json();
    
    // Validate required fields
    if (!userId || !taskId || !date) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse date
    const taskDate = new Date(date);
    if (isNaN(taskDate.getTime())) {
      return Response.json(
        { success: false, error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Check if record already exists
    const existingCompletion = await prisma.taskCompletion.findFirst({
      where: {
        user_id: Number(userId),
        task_id: taskId,
        date: {
          gte: new Date(taskDate.setHours(0, 0, 0, 0)),
          lt: new Date(taskDate.setHours(23, 59, 59, 999))
        }
      }
    });

    let result;
    
    if (existingCompletion) {
      // Update existing completion status
      result = await prisma.taskCompletion.update({
        where: { id: existingCompletion.id },
        data: { completed: completed !== undefined ? completed : !existingCompletion.completed }
      });
    } else {
      // Create new completion record
      result = await prisma.taskCompletion.create({
        data: {
          user_id: Number(userId),
          task_id: taskId,
          date: taskDate,
          completed: completed !== undefined ? Boolean(completed) : true
        }
      });
    }
    
    return Response.json(
      { success: true, completion: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { success: false, error: error.message || 'Database operation failed' },
      { status: 500 }
    );
  }
}

// Delete a task completion
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const completionId = searchParams.get('id');

    if (!completionId || isNaN(completionId)) {
      return Response.json(
        { success: false, error: "Invalid completion ID" },
        { status: 400 }
      );
    }

    await prisma.taskCompletion.delete({
      where: { id: parseInt(completionId) }
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting task completion:', error);
    return Response.json(
      { success: false, error: error.message || 'Database operation failed' },
      { status: 500 }
    );
  }
} 