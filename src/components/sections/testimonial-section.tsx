"use client";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

interface Testimonial {
  id: string;
  avatarFallback: string;
}

const testimonialIds: Testimonial[] = [
  { id: "marie", avatarFallback: "M" },
  { id: "jean", avatarFallback: "J" },
  { id: "sophie", avatarFallback: "S" },
  { id: "lucas", avatarFallback: "L" },
];

export default function TestimonialSection() {
  const t = useTranslations("testimonials");

  const testimonials = useMemo(
    () =>
      testimonialIds.map((item) => ({
        name: t(`items.${item.id}.name`),
        role: t(`items.${item.id}.role`),
        content: t(`items.${item.id}.content`),
        avatarFallback: item.avatarFallback,
      })),
    [t]
  );

  return (
    <section className="py-24 lg:py-32 bg-primary-background overflow-hidden">
      <div className="container mx-auto px-4">
        <h2
          className={` text-4xl lg:text-5xl font-bold text-center mb-16 text-foreground tracking-tight`}
        >
          {t("title")}
        </h2>
        <div className="relative">
          <motion.div
            className="flex gap-8"
            animate={{
              x: [0, -1000],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <Card key={index} className="min-w-[350px] border-primary/10">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>
                      {testimonial.avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">
                    {testimonial.name}, {testimonial.role}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-muted-foreground italic">
                  &quot;{testimonial.content}&quot;
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
        <div className="text-center mt-16">
          <Link
            className={buttonVariants({ variant: "default", size: "lg" })}
            href="#newsletter"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
