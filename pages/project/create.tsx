import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { File } from "@prisma/client";
import ContributorCard from "../../components/ContributorCard";
import { ProjectCard } from "../../components/ProjectCard";
import { useRouter } from "next/router";
import Link from "next/link";

interface Contributor {
  id: string;
  name: string;
  username: string;
  image: string;
}
const CreateProject = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [contributorSearch, setContributorSearch] = useState("");
  const [contributorSearchError, setContributorSearchError] = useState("");
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loadingContributor, setLoadingContributor] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();

  const { data: session, status } = useSession();

  const searchForUser = async () => {
    setLoadingContributor(true);
    if (contributorSearch.length === 0) {
      setLoadingContributor(false);
      return;
    }
    if (
      contributors.find((c) => c.username === contributorSearch) ||
      contributorSearch === session!.user?.username
    ) {
      setContributorSearch("");
      setContributorSearchError("");
      setLoadingContributor(false);
      return;
    }
    const res = await fetch("/api/search-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: contributorSearch.trim() }),
    });
    if (!res.ok) {
      if (res.status == 404) {
        setContributorSearchError(
          "User not found. Make sure you entered the username correctly."
        );
        setLoadingContributor(false);
      } else {
        setContributorSearchError("Something went wrong :(. Please try again.");
        setLoadingContributor(false);
      }
    } else {
      setContributorSearchError("");
      const contributor = await res.json();
      setContributors((cList) => [...cList, contributor]);
      setContributorSearch("");
      setLoadingContributor(false);
    }
  };

  const removeContributor = (contributorId: string) => {
    setContributors((cList) => cList.filter((c) => c.id !== contributorId));
  };

  const createProject = async () => {
    await fetch("/api/create-project", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        contributors: contributors.map((c) => c.id),
        files,
      }),
    });
  };

  if (status === "loading") {
    return null;
  }
  if (status === "unauthenticated") {
    return (
      <p className="mt-4 px-4 text-center text-xl">
        Please{" "}
        <Link href="/sign-in">
          <a className="dark:text-primary-200 hover:dark:text-primary-300">
            sign in
          </a>
        </Link>{" "}
        to post.
      </p>
    );
  }

  return (
    <div className="px-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-x-8 lg:flex-row">
        <div className="flex-grow space-y-8">
          <div className="flex flex-col">
            <label htmlFor="title" className="font-semibold">
              Title of Project
            </label>
            <input
              type="text"
              id="title"
              className="rounded-lg border-2 px-2 py-1 dark:border-primary-200 dark:bg-gray-800"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y flex flex-col">
            <label htmlFor="description" className="font-semibold">
              Description
            </label>
            <textarea
              id="description"
              className="rounded-lg border-2 px-2 py-1 dark:border-primary-200 dark:bg-gray-800"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y flex flex-col">
              <label htmlFor="contributors" className="font-semibold">
                Contributors
              </label>
              <div className="relative h-full before:absolute before:left-2 before:top-1 before:content-['@']">
                <input
                  id="contributors"
                  type="text"
                  value={contributorSearch}
                  disabled={loadingContributor}
                  onChange={(e) => setContributorSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      searchForUser();
                    }
                  }}
                  placeholder="Type a username here, then press enter."
                  className="w-full rounded-lg border-2 py-1 pl-4 pr-2 disabled:cursor-not-allowed disabled:text-gray-400 dark:border-primary-200 dark:bg-gray-800"
                />
              </div>
              {contributorSearchError.length > 0 ? (
                <p className="mt-1 text-sm text-red-300">
                  {contributorSearchError}
                </p>
              ) : null}
            </div>

            <div className="space-y-4">
              <ContributorCard
                username={session!.user.username}
                image={session!.user.image}
                id={session!.user.id}
              />
              {contributors.map((contributor) => {
                return (
                  <ContributorCard
                    {...contributor}
                    key={contributor.id}
                    onDelete={() => removeContributor(contributor.id)}
                  />
                );
              })}
            </div>
          </div>

          <input
            name="image"
            type="file"
            className="mx-auto block w-full"
            accept="image/*, video*/"
            multiple
            onChange={async (e) => {
              if (e.target.files) {
                setUploadingImage(true);
                const fd = new FormData();
                Array.from(e.target.files).forEach((file, i) => {
                  fd.append(file.name, file);
                });

                const media = await fetch("/api/upload-files", {
                  method: "POST",
                  body: fd,
                });

                const newFiles = await media.json();
                setFiles((f) => [...f, ...newFiles]);
                e.target.value = "";
                setUploadingImage(false);
                // console.log(e.target.files);
              }
            }}
          />

          {files.map((file: any) => {
            return (
              <div key={file.url}>
                <img className="w-32" src={file.url} alt="uploaded image" />
              </div>
            );
          })}

          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              await createProject();
              router.push("/");
            }}
            className="rounded-md bg-secondary-300 px-4 py-1.5 text-black duration-300 hover:duration-100 enabled:hover:bg-primary-200 disabled:saturate-50"
            disabled={
              title.trim().length === 0 ||
              description.trim().length === 0 ||
              files.length === 0 ||
              loadingContributor ||
              uploadingImage
            }
          >
            Submit
          </button>
        </div>

        <div className="w-full max-w-md">
          <ProjectCard
            project={{
              title: title.length > 0 ? title : "[Your title here!]",
              description:
                description.length > 0
                  ? description
                  : `Your description here!
Markdown is supported.

Use \`#\` to create headings, like so:
# Heading 1

You can also \\*\\***bold**\\*\\*, \\**italicize*\\*, and \\~\\~~~strikethrough~~\\~\\~ text.

Add links like this: \\[[Leland Hacks Website](https://lelandhacks.com)\\](https://lelandhacks.com)
`,
              contributors: [session!.user, ...contributors],
              files,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
