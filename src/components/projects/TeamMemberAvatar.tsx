import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TeamMember {
  name: string
  avatar: string
}

interface TeamMemberAvatarProps {
  members: TeamMember[]
}

export default function TeamMemberAvatar({ members }: TeamMemberAvatarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex -space-x-2">
          {members.map((member, index) => (
            <Avatar key={index} className="border-2 border-background">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}