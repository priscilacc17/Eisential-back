import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tipado para los parámetros dinámicos de la ruta
interface Params {
  params: { taskId: string };
}

// Manejador para PATCH/PUT: Actualizar tarea (incluye mover en matriz - RF5)
export async function PATCH(req: NextRequest, { params }: Params) {
  const { taskId } = params;
  try {
    const body = await req.json();
    const { title, description, due_date, quadrant, position, category_id, completed } = body;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        due_date: due_date ? new Date(due_date) : undefined,
        category_id: category_id || undefined,
        quadrant, // Cuadrante para la Matriz de Eisenhower (RF5)
        position, // Posición para la Matriz de Eisenhower (RF5)
        completed, // Clave para marcar como completada (RF8 - Sprint 3, pero bueno tenerlo)
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    return NextResponse.json({ message: 'Failed to update task' }, { status: 500 });
  }
}

// Manejador para DELETE: Eliminar tarea (CRUD)
export async function DELETE(req: NextRequest, { params }: Params) {
  const { taskId } = params;
  try {
    await prisma.task.delete({
      where: { id: taskId },
    });

    return new NextResponse(null, { status: 204 }); 
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    return NextResponse.json({ message: 'Failed to delete task' }, { status: 500 });
  }
}