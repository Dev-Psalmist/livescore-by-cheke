import { Suspense } from "react";
import { connection } from "next/server";
import MatchCentreClient from "./MatchCentreClient";

interface MatchPageProps {
  params: Promise<{
    id: string;
  }>;
}

function MatchCentreFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-500" role="status">
        Loading match centre...
      </p>
    </main>
  );
}

async function MatchPageContent({ params }: MatchPageProps) {
  await connection();

  const { id } = await params;

  return <MatchCentreClient id={id} />;
}

export default function MatchPage({ params }: MatchPageProps) {
  return (
    <Suspense fallback={<MatchCentreFallback />}>
      <MatchPageContent params={params} />
    </Suspense>
  );
}