import { TriangleAlert } from "lucide-react";

export default function Ensv2WarningBanner() {
  return (
    <div
      role="alert"
      className="flex items-center justify-center gap-2 bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-sm text-amber-950"
    >
      <TriangleAlert className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
      <p>
        <a
          href="https://gist.github.com/gskril/997a95d6dc8493d3ffe82531382b0924"
          target="_blank"
          className="underline underline-offset-2"
        >
          Follow this guide to use Durin on Sepolia with ENSv2.
        </a>
      </p>
    </div>
  );
}
