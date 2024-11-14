import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const generateRandomString = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

const generateRandomDate = (startDate: Date, endDate: Date) => {
  const startTimestamp = startDate.getTime()
  const endTimestamp = endDate.getTime()
  return new Date(Math.random() * (endTimestamp - startTimestamp) + startTimestamp)
}

const createUser = async () => {
  return await prisma.user.create({
    data: {
      email: `${generateRandomString(8)}@gmail.com`,
      password_hash: generateRandomString(16),
      name: generateRandomString(8),
      avatar_url: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`,
    },
  })
}

const createTask = async (projectId: string) => {
  return await prisma.task.create({
    data: {
      projectId,
      title: generateRandomString(10),
      description: generateRandomString(20),
      status: 'TODO',
      isPinned: true,
      priority: Math.floor(Math.random() * 5) + 1,
      due_date: generateRandomDate(new Date(), new Date(2025, 12, 31)),
    },
  })
}

const createProject = async (workspaceId: string) => {
  return await prisma.project.create({
    data: {
      workspaceId,
      name: generateRandomString(10),
      description: generateRandomString(30),
      status: 'IN_PROGRESS',
      start_date: new Date(),
      end_date: generateRandomDate(new Date(), new Date(2025, 12, 31)),
    },
  })
}

const createWorkspace = async () => {
  return await prisma.workspace.create({
    data: {
      name: generateRandomString(10),
      description: generateRandomString(30),
    },
  })
}

const assignTaskToUser = async (taskId: string, userId: string) => {
  await prisma.taskAssignment.create({
    data: {
      taskId,
      userId,
    },
  })
}

const main = async () => {
  const users = []
  const workspaces = []
  const projects = []
  const tasks = []

  // Find or create "Hamza" user
  let hamza = await prisma.user.findUnique({
    where: {
      email: 'one@one.com', // Adjust this if you have a different way to identify Hamza
    },
  })

  if (!hamza) {
    hamza = await prisma.user.create({
      data: {
        email: 'hamza@example.com', // Custom email for Hamza
        password_hash: generateRandomString(16),
        name: 'Hamza',
        avatar_url: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`,
      },
    })
  }

  console.log('Hamza User ID:', hamza.id)

  // Create 5 workspaces
  for (let i = 0; i < 5; i++) {
    const workspace = await createWorkspace()
    workspaces.push(workspace)
  }

  // Create 10 projects (assigned to workspaces)
  for (let i = 0; i < 10; i++) {
    const workspaceId = workspaces[Math.floor(Math.random() * workspaces.length)].id
    const project = await createProject(workspaceId)
    projects.push(project)
  }

  // Create 20 tasks (assigned to projects)
  for (let i = 0; i < 20; i++) {
    const projectId = projects[Math.floor(Math.random() * projects.length)].id
    const task = await createTask(projectId)
    tasks.push(task)
  }

  // Assign all tasks to Hamza (your user ID)
  for (let i = 0; i < tasks.length; i++) {
    const taskId = tasks[i].id
    const userId = hamza.id
    await assignTaskToUser(taskId, userId)
  }

  console.log('Data seeded successfully with tasks assigned to Hamza!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
