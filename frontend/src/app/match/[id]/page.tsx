import MatchCentreClient from "./MatchCentreClient";

interface MatchPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MatchPage({
  params,
}: MatchPageProps) {
  const { id } = await params;

  return <MatchCentreClient id={id} />;
}
