import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { workspaceId: string } }) {

    const { workspaceId } = await params;
  
    try {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
          members: {
            include: {
              user: true,
            },
          },
          projects: {
            include: {
              tasks: true,
            },
          },
        },
      });
  
      if (!workspace) {
        return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
      }
  
      const formattedWorkspace = {
        id: workspace.id,
        name: workspace.name,
        type: workspace.members.length > 1 ? 'shared' : 'personal',
        stats: {
          totalProjects: workspace.projects.length,
          completedProjects: workspace.projects.filter((project) => project.status === 'completed').length,
          totalTasks: workspace.projects.reduce((acc, project) => acc + project.tasks.length, 0),
          completedTasks: workspace.projects.reduce((acc, project) => acc + project.tasks.filter((task) => task.status === 'DONE').length, 0),
        },
        owner: workspace.members.find((member) => member.role === 'owner')?.user,
        members: workspace.members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          avatar: member.user.avatar_url,
          online: member.user.is_active,
        })),
        projects: workspace.projects.map((project) => ({
          id: project.id,
          name: project.name,
          progress: calculateProjectProgress(project.tasks),
          completedTasks: project.tasks.filter((task) => task.status === 'DONE').length,
          tasks: project.tasks.length,
        })),
        activities: getRecentActivities(workspaceId),
      };

      
      const response =  NextResponse.json(formattedWorkspace);
      //console.log(formattedWorkspace)
      //console.log(response)

      return response;

    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch workspace data' }, { status: 500 });
    }
  }
function calculateProjectProgress(tasks: Array<{ status: string }>) {
  const completedTasks = tasks.filter((task) => task.status === 'DONE').length;
  return tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
}

function getRecentActivities(workspaceId: string) {
  return [
    { id: 'activity1', user: 'Jane Doe', action: 'updated', project: 'Project A', time: '2 hours ago' },
    { id: 'activity2', user: 'John Smith', action: 'completed', project: 'Project B', time: '1 day ago' },
  ];
}