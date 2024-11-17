import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { updates } = await req.json();

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { message: 'Invalid payload' },
        { status: 400 }
      );
    }

    
    await prisma.$transaction(
      updates.map(({ taskId, newStatus }) =>
        prisma.task.update({
          where: { id: taskId },
          data: { status: newStatus },
        })
      )
    );

    return NextResponse.json({ message: 'Tasks updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating tasks:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}