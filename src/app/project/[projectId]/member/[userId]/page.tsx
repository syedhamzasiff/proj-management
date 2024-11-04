import ProfileLayout from "@/components/layout/ProfileLayout"

interface ProjectProfilePageProps {
    params: {
      projectId: string
      userId: string
    }
  }
  
  export default function ProjectProfilePage({ params }: ProjectProfilePageProps) {
    return (
      <ProfileLayout 
        source="project" 
        sourceId={params.projectId} 
        userId={params.userId} 
      />
    )
  }