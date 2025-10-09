import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface Params {
  params: { taskId: string };
}

// Para verificar si la tarea pertenece al usuario
async function checkTaskOwnership(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
        where: { id: taskId, user_id: userId },
    });
    return task;
}

// Actualizar tarea (incluye mover en matriz - RF5)
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { taskId } = params;

  try {
    // 1. Verificar propiedad de la tarea
    if (!(await checkTaskOwnership(taskId, userId))) {
        return NextResponse.json({ message: 'Task not found or unauthorized' }, { status: 404 });
    }

    // 2. Ejecutar la actualización
    const body = await req.json();
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...body, // Permite actualizar cualquier campo
        due_date: body.due_date ? new Date(body.due_date) : undefined,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    return NextResponse.json({ message: 'Failed to update task' }, { status: 500 });
  }
}

// Eliminar tarea (CRUD)
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { taskId } = params;

  try {
    // 1. Verificar propiedad de la tarea
    const result = await prisma.task.deleteMany({
      where: { id: taskId, user_id: userId },
    });
    
    // Si no se eliminó ninguna fila, es porque la tarea no existe o no pertenece al usuario.
    if (result.count === 0) {
        return NextResponse.json({ message: 'Task not found or unauthorized' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); 
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    return NextResponse.json({ message: 'Failed to delete task' }, { status: 500 });
  }
}