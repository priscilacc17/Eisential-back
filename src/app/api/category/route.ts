import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const USER_ID_TEMPORAL = 'tu_user_id_temporal'; // ⚠️ REEMPLAZAR en SPRINT 2 con NextAuth

// Manejador para GET: Obtener todas las categorías
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        user_id: USER_ID_TEMPORAL,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Failed to fetch categories' }, { status: 500 });
  }
}

// Manejador para POST: Crear una nueva categoría
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, color } = body;

    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        color: color || undefined,
        user_id: USER_ID_TEMPORAL, // Asignación temporal
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ message: 'Failed to create category' }, { status: 500 });
  }
}