import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product, Scent } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type ProductWithScents = Product & {
  scents: Scent[];
};

const SelectScentComponant = ({
  product,
  selectedScent,
  setSelectedScent,
}: {
  product: ProductWithScents;
  selectedScent: Scent;
  setSelectedScent: (scent: Scent) => void;
}) => {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          Choisissez votre senteur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {product.scents.map((scent) => {
            const isSelected = selectedScent.id === scent.id;
            return (
              <button
                key={scent.id}
                type="button"
                onClick={() => setSelectedScent(scent)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-left transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40 hover:bg-accent/50"
                )}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </span>
                )}
                <span className="text-3xl">{scent.icon}</span>
                <span
                  className={cn(
                    "text-sm font-semibold text-center",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {scent.name}
                </span>
                {scent.notes && scent.notes.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1">
                    {scent.notes.slice(0, 2).map((note, i) => (
                      <Badge
                        key={i}
                        variant={isSelected ? "default" : "secondary"}
                        className="text-xs px-1.5 py-0"
                      >
                        {note}
                      </Badge>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Description du parfum sélectionné */}
        {selectedScent.description && (
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
            {selectedScent.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SelectScentComponant;
