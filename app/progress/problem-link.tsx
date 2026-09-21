"use client";

type Props = {
  problemId: number;
  username: string;
  title: string;
  leetcodeUrl: string;
  solved: boolean;
};

export default function ProblemLink({
  title,
  leetcodeUrl,
  solved,
}: Props) {
  return (
    <a
      href={leetcodeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`font-medium transition ${
        solved
          ? "text-[#315C38] hover:text-[#24472B]"
          : "hover:text-[#8A6D2F]"
      }`}
    >
      {title}
    </a>
  );
}