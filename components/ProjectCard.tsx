import Markdown from "./Markdown";
import { File, User } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import ProfilePicture from "./ProfilePicture";

export const ProjectCard = ({
  project,
  className = "",
}: {
  project: {
    id?: string;
    title: string;
    description: string;
    contributors: Omit<User, "email" | "emailVerified">[];
    files: File[];
  };
  className?: string;
}) => {
  return (
    <div
      className={`${className} mb-4 w-full space-y-4 rounded-lg p-6 dark:bg-gray-800`}
    >
      {"id" in project ? (
        <Link href={`/project/view/${project.id}`}>
          <a className="mx-auto block w-fit">
            <h2 className="text-center text-xl font-semibold hover:underline">
              {project.title}
            </h2>
          </a>
        </Link>
      ) : (
        <h2 className="text-center text-xl font-semibold">{project.title}</h2>
      )}

      {/* {JSON.stringify(project)} */}
      <Markdown>{project.description}</Markdown>
      {project.files.map((file) => {
        return (
          <Image
            className="mx-auto w-full max-w-sm rounded-lg"
            key={file.url}
            src={file.url}
            alt="project image"
            width={file.width}
            height={file.height}
          />
        );
      })}

      <div className="flex space-x-2">
        {project.contributors.map((contributor, i) => {
          return (
            <div key={i}>
              <ProfilePicture
                username={contributor.username!}
                image={contributor.image!}
                className="peer w-8"
              />
              <div className="absolute mt-1 -translate-x-[calc(50%-1rem)] rounded-md px-2 font-semibold opacity-0 transition ease-in-out peer-hover:opacity-100 dark:bg-[#4E4C59]">
                @{contributor.username}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
