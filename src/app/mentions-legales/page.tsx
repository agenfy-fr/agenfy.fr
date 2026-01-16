import { Metadata } from "next";
import { Header, Footer } from "@/components/sections";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Mentions Légales | Agenfy",
  description: "Mentions légales et conditions générales du site Agenfy, marque de Hasfy SAS.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        <section className="py-24 lg:py-32">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <Badge variant="outline" className="rounded-full px-4 py-2 mb-8 border-primary/30 bg-primary/5">
              Légal
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-8 gradient-text">Mentions Légales & Conditions Générales</h1>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground text-lg mb-8">
                Conformément aux dispositions des articles 6-III et 19 de la loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l&apos;Économie Numérique, dite L.C.E.N., il est porté à la connaissance des utilisateurs et visiteurs du site les informations suivantes :
              </p>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Mentions légales</h2>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">1.1 Informations légales</h3>
                  <div className="bg-card/50 border border-border/50 rounded-xl p-6 space-y-2">
                    <p className="text-foreground"><strong>Agenfy</strong> est une marque de <strong>Hasfy SAS</strong></p>
                    <p className="text-muted-foreground">229 rue Saint-Honoré, 75001, Paris</p>
                    <p className="text-muted-foreground">Capital : 100 € (cent euros)</p>
                    <p className="text-muted-foreground">SIRET : 93343667700019</p>
                    <p className="text-muted-foreground">R.C.S. : 933 436 677 R.C.S. Paris</p>
                    <p className="text-muted-foreground">N° TVA intracommunautaire : FR68933436677</p>
                    <p className="text-muted-foreground">E-mail : <a href="mailto:contact@agenfy.fr" className="text-primary hover:underline">contact@agenfy.fr</a></p>
                    <p className="text-muted-foreground">Téléphone : <a href="tel:+33649068354" className="text-primary hover:underline">+33 6 49 06 83 54</a></p>
                    <p className="text-muted-foreground">Le créateur du site est : MASSÉ Evan</p>
                    <p className="text-muted-foreground">Le Responsable de la publication est : MASSÉ Evan</p>
                    <p className="text-muted-foreground">Le Webmaster est : MASSÉ Evan</p>
                    <p className="text-muted-foreground">Hébergeur : Vercel, <a href="https://vercel.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://vercel.com</a></p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">1.2 Description des services fournis</h3>
                  <p className="text-muted-foreground">
                    Le site https://www.agenfy.fr a pour objet de fournir une information concernant l&apos;ensemble des activités de la société. Le propriétaire du site s&apos;efforce de fournir sur le site des informations aussi précises que possible. Toutefois, il ne pourra être tenu responsable des omissions, inexactitudes et carences dans la mise à jour, qu&apos;elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    Toutes les informations proposées sur le site sont données à titre indicatif, non exhaustives, et sont susceptibles d&apos;évoluer. Elles sont données sous réserve de modifications ayant été apportées depuis leur mise en ligne.
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">1.3 Propriété intellectuelle et contrefaçons</h3>
                  <p className="text-muted-foreground">
                    Le propriétaire du site est propriétaire des droits de propriété intellectuelle ou détient les droits d&apos;usage sur tous les éléments accessibles sur le site, notamment les textes, images, graphismes, logos, icônes, sons, logiciels à l&apos;exception des marques, logos ou contenus appartenant à d&apos;autres entreprises partenaires ou auteurs.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    Toute reproduction, représentation, modification, publication, adaptation totale ou partielle des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation préalable écrite à l&apos;adresse e-mail : <a href="mailto:contact@agenfy.fr" className="text-primary hover:underline">contact@agenfy.fr</a>.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    Toute exploitation non autorisée du site ou de l&apos;un quelconque des éléments qu&apos;il contient sera considérée comme constitutive d&apos;une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">1.4 Liens hypertextes et cookies</h3>
                  <p className="text-muted-foreground">
                    Le site contient un certain nombre de liens hypertextes vers d&apos;autres sites mis en place avec l&apos;autorisation du propriétaire du site. Cependant, le propriétaire du site n&apos;a pas la possibilité de vérifier le contenu des sites ainsi visités, et décline donc toute responsabilité quant aux éventuels risques de contenus illicites.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    Les utilisateurs sont informés que lors de leurs visites sur le site, un ou des cookies peuvent s&apos;installer automatiquement sur leur ordinateur. Un cookie est un fichier de petite taille, qui ne permet pas l&apos;identification de l&apos;utilisateur, mais qui enregistre des informations relatives à la navigation d&apos;un ordinateur sur un site.
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">1.5 Protection des données personnelles</h3>
                  <p className="text-muted-foreground">
                    En France, les données personnelles sont notamment protégées par le Règlement Général sur la Protection des Données (RGPD). Sur le site, le propriétaire ne collecte des informations personnelles relatives à l&apos;utilisateur que pour le besoin de certains services proposés par le site.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    Conformément aux dispositions des articles 38 et suivants de la loi Informatique et Libertés 78-17 du 6 janvier 1978, tout utilisateur dispose d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition aux données personnelles le concernant.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    Pour l&apos;exercer, adressez votre demande à <a href="mailto:contact@agenfy.fr" className="text-primary hover:underline">contact@agenfy.fr</a> ou effectuez une demande écrite et signée, accompagnée d&apos;une copie du titre d&apos;identité avec signature du titulaire de la pièce.
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Conditions Générales</h2>
                
                <p className="text-muted-foreground mb-6">
                  Hasfy SAS, immatriculée au registre du commerce et des sociétés de Paris sous le numéro RCS 933 436 677 R.C.S. Paris, située au 229 rue Saint-Honoré, 75001, Paris (ci-après « Opérateur », « nous », « Agenfy »), éditeur et exploitant du site (ci-après le « Site »), a établi les présentes conditions générales de vente et d&apos;utilisation (ci-après « CGV-CGU »).
                </p>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">2.1 Acceptation des CGV-CGU</h3>
                  <p className="text-muted-foreground">
                    Préalablement à toute utilisation du Site ou achat de Services sur le Site, vous reconnaissez avoir pris connaissance des présentes CGV-CGU et les accepter sans restriction ni réserve. Vous déclarez avoir la capacité légale de contracter.
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">2.2 Services</h3>
                  <p className="text-muted-foreground">
                    Les caractéristiques essentielles des Services proposés sont présentées sur le Site. Vous reconnaissez avoir pris connaissance de ces informations avant de passer toute commande. Nos services incluent le conseil et l&apos;intégration technologique dans les domaines de la Data, de l&apos;Intelligence Artificielle, du Cloud et de la transformation digitale.
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">2.3 Conditions financières</h3>
                  <p className="text-muted-foreground">
                    Les prix sont indiqués sur le Site en euros, toutes taxes comprises. Ils tiennent compte de la TVA en vigueur le jour de la commande. L&apos;Opérateur se réserve le droit de les modifier à tout moment. Le prix appliqué est celui en vigueur au moment de la confirmation de la commande.
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">2.4 Droit de rétractation</h3>
                  <p className="text-muted-foreground">
                    Le client consommateur dispose d&apos;un droit légal de rétractation conformément à l&apos;article L221-18 du Code de la consommation français. Vous pouvez exercer votre droit, sans avoir à motiver votre décision, dans un délai de 14 jours à compter de la conclusion du contrat pour la fourniture de Services.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    Pour exercer votre droit, vous devez informer l&apos;Opérateur de votre décision de vous rétracter à l&apos;adresse suivante : 229 rue Saint-Honoré, 75001, Paris et <a href="mailto:contact@agenfy.fr" className="text-primary hover:underline">contact@agenfy.fr</a>.
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">2.5 Réclamations - Médiation</h3>
                  <p className="text-muted-foreground">
                    Pour toute réclamation, veuillez contacter l&apos;Opérateur à l&apos;adresse suivante :
                  </p>
                  <div className="bg-card/50 border border-border/50 rounded-xl p-6 mt-4">
                    <p className="text-muted-foreground">Adresse : 229 rue Saint-Honoré, 75001, Paris</p>
                    <p className="text-muted-foreground">E-mail : <a href="mailto:contact@agenfy.fr" className="text-primary hover:underline">contact@agenfy.fr</a></p>
                    <p className="text-muted-foreground">Téléphone : <a href="tel:+33649068354" className="text-primary hover:underline">+33 6 49 06 83 54</a></p>
                  </div>
                  <p className="text-muted-foreground mt-4">
                    La Commission européenne a également mis en place une plateforme de résolution en ligne des litiges : <a href="https://ec.europa.eu/consumers/odr/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">2.6 Loi applicable</h3>
                  <p className="text-muted-foreground">
                    Le présent contrat est régi exclusivement par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
                  </p>
                </div>
              </section>

              <p className="text-muted-foreground text-sm">
                Dernière mise à jour : 16 janvier 2026
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
