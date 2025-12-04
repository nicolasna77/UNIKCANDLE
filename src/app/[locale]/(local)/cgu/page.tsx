import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-montserrat",
});

export default function CGUPage() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1
          className={`${montserrat.className} text-4xl lg:text-5xl font-bold text-center mb-12 text-foreground`}
        >
          Conditions Générales d&apos;Utilisation
        </h1>

        <div className="max-w-3xl mx-auto space-y-8 text-muted-foreground">
          <section>
            <h2
              className={`${montserrat.className} text-2xl font-semibold mb-4 text-foreground`}
            >
              1. Présentation du site
            </h2>
            <p>
              Le site UNIKCANDLE (ci-après « le Site ») est édité par la société
              SAS UNIKCANDLE, Service LK Créations, immatriculée sous le SIRET
              98479863700018.
            </p>
            <p>
              En accédant et en utilisant le Site, l&apos;utilisateur accepte
              sans réserve les présentes Conditions Générales d&apos;Utilisation
              (CGU).
            </p>
          </section>

          <section>
            <h2
              className={`${montserrat.className} text-2xl font-semibold mb-4 text-foreground`}
            >
              2. Objet
            </h2>
            <p>
              Les présentes CGU ont pour objet de définir les conditions
              d&apos;accès et d&apos;utilisation du Site. Le Site propose
              notamment :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La présentation des bougies UNIKCANDLE</li>
              <li>Un service de personnalisation et de commande en ligne</li>
              <li>
                Des informations sur l&apos;entreprise et son engagement
                écologique
              </li>
            </ul>
          </section>

          <section>
            <h2
              className={`${montserrat.className} text-2xl font-semibold mb-4 text-foreground`}
            >
              3. Accès au site
            </h2>
            <p>
              L&apos;accès au Site est gratuit, mais certaines fonctionnalités
              (achat, personnalisation, etc.) nécessitent la création d&apos;un
              compte utilisateur.
            </p>
            <p>
              L&apos;utilisateur s&apos;engage à fournir des informations
              exactes lors de son inscription et à ne pas usurper
              l&apos;identité d&apos;un tiers.
            </p>
          </section>

          <section>
            <h2
              className={`${montserrat.className} text-2xl font-semibold mb-4 text-foreground`}
            >
              4. Propriété intellectuelle
            </h2>
            <p>
              Tous les contenus présents sur le Site (textes, images, logos,
              design, etc.) sont protégés par le droit de la propriété
              intellectuelle. Toute reproduction, modification ou exploitation
              sans autorisation préalable est strictement interdite.
            </p>
          </section>

          <section>
            <h2
              className={`${montserrat.className} text-2xl font-semibold mb-4 text-foreground`}
            >
              5. Responsabilités
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-semibold">
                  Responsabilité de l&apos;utilisateur :
                </span>{" "}
                L&apos;utilisateur s&apos;engage à ne pas utiliser le Site à des
                fins frauduleuses, nuisibles ou contraires aux lois en vigueur.
              </li>
              <li>
                <span className="font-semibold">
                  Responsabilité de l&apos;éditeur :
                </span>{" "}
                UNIKCANDLE s&apos;efforce d&apos;assurer l&apos;exactitude des
                informations disponibles sur le Site mais ne saurait être tenu
                responsable d&apos;éventuelles erreurs, interruptions ou
                indisponibilités temporaires.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className={`${montserrat.className} text-2xl font-semibold mb-4 text-foreground`}
            >
              6. Protection des données personnelles
            </h2>
            <p>
              UNIKCANDLE s&apos;engage à respecter la vie privée de ses
              utilisateurs. Les données collectées via le Site sont traitées
              conformément à la Politique de Confidentialité, accessible sur la
              même page.
            </p>
            <p>
              Conformément au Règlement Général sur la Protection des Données
              (RGPD), l&apos;utilisateur dispose d&apos;un droit d&apos;accès,
              de rectification et de suppression de ses données personnelles.
              Toute demande peut être adressée à contact@unikcandle.com.
            </p>
          </section>

          <section>
            <h2
              className={`${montserrat.className} text-2xl font-semibold mb-4 text-foreground`}
            >
              7. Cookies
            </h2>
            <p>
              Le Site utilise des cookies pour améliorer l&apos;expérience
              utilisateur. L&apos;utilisateur peut configurer ses préférences
              via son navigateur.
            </p>
          </section>

          <section>
            <h2
              className={`${montserrat.className} text-2xl font-semibold mb-4 text-foreground`}
            >
              8. Modification des CGU
            </h2>
            <p>
              UNIKCANDLE se réserve le droit de modifier les présentes CGU à
              tout moment. Toute modification prendra effet dès sa publication
              sur le Site.
            </p>
          </section>

          <section>
            <h2
              className={`${montserrat.className} text-2xl font-semibold mb-4 text-foreground`}
            >
              9. Droit applicable et litiges
            </h2>
            <p>
              Les présentes CGU sont soumises au droit français. En cas de
              litige, une solution amiable sera privilégiée avant toute action
              judiciaire. À défaut d&apos;accord, les tribunaux compétents
              seront ceux du ressort du siège social de SAS UNIKCANDLE.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
