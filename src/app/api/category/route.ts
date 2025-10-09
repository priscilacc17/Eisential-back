// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth'; // <-- Importación del helper de autenticación

// Manejador para GET: Obtener todas las categorías
export async function GET() {
  const session = await auth(); 
  
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;

  try {
    const categories = await prisma.category.findMany({
      where: {
        user_id: userId, // <-- Filtrar por el ID del usuario autenticado
      },
      orderBy: { name: 'asc' },
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Failed to fetch categories' }, { status: 500 });
  }
}

// Manejador para POST: Crear una nueva categoría (RF3)
export async function POST(req: NextRequest) {
  const session = await auth(); 
  
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;

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
        user_id: userId, // <-- Asignar el ID del usuario autenticado
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ message: 'Failed to create category' }, { status: 500 });
  }
}