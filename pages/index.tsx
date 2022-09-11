import { useSession, signIn, signOut } from "next-auth/react";
import { ProjectCard } from "../components/ProjectCard";
import Masonry from "react-masonry-css";
import prisma from "../lib/db";
import Link from "next/link";
import { File, Project, User } from "@prisma/client";
import { ProjectGrid } from "../components/ProjectGrid";

export type ProjectCardType = Project & {
  contributors: User[];
  files: File[];
};

export default function Home({ projects }: { projects: ProjectCardType[] }) {
  return (
    <div className="px-4">
      <div className="mx-auto max-w-md sm:max-w-7xl">
        <h1 className="text-center text-3xl text-primary-200">
          Leland Hacks Scrapbook
        </h1>
        <h2 className="mb-8 text-center text-primary-50">
          Check out what everyone&apos;s working on and shipping at Leland
          Hacks!
        </h2>
        {projects.length === 0 ? (
          <p className="mt-4 text-center text-xl">
            No posts yet. Why don&apos;t you{" "}
            <Link href="/project/create">
              <a className="dark:text-primary-200 dark:hover:text-primary-300">
                create your own
              </a>
            </Link>
            ?
          </p>
        ) : (
          <ProjectGrid>
            {projects.map((project) => {
              return <ProjectCard key={project.id} project={project} />;
            })}
          </ProjectGrid>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  let projects = await prisma.project.findMany({
    include: {
      contributors: {
        select: {
          name: true,
          username: true,
          image: true,
          id: true,
        },
      },
      files: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    props: { projects }, // will be passed to the page component as props
  };
}
