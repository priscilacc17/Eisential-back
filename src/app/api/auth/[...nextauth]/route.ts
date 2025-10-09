// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth'; // Asegúrate de que la ruta de importación sea correcta

export const { GET, POST } = handlers;