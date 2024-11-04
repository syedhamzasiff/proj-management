
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { workspaceId } = req.query;

  // Placeholder data - replace with actual data fetching logic
  const projects = [
    { id: '1', name: 'Project Alpha', progress: 60, description: 'Alpha Project' },
    { id: '2', name: 'Project Beta', progress: 30, description: 'Beta Project' },
    { id: '3', name: 'Project Gamma', progress: 85, description: 'Gamma Project' },
  ];

  res.status(200).json(projects);
}
