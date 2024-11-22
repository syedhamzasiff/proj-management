import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProjectSettingsPageProps {
  params: {
    projectId: string;
  };
}

export default function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  const { projectId } = params;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Project Settings</h1>
      <p className="text-lg">Manage settings for project ID: <strong>{projectId}</strong></p>

      {/* Example sections - customize as needed */}
      <div className="mt-6 space-y-4">
        <section>
          <h2 className="text-xl font-semibold">General Settings</h2>
          <p>Update project name, description, and other general details.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Permissions</h2>
          <p>Manage user access and permissions for this project.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Notifications</h2>
          <p>Customize notification preferences for project updates.</p>
        </section>
      </div>
    </div>
  );
}
