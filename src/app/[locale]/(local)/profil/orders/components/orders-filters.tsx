"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DatePickerWithRange from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface OrdersFiltersProps {
  activeTab: string;
  dateRange: DateRange | undefined;
  isFetching: boolean;
  onTabChange: (value: string) => void;
  onDateChange: (dateRange: DateRange | undefined) => void;
  onReset: () => void;
}

export function OrdersFilters({
  activeTab,
  dateRange,
  isFetching,
  onTabChange,
  onDateChange,
  onReset,
}: OrdersFiltersProps) {
  const hasFilters = dateRange?.from || dateRange?.to || activeTab !== "all";

  return (
    <Card className="overflow-hidden">
      <div className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={onTabChange}
            className="w-full lg:w-auto"
          >
            <TabsList className="grid grid-cols-3 w-full lg:w-auto lg:grid-cols-3">
              <TabsTrigger value="all" disabled={isFetching}>
                Toutes
              </TabsTrigger>
              <TabsTrigger value="PROCESSING" disabled={isFetching}>
                En cours
              </TabsTrigger>
              <TabsTrigger value="DELIVERED" disabled={isFetching}>
                Livrées
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <DatePickerWithRange
              className="w-full sm:w-auto"
              date={dateRange}
              onDateChange={onDateChange}
            />
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="w-full sm:w-auto"
                disabled={isFetching}
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
