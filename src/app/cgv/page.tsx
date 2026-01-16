import { Metadata } from "next";
import { Header, Footer } from "@/components/sections";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente | Agenfy",
  description: "Conditions générales de vente des prestations Agenfy, marque de Hasfy SAS.",
};

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        <section className="py-24 lg:py-32">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <Badge variant="outline" className="rounded-full px-4 py-2 mb-8 border-primary/30 bg-primary/5">
              Légal
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-8 gradient-text">Conditions Générales de Vente</h1>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground text-lg mb-8">
                Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Hasfy SAS (opérant sous la marque Agenfy) et ses clients pour toute prestation de conseil et d&apos;intégration technologique.
              </p>

              <div className="bg-card/50 border border-border/50 rounded-xl p-6 mb-8">
                <p className="text-foreground"><strong>Agenfy</strong> est une marque de <strong>Hasfy SAS</strong></p>
                <p className="text-muted-foreground">229 rue Saint-Honoré, 75001, Paris</p>
                <p className="text-muted-foreground">SIRET : 93343667700019 | R.C.S. Paris 933 436 677</p>
                <p className="text-muted-foreground">Contact : <a href="mailto:contact@agenfy.fr" className="text-primary hover:underline">contact@agenfy.fr</a> | <a href="tel:+33649068354" className="text-primary hover:underline">+33 6 49 06 83 54</a></p>
              </div>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Article 1 - Objet</h2>
                <p className="text-muted-foreground">
                  Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Hasfy SAS, opérant sous la marque commerciale Agenfy, et ses clients pour toute prestation de conseil et d&apos;intégration technologique. Toute commande implique l&apos;acceptation sans réserve des présentes CGV.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Article 2 - Prestations</h2>
                <p className="text-muted-foreground mb-4">
                  Agenfy propose des prestations de :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Conseil en stratégie technologique et transformation digitale</li>
                  <li>Conception et développement de solutions Data</li>
                  <li>Développement et intégration de solutions d&apos;Intelligence Artificielle</li>
                  <li>Architecture et migration Cloud</li>
                  <li>Formation et accompagnement au changement</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Les prestations sont définies dans le devis ou la proposition commerciale acceptée par le client.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Article 3 - Devis et commande</h2>
                <p className="text-muted-foreground mb-4">
                  Tout devis établi par Agenfy est valable 30 jours à compter de sa date d&apos;émission. La commande devient ferme et définitive à la signature du devis ou de la proposition commerciale par le client.
                </p>
                <p className="text-muted-foreground">
                  Toute modification de la commande doit faire l&apos;objet d&apos;un avenant écrit accepté par les deux parties.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Article 4 - Tarifs</h2>
                <p className="text-muted-foreground mb-4">
                  Les prix sont indiqués en euros et hors taxes. La TVA applicable sera ajoutée au montant HT au taux en vigueur au jour de la facturation.
                </p>
                <p className="text-muted-foreground">
                  Les frais de déplacement et d&apos;hébergement sont facturés en sus, sur présentation de justificatifs.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Article 5 - Modalités de paiement</h2>
                <p className="text-muted-foreground mb-4">
                  Sauf conditions particulières convenues entre les parties :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Un acompte de 30% est dû à la commande</li>
                  <li>Le solde est payable à réception de facture, à 30 jours fin de mois</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Le paiement peut s&apos;effectuer par virement bancaire, prélèvement automatique (SEPA) ou par carte de crédit via un système sécurisé (Visa, Mastercard, American Express).
                </p>
                <p className="text-muted-foreground mt-4">
                  En cas de retard de paiement, des pénalités de retard seront appliquées au taux légal en vigueur, ainsi qu&apos;une indemnité forfaitaire pour frais de recouvrement de 40€.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Article 6 - Réalisation des prestations</h2>
                <p className="text-muted-foreground mb-4">
                  Agenfy s&apos;engage à réaliser les prestations avec diligence et professionnalisme. Les délais indiqués sont donnés à titre indicatif et leur dépassement ne peut donner lieu à pénalités ou résiliation.
                </p>
                <p className="text-muted-foreground">
                  Le client s&apos;engage à fournir toutes les informations et accès nécessaires à la bonne réalisation des prestations dans les délais convenus.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Article 7 - Propriété intellectuelle</h2>
                <p className="text-muted-foreground mb-4">
                  Sauf stipulation contraire dans le contrat :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Les livrables spécifiquement développés pour le client lui sont cédés à paiement complet</li>
                  <li>Agenfy conserve la propriété de ses outils, méthodes et savoir-faire génériques</li>
                  <li>Le client autorise Agenfy à mentionner son nom comme référence client</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Article 8 - Confidentialité</h2>
                <p className="text-muted-foreground">
                  Les parties s&apos;engagent à traiter comme confidentielles toutes les informations échangées dans le cadre de leur relation commerciale. Cette obligation de confidentialité perdurera pendant 3 ans après la fin des prestations.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Article 9 - Droit de rétractation</h2>
                <p className="text-muted-foreground mb-4">
                  Le client consommateur dispose d&apos;un droit légal de rétractation conformément à l&apos;article L221-18 du Code de la consommation français. Vous pouvez exercer votre droit, sans avoir à motiver votre décision, dans un délai de 14 jours à compter de la conclusion du contrat.
                </p>
                <p className="text-muted-foreground">
                  Pour exercer votre droit, vous devez informer Agenfy de votre décision de vous rétracter à l&apos;adresse : 229 rue Saint-Honoré, 75001, Paris ou par e-mail à <a href="mailto:contact@agenfy.fr" className="text-primary hover:underline">contact@agenfy.fr</a>.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Article 10 - Responsabilité</h2>
                <p className="text-muted-foreground mb-4">
                  Agenfy est soumise à une obligation de moyens. Sa responsabilité ne pourra être engagée qu&apos;en cas de faute prouvée.
                </p>
                <p className="text-muted-foreground">
                  En tout état de cause, la responsabilité d&apos;Agenfy est limitée au montant des prestations facturées au titre du contrat concerné.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Article 11 - Résiliation</h2>
                <p className="text-muted-foreground mb-4">
                  En cas de manquement grave de l&apos;une des parties à ses obligations, l&apos;autre partie pourra résilier le contrat par lettre recommandée avec accusé de réception, après mise en demeure restée sans effet pendant 30 jours.
                </p>
                <p className="text-muted-foreground">
                  Les prestations réalisées jusqu&apos;à la date de résiliation seront facturées.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Article 12 - Force majeure</h2>
                <p className="text-muted-foreground">
                  Aucune partie ne sera tenue responsable d&apos;un manquement à ses obligations si ce manquement résulte d&apos;un événement de force majeure tel que défini par la jurisprudence française.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Article 13 - Réclamations - Médiation</h2>
                <p className="text-muted-foreground mb-4">
                  Pour toute réclamation, veuillez contacter Agenfy à l&apos;adresse suivante :
                </p>
                <div className="bg-card/50 border border-border/50 rounded-xl p-6">
                  <p className="text-muted-foreground">Adresse : 229 rue Saint-Honoré, 75001, Paris</p>
                  <p className="text-muted-foreground">E-mail : <a href="mailto:contact@agenfy.fr" className="text-primary hover:underline">contact@agenfy.fr</a></p>
                  <p className="text-muted-foreground">Téléphone : <a href="tel:+33649068354" className="text-primary hover:underline">+33 6 49 06 83 54</a></p>
                </div>
                <p className="text-muted-foreground mt-4">
                  La Commission européenne a mis en place une plateforme de résolution en ligne des litiges : <a href="https://ec.europa.eu/consumers/odr/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Article 14 - Droit applicable et juridiction</h2>
                <p className="text-muted-foreground mb-4">
                  Les présentes CGV sont régies par le droit français.
                </p>
                <p className="text-muted-foreground">
                  En cas de litige, les parties s&apos;efforceront de trouver une solution amiable. À défaut, les tribunaux de Paris seront seuls compétents.
                </p>
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
