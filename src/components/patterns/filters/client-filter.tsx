"use client";

import { Combobox } from "@/components/ui/combobox";

interface Client {
  id: string;
  nom: string;
}

interface ClientFilterProps {
  clients: Client[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  id?: string;
}

const TOUS = "__tous__";

export function ClientFilter({
  clients,
  value,
  onChange,
  placeholder = "Sélectionner un client",
  id,
}: ClientFilterProps) {
  // Première option : revenir à « aucun filtre ».
  const options = [{ value: TOUS, label: placeholder }, ...clients.map((c) => ({ value: c.id, label: c.nom }))];

  return (
    <div className="w-full sm:w-[200px]">
      <Combobox
        id={id}
        options={options}
        value={value ?? TOUS}
        onValueChange={(v) => onChange(v === TOUS ? null : v)}
        placeholder={placeholder}
        searchPlaceholder="Nom du client…"
        emptyText="Aucun client trouvé"
        aria-label="Client"
      />
    </div>
  );
}
