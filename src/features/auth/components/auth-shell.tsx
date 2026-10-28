import Image from "next/image";

const ETAPES = ["Acheté", "Embarqué", "En mer", "Arrivé à Conakry", "Livré"];

/**
 * Page d'accès (connexion, mot de passe oublié) : un panneau vert Sacko-Green
 * qui montre le trajet d'un véhicule, du Canada jusqu'à la livraison, et le
 * formulaire à droite. Sur mobile, seul le logo reste au-dessus du formulaire.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex xl:p-16">
        <div className="w-fit rounded-lg bg-white px-4 py-3">
          <Image src="/sacko/logo.webp" alt="Sacko-Green Inc." width={800} height={400} priority className="h-14 w-auto" />
        </div>

        <div className="max-w-xl space-y-10">
          <h2 className="font-serif text-4xl font-semibold leading-tight xl:text-5xl">
            Chaque véhicule suivi, de l&apos;encan à la livraison.
          </h2>

          {/* Le trajet d'un véhicule exporté : la signature visuelle de l'outil. */}
          <ol aria-hidden className="max-w-md space-y-0 rounded-lg bg-white/10 p-6 ring-1 ring-white/20">
            {ETAPES.map((etape, index) => (
              <li key={etape} className="flex items-center gap-4 py-1.5">
                <span
                  className={`size-3 shrink-0 rounded-full ring-2 ring-primary-foreground/80 ${index < 3 ? "bg-primary-foreground" : ""}`}
                />
                <span className={index < 3 ? "font-semibold" : "text-primary-foreground/75"}>{etape}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-sm text-primary-foreground/75">
          Stock, prix, clients, conteneurs et paiements, au Canada et en Guinée.
        </p>
      </aside>

      <main className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md space-y-8">
          <Image
            src="/sacko/logo.webp"
            alt="Sacko-Green Inc."
            width={800}
            height={400}
            priority
            className="h-12 w-auto lg:hidden"
          />
          {children}
        </div>
      </main>
    </div>
  );
}
