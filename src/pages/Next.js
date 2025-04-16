//src>>pages>>Next.js
import { useRouter } from 'next/router';

const ProjectsPage = () => {
  const router = useRouter();

  const handleCreateProject = () => {
    router.push('/CreateProjectt'); // Use router.push() instead of navigate()
  };

  return <button onClick={handleCreateProject}>+ Create</button>;
};
