import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product, Scent } from "@prisma/client";

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
    <Card>
      <CardHeader>
        <CardTitle>Choisissez votre senteur</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedScent.id}
          onValueChange={(value) => {
            const scent = product.scents.find((s) => s.id === value);
            if (scent) {
              setSelectedScent(scent);
            }
          }}
          className="grid grid-cols-2 gap-4"
        >
          {product.scents.map((scent) => (
            <div key={scent.id}>
              <RadioGroupItem
                value={scent.id}
                id={scent.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={scent.id}
                className="flex flex-col items-center p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50 transition-all duration-200 cursor-pointer peer-data-[state=checked]:border-primary"
              >
                <span className="text-3xl mb-3">{scent.icon}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {scent.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                  {scent.description}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default SelectScentComponant;
