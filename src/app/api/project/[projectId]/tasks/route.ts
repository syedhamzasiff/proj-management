import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const view = req.nextUrl.searchParams.get("view") || "list";

  try {
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignments: {
          include: { user: true },
        },
      },
      orderBy: { priority: "desc" }, 
    });

   
    let responseData;
    if (view === "kanban") {
      const grouped = tasks.reduce((acc, task) => {
        acc[task.status] = acc[task.status] || [];
        acc[task.status].push(task);
        return acc;
      }, {} as Record<string, any[]>);

      responseData = Object.entries(grouped).map(([status, tasks]) => ({
        status,
        tasks,
      }));
    } else if (view === "calendar") {
      responseData = tasks
        .filter((task) => task.due_date)
        .map((task) => ({
          id: task.id,
          title: task.title,
          due_date: task.due_date,
          isCompleted: task.isCompleted,
          priority: task.priority,
        }));
    } else {
      responseData = tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        isCompleted: task.isCompleted,
        isPinned: task.isPinned,
        priority: task.priority,
        due_date: task.due_date,
        assignedUsers: task.assignments.map((assignment) => ({
          id: assignment.user.id,
          name: assignment.user.name,
        })),
      }));
    }

    return NextResponse.json({ data: responseData });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}
