"use client";

import "leaflet/dist/leaflet.css";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search, Loader2, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServicePoint } from "@/lib/sendcloud";

const ServicePointMap = dynamic(
  () => import("./service-point-map").then((m) => m.ServicePointMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full rounded-lg bg-muted animate-pulse" />
    ),
  }
);

interface ServicePointPickerProps {
  carrier?: string;
  country?: string;
  value: ServicePoint | null;
  onChange: (point: ServicePoint | null) => void;
}

function formatOpeningDay(dayIndex: string): string {
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  return days[parseInt(dayIndex)] ?? dayIndex;
}

function todayHours(point: ServicePoint): string[] | undefined {
  const idx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  return point.formatted_opening_times?.[String(idx)];
}

export function ServicePointPicker({
  carrier,
  country = "FR",
  value,
  onChange,
}: ServicePointPickerProps) {
  const [postalCode, setPostalCode] = useState("");
  const [results, setResults] = useState<ServicePoint[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const search = async () => {
    if (!postalCode.trim()) return;
    setIsSearching(true);
    setError(null);
    setSearched(false);
    setHighlightedId(null);
    try {
      const params = new URLSearchParams({ country, postal_code: postalCode.trim() });
      if (carrier) params.set("carrier", carrier);
      const res = await fetch(`/api/shipping/service-points?${params}`);
      if (!res.ok) throw new Error("Erreur de recherche");
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
    setResults([]);
    setSearched(false);
    setHighlightedId(null);
  };

  if (value) {
    const hours = todayHours(value);
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-1.5">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0 text-sm">
            <p className="font-semibold text-foreground">{value.name}</p>
            <p className="text-muted-foreground">
              {value.street} {value.house_number}
            </p>
            <p className="text-muted-foreground">
              {value.postal_code} {value.city}
            </p>
            {hours && hours.length > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3" aria-hidden="true" />
                Aujourd'hui&nbsp;: {hours.join(", ")}
              </p>
            )}
            {value.distance != null && (
              <p className="text-xs text-muted-foreground">
                À {(value.distance / 1000).toFixed(1)}&nbsp;km
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => {
              onChange(null);
              setResults([]);
              setSearched(false);
            }}
            aria-label="Changer de point relais"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="service-point-postal" className="sr-only">
            Code postal pour trouver un point relais
          </Label>
          <Input
            id="service-point-postal"
            placeholder="Code postal (ex : 75001)"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="postal-code"
            maxLength={10}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2 shrink-0"
          onClick={search}
          disabled={isSearching || !postalCode.trim()}
          aria-label="Rechercher les points relais"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-4 w-4" aria-hidden="true" />
          )}
          Rechercher
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {searched && results.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">
          Aucun point relais trouvé pour ce code postal.
        </p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* List */}
          <ul
            className="space-y-1.5 max-h-72 overflow-y-auto pr-1"
            role="listbox"
            aria-label="Points relais disponibles"
          >
            {results.map((point) => {
              const hours = todayHours(point);
              const todayIdx =
                new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
              return (
                <li key={point.id} role="option" aria-selected="false">
                  <button
                    type="button"
                    onClick={() => selectPoint(point)}
                    onMouseEnter={() => setHighlightedId(point.id)}
                    onMouseLeave={() => setHighlightedId(null)}
                    onFocus={() => setHighlightedId(point.id)}
                    onBlur={() => setHighlightedId(null)}
                    className={cn(
                      "w-full text-left rounded-lg border border-border p-3 text-sm",
                      "hover:border-primary/50 hover:bg-muted/50 transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      highlightedId === point.id &&
                        "border-primary/50 bg-muted/50"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin
                        className="h-4 w-4 text-primary mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{point.name}</p>
                        <p className="text-muted-foreground">
                          {point.street} {point.house_number},{" "}
                          {point.postal_code} {point.city}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                          {hours && hours.length > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              {formatOpeningDay(String(todayIdx))}&nbsp;:{" "}
                              {hours.join(", ")}
                            </span>
                          )}
                          {point.distance != null && (
                            <span className="text-xs text-muted-foreground">
                              {(point.distance / 1000).toFixed(1)}&nbsp;km
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

          {/* Map */}
          <div className="rounded-lg overflow-hidden border border-border">
            <ServicePointMap
              points={results}
              highlightedId={highlightedId}
              onSelect={selectPoint}
            />
          </div>
        </div>
      )}
    </div>
  );
}
