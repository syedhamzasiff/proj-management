import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Zap, Users, BarChart2, Calendar, Kanban, Clock, Presentation } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 z-50 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
          <Link className="flex items-center space-x-2" href="/">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Projectify</span>
          </Link>
          <nav className="flex items-center space-x-8">
            <Link className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#features">
              Features
            </Link>
            <Link className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#about">
              About
            </Link>
            <Link className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#contact">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero section */}
        <section className="w-full pt-32 pb-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-3xl mx-auto">
                Streamline Your Projects with Projectify
              </h1>
              <p className="mt-6 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Boost productivity, collaborate seamlessly, and deliver projects on time with our comprehensive project management tool.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button size="lg">
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline">
                  <Link href="#features">Explore Features</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="w-full py-20 bg-gray-50 dark:bg-gray-800/50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Comprehensive Features
              </h2>
              <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Everything you need to manage your projects effectively
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {features.map((feature, index) => (
                <Card key={index} className="border-2 hover:border-primary transition-colors w-full max-w-sm">
                  <CardHeader className="space-y-2">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 dark:text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 bg-gray-100 dark:bg-gray-900 border-t">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Projectify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
    title: "Task Management",
    description: "Assign, track, and manage tasks with ease to keep your team aligned and productive."
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "Collaboration",
    description: "Collaborate seamlessly with team members and share updates in real time."
  },
  {
    icon: <Calendar className="h-6 w-6 text-primary" />,
    title: "Scheduling",
    description: "Set deadlines and milestones to ensure timely completion of projects."
  },
  {
    icon: <BarChart2 className="h-6 w-6 text-primary" />,
    title: "Analytics",
    description: "Gain insights with project analytics and track your team's performance."
  },
  {
    icon: <Kanban className="h-6 w-6 text-primary" />,
    title: "Kanban Board",
    description: "Organize tasks visually with a fully customizable Kanban board."
  },
  {
    icon: <Presentation className="h-6 w-6 text-primary" />,
    title: "White Board",
    description: "Lay down your ideas on a whiteboard near your project - all in one place"
  }
]