import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useRouter } from "next/navigation";

interface NavbarProps {
  projectName: string;
  href: string;
}

export default function Navbar({ projectName, href }: NavbarProps) {

  const router = useRouter();

  const handleSettingsClick = () => {
    router.push(`${href}/settings`);
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">{projectName}</h1>
    </div>
  )
}
