"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function EmptyCart() {
  const t = useTranslations("cart");

  return (
    <section className="py-8 antialiased md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <Card className="max-w-md mx-auto p-8 text-center">
          <CardHeader>
            <CardTitle>{t("empty")}</CardTitle>
            <CardDescription>{t("emptyDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/products">
              <Button>{t("discoverProducts")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
