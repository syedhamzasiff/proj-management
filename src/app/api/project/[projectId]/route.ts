import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const par = await params
    const projectId = par.projectId

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const taskStatistics = {
      total: project.tasks.length,
      completed: project.tasks.filter(task => task.status === 'DONE').length,
      inProgress: project.tasks.filter(task => task.status === 'IN_PROGRESS').length,
      notStarted: project.tasks.filter(task => task.status === 'TODO' || task.status === 'BACKLOG').length,
    }

    const taskTypeStatistics = project.tasks.reduce(
      (acc, task) => {
        acc[task.type] = (acc[task.type] || 0) + 1
        return acc
      },
      { FEATURE: 0, BUG: 0, TASK: 0 }
    )

    const response = {
      name: project.name,
      progress: Math.round((taskStatistics.completed / taskStatistics.total) * 100) || 0,
      tasks: {
        byStatus: taskStatistics,
        byType: taskTypeStatistics,
        list: project.tasks.map(task => ({
          id: task.id,
          title: task.title,
          type: task.type,
          status: task.status,
          priority: task.priority,
          dueDate: task.due_date,
          description: task.description,
        })),
      },
      team: project.members.map(member => ({
        name: member.user.name,
        avatar: member.user.avatar_url,
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching project data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
