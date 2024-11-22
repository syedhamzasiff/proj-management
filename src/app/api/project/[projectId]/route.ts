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

    const currentSprint = {
      name: 'Current Sprint', // You might want to add a sprint model to your schema if you need more detailed sprint information
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Assuming 2-week sprints
    }

    const response = {
      name: project.name,
      progress: Math.round((taskStatistics.completed / taskStatistics.total) * 100) || 0,
      tasks: taskStatistics,
      team: project.members.map(member => ({
        name: member.user.name,
        avatar: member.user.avatar_url,
      })),
      timeTracked: '0h 0m', 
      currentSprint: currentSprint,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching project data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
