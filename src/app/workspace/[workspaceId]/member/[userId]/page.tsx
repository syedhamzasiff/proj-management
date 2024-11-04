import ProfileLayout from "@/components/layout/ProfileLayout"

interface WorkspaceProfilePageProps {
    params: {
      workspaceId: string
      userId: string
    }
  }
  
  export default function WorkspaceProfilePage({ params }: WorkspaceProfilePageProps) {
    return (
      <ProfileLayout 
        source="workspace" 
        sourceId={params.workspaceId} 
        userId={params.userId} 
      />
    )
  }