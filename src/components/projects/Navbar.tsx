// components/Navbar.tsx
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

interface NavbarProps {
  projectName: string;
}

export default function Navbar({ projectName }: NavbarProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">{projectName}</h1>
      <Button variant="outline">
        <Settings className="mr-2 h-4 w-4" />
        Project Settings
      </Button>
    </div>
  )
}
