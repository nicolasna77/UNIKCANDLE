"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Search,
  Loader2,
  Clock,
  X,
  CheckCircle2,
  Navigation,
  ArrowLeft,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServicePoint } from "@/lib/sendcloud";

const ServicePointMap = dynamic(
  () => import("./service-point-map").then((m) => m.ServicePointMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full rounded-xl bg-muted animate-pulse flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    ),
  }
);

interface ServicePointPickerProps {
  carrier?: string;
  country?: string;
  value: ServicePoint | null;
  onChange: (point: ServicePoint | null) => void;
}

const DAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function todayDayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function todayHours(point: ServicePoint): string[] | undefined {
  return point.formatted_opening_times?.[String(todayDayIndex())];
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function ServicePointPicker({
  carrier,
  country = "FR",
  value,
  onChange,
}: ServicePointPickerProps) {
  const [open, setOpen] = useState(false);
  const [postalCode, setPostalCode] = useState("");
  const [results, setResults] = useState<ServicePoint[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [previewPoint, setPreviewPoint] = useState<ServicePoint | null>(null);

  const search = async () => {
    if (!postalCode.trim()) return;
    setIsSearching(true);
    setError(null);
    setSearched(false);
    setHighlightedId(null);
    setPreviewPoint(null);
    try {
      const params = new URLSearchParams({ country, postal_code: postalCode.trim() });
      if (carrier) params.set("carrier", carrier);
      const res = await fetch(`/api/shipping/service-points?${params}`);
      if (!res.ok) throw new Error();
      const data: ServicePoint[] = await res.json();
      setResults(data.slice(0, 10));
      setSearched(true);
    } catch {
      setError("Impossible de charger les points relais. Vérifiez le code postal.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      search();
    }
  };

  const selectPoint = (point: ServicePoint) => {
    onChange(point);
    setOpen(false);
    setResults([]);
    setSearched(false);
    setHighlightedId(null);
    setPreviewPoint(null);
  };

  const handleMapSelect = (point: ServicePoint) => {
    setPreviewPoint(point);
    setHighlightedId(point.id);
  };

  const closePreview = () => {
    setPreviewPoint(null);
    setHighlightedId(null);
  };

  const resetSearch = () => {
    setResults([]);
    setSearched(false);
    setError(null);
    setHighlightedId(null);
    setPreviewPoint(null);
  };

  const hours = value ? todayHours(value) : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetSearch();
      }}
    >
      {/* ── Déclencheur ── */}
      {value ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-1.5">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight truncate">{value.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {value.street} {value.house_number}, {value.postal_code} {value.city}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 pt-0.5">
                {hours && hours.length > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                    Aujourd&apos;hui&nbsp;: {hours.join(", ")}
                  </span>
                )}
                {value.distance != null && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Navigation className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {formatDistance(value.distance)}
                  </span>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 rounded-lg hover:bg-primary/10"
              onClick={() => onChange(null)}
              aria-label="Supprimer le point relais sélectionné"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="w-full h-8 text-xs rounded-lg mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              Changer de point relais
            </Button>
          </DialogTrigger>
        </div>
      ) : (
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 rounded-xl gap-2 border-dashed border-primary/40 hover:border-primary/70 hover:bg-primary/5 text-sm"
          >
            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
            Choisir un point relais
          </Button>
        </DialogTrigger>
      )}

      {/* ── Modale ── */}
      <DialogContent
        className="p-0 gap-0 overflow-hidden rounded-2xl"
        style={{ maxWidth: "56rem", width: "calc(100% - 2rem)" }}
      >
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
            Choisir un point relais
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">
          {/* Barre de recherche */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <label htmlFor="sp-postal" className="sr-only">Code postal</label>
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                id="sp-postal"
                placeholder="Votre code postal (ex : 75001)"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="postal-code"
                autoFocus
                maxLength={10}
                className="pl-9 rounded-xl"
              />
            </div>
            <Button
              type="button"
              className="gap-2 shrink-0 rounded-xl px-4"
              onClick={search}
              disabled={isSearching || !postalCode.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="h-4 w-4" aria-hidden="true" />
              )}
              Rechercher
            </Button>
          </div>

          {/* Erreur */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Aucun résultat */}
          {searched && results.length === 0 && !error && (
            <p className="text-sm text-muted-foreground">
              Aucun point relais trouvé pour ce code postal.
            </p>
          )}

          {/* Résultats */}
          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Colonne gauche : liste ou descriptif */}
              {previewPoint ? (
                /* ── Descriptif de l'établissement ── */
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={closePreview}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Retour à la liste
                  </button>

                  <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4 flex-1">
                    {/* Infos principales */}
                    <div className="space-y-1">
                      <p className="font-semibold text-base leading-tight">{previewPoint.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {previewPoint.street} {previewPoint.house_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {previewPoint.postal_code} {previewPoint.city}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {previewPoint.distance != null && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Navigation className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {formatDistance(previewPoint.distance)}
                          </span>
                        )}
                        {previewPoint.phone && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {previewPoint.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Horaires semaine */}
                    {previewPoint.formatted_opening_times &&
                      Object.keys(previewPoint.formatted_opening_times).length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                            Horaires d&apos;ouverture
                          </p>
                          <div className="space-y-1">
                            {Array.from({ length: 7 }, (_, i) => i).map((i) => {
                              const dayHours = previewPoint.formatted_opening_times?.[String(i)];
                              const isToday = i === todayDayIndex();
                              return (
                                <div
                                  key={i}
                                  className={cn(
                                    "flex items-center justify-between text-xs py-0.5 px-2 rounded-lg",
                                    isToday ? "bg-primary/10 font-medium text-foreground" : "text-muted-foreground"
                                  )}
                                >
                                  <span className="w-24 shrink-0">{DAY_LABELS[i]}</span>
                                  <span>
                                    {dayHours && dayHours.length > 0
                                      ? dayHours.join(", ")
                                      : "Fermé"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Bouton de confirmation */}
                  <Button
                    type="button"
                    className="w-full rounded-xl h-10"
                    onClick={() => selectPoint(previewPoint)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden="true" />
                    Choisir ce point relais
                  </Button>
                </div>
              ) : (
                /* ── Liste des résultats ── */
                <ul
                  className="space-y-1.5 max-h-80 overflow-y-auto pr-0.5"
                  role="listbox"
                  aria-label="Points relais disponibles"
                >
                  {results.map((point) => {
                    const ph = todayHours(point);
                    const isHighlighted = highlightedId === point.id;
                    return (
                      <li key={point.id} role="option" aria-selected={isHighlighted}>
                        <button
                          type="button"
                          onClick={() => selectPoint(point)}
                          onMouseEnter={() => setHighlightedId(point.id)}
                          onMouseLeave={() => setHighlightedId(null)}
                          onFocus={() => setHighlightedId(point.id)}
                          onBlur={() => setHighlightedId(null)}
                          className={cn(
                            "w-full text-left rounded-xl border p-3 text-sm transition-all duration-150 cursor-pointer",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isHighlighted
                              ? "border-primary/50 bg-primary/5 shadow-sm"
                              : "border-border bg-background hover:border-primary/40 hover:bg-primary/5"
                          )}
                        >
                          <div className="flex items-start gap-2.5">
                            <MapPin
                              className={cn(
                                "h-4 w-4 mt-0.5 shrink-0 transition-colors",
                                isHighlighted ? "text-primary" : "text-muted-foreground"
                              )}
                              aria-hidden="true"
                            />
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <p className="font-semibold text-sm leading-tight truncate">{point.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {point.street} {point.house_number}, {point.postal_code} {point.city}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-0.5">
                                {ph && ph.length > 0 && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                                    {ph.join(", ")}
                                  </span>
                                )}
                                {point.distance != null && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                    <Navigation className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                                    {formatDistance(point.distance)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Carte — toujours visible */}
              <div
                className="rounded-xl overflow-hidden border border-border"
                style={{ minHeight: 320 }}
              >
                <ServicePointMap
                  points={results}
                  highlightedId={highlightedId}
                  onSelect={handleMapSelect}
                />
              </div>
            </div>
          )}

          {/* État initial */}
          {!searched && results.length === 0 && !error && !isSearching && (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2 text-muted-foreground">
              <MapPin className="h-8 w-8 opacity-30" aria-hidden="true" />
              <p className="text-sm">
                Entrez votre code postal pour trouver<br />les points relais près de chez vous.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
