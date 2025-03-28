import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lora } from "next/font/google";
import { motion } from "framer-motion";
import Link from "next/link";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

interface Testimonial {
  name: string;
  role: string;
  avatarFallback: string;
  content: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Marie",
    role: "future cliente",
    avatarFallback: "M",
    content: "Mon ami a adoré écouter mon message à la fin de la combustion !",
  },
  {
    name: "Jean",
    role: "futur client",
    avatarFallback: "J",
    content:
      "Une idée géniale pour un cadeau unique et émouvant. J'attends impatiemment le lancement !",
  },
  {
    name: "Sophie",
    role: "future cliente",
    avatarFallback: "S",
    content:
      "J'ai hâte d'offrir cette bougie à ma mère pour la fête des mères. C'est un cadeau si personnel et touchant !",
  },
  {
    name: "Lucas",
    role: "futur client",
    avatarFallback: "L",
    content:
      "Le concept est vraiment innovant. J'ai déjà prévu d'en offrir plusieurs pour les fêtes de fin d'année !",
  },
];

export default function TestimonialSection() {
  return (
    <section className="py-24 lg:py-32 bg-muted/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2
          className={`${lora.className} text-4xl lg:text-5xl font-bold text-center mb-16 text-foreground tracking-tight`}
        >
          Ce qu&apos;ils en pensent
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
            Rejoignez la communauté UNIKCANDLE
          </Link>
        </div>
      </div>
    </section>
  );
}
