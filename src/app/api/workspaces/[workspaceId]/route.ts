import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { workspaceId: string } }) {
  const { workspaceId } = await params;

  try {
    // Fetch the workspace with members, projects, and tasks
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: true, // Includes user details for each member
          },
        },
        projects: {
          include: {
            tasks: true, // Includes tasks for each project
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Calculate statistics and format the response
    const formattedWorkspace = {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description || null,
      type: workspace.members.length > 1 ? 'shared' : 'personal',
      stats: {
        totalProjects: workspace.projects.length,
        completedProjects: workspace.projects.filter((project) => project.status === 'completed').length,
        totalTasks: workspace.projects.reduce((acc, project) => acc + project.tasks.length, 0),
        completedTasks: workspace.projects.reduce(
          (acc, project) => acc + project.tasks.filter((task) => task.status === 'DONE').length,
          0
        ),
      },
      owner: workspace.members.find(member => member.workspaceRole === 'LEADER')?.user || null,
      members: workspace.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        avatar: member.user.avatar_url || null,
        online: member.user.is_active,
      })),

      projects: workspace.projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description || null,
        progress: calculateProjectProgress(project.tasks),
        totalTasks: project.tasks.length,
        completedTasks: project.tasks.filter((task) => task.status === 'DONE').length,
      })),
    };

    return NextResponse.json(formattedWorkspace);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json({ error: 'Failed to fetch workspace data' }, { status: 500 });
  }
}

function calculateProjectProgress(tasks: Array<{ status: string }>) {
  const completedTasks = tasks.filter((task) => task.status === 'DONE').length;
  return tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
}
