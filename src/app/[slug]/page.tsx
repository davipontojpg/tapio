import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { TableMenuClient } from "@/components/TableMenuClient";
import { getRestaurantBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

interface MenuPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mesa?: string }>;
}

export default async function PublicTableMenuPage({
  params,
  searchParams,
}: MenuPageProps) {
  const { slug } = await params;
  const { mesa } = await searchParams;

  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant) {
    notFound();
  }

  if (restaurant.status === "blocked") {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold">
            Cardápio temporariamente indisponível
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            O cardápio digital de <strong>{restaurant.name}</strong> está
            pausado no momento. Solicite atendimento ao garçom ou entre em
            contato com a administração.
          </p>
          <Link
            href="/master"
            className="inline-block text-xs text-slate-500 hover:text-slate-300 underline pt-2"
          >
            Administrador? Gerenciar no Painel Master
          </Link>
        </div>
      </main>
    );
  }

  return <TableMenuClient restaurant={restaurant} tableParam={mesa} />;
}
