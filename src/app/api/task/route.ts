import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const USER_ID_TEMPORAL = 'tu_user_id_temporal'; // ⚠️ REEMPLAZAR en SPRINT 2 con NextAuth

// Manejador para GET: Obtener todas las tareas (Backlog)
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        user_id: USER_ID_TEMPORAL, // Filtrar por usuario (clave temporal)
      },
      orderBy: { created_at: 'desc' },
      include: { category: true }, // Incluir información de la categoría
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ message: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// Manejador para POST: Crear una nueva tarea (RF2)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, due_date, category_id, quadrant, position } = body;

    if (!title) { // Validación básica (RF2: título obligatorio)
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        // Conversión de fecha si es necesario
        due_date: due_date ? new Date(due_date) : null,
        user_id: USER_ID_TEMPORAL, // Asignación temporal
        category_id: category_id || undefined,
        // Valores iniciales para Matriz (RF5)
        quadrant: quadrant || 'B', // Por defecto en 'Backlog' o un cuadrante inicial
        position: position || 0,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ message: 'Failed to create task' }, { status: 500 });
  }
}

