import ProfileLayout from "@/components/layout/ProfileLayout"

interface ProfilePageProps {
  params: {
    userId: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return (
    <ProfileLayout 
      source="global" 
      userId={params.userId} 
    />
  )
}