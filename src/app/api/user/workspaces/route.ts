import { NextResponse } from 'next/server'
import  prisma  from '@/lib/prisma'  


export async function GET() {
  try {
    const workspaces = await prisma.workspace.findMany({
      include: {
        members: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    })

    const responseWorkspaces = workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      members: workspace.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        avatarUrl: member.user.avatar_url || '',  
      })),
      isPersonal: workspace.members.length === 1, 
    }))

    return NextResponse.json(responseWorkspaces)
  } catch (error) {
    console.error(error)
    return NextResponse.error()
  }
}
