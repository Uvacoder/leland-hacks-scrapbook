import Markdown from "./Markdown";
import { File, User } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import ProfilePicture from "./ProfilePicture";

export const ProjectCard = ({
  project,
  className = "",
  noBorder = false,
}: {
  project: {
    id?: string;
    title: string;
    description: string;
    contributors: Pick<User, "id" | "username" | "image">[];
    files: File[];
    ship: boolean | null;
    beginner: boolean | null;
  };
  className?: string;
  noBorder?: boolean;
}) => {
  return (
    <div
      className={`${className} relative mb-4 w-full space-y-4 rounded-lg ${
        noBorder ? "" : "border-2"
      } p-6 dark:bg-gray-800 ${
        noBorder
          ? ""
          : project.ship === true
          ? "border-primary-300"
          : project.ship === false
          ? "border-secondary-300"
          : ""
      }`}
    >
      {project.beginner ? (
        <div className="absolute top-2 right-2 text-2xl">💫</div>
      ) : null}
      {"id" in project ? (
        <Link href={`/post/view/${project.id}`}>
          <a className="mx-auto !mt-0 block w-fit">
            <h2 className="text-center text-xl font-semibold hover:underline">
              {project.title}
            </h2>
          </a>
        </Link>
      ) : (
        <h2 className="!mt-0 text-center text-xl font-semibold">
          {project.title}
        </h2>
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
            <div key={i} className="relative">
              <div className="peer w-8 overflow-hidden rounded-full">
                <ProfilePicture
                  id={contributor.id}
                  username={contributor.username!}
                  image={contributor.image!}
                  variant="small"
                />
              </div>

              <div className="absolute translate-y-[0.5rem] -translate-x-[calc(50%-1rem)] rounded-md px-2 font-semibold opacity-0 transition ease-in-out peer-hover:opacity-100 dark:bg-[#4E4C59]">
                <div className="absolute left-1/2 -z-10 -translate-y-2 -translate-x-[29%] -rotate-180">
                  <div className="h-3 w-3 origin-top-left -rotate-45 transform dark:bg-[#4E4C59]"></div>
                </div>
                @{contributor.username}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
