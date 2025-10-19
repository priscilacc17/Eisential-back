import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// Obtener todas las tareas (Backlog)
export async function GET() {
  const session = await getSession(); // Obtener sesión
  
  if (!session?.user?.id) { // Verificar sesión
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        user_id: userId, // Filtrar por ID
      },
      orderBy: { created_at: 'desc' },
      include: { category: true },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ message: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// Crear una nueva tarea (RF2)
export async function POST(req: NextRequest) {
  const session = await getSession(); // Obtener sesión
  
  if (!session?.user?.id) { // Verificar sesión
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;

  try {
    const body = await req.json();
    const { title, description, due_date, category_id, quadrant, position } = body;

    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        due_date: due_date ? new Date(due_date) : null,
        user_id: userId, // Asignar el ID del usuario
        category_id: category_id || undefined,
        quadrant: quadrant || 'B',
        position: position || 0,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ message: 'Failed to create task' }, { status: 500 });
  }
}