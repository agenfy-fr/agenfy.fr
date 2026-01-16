import { Metadata } from "next";
import { Header, Footer } from "@/components/sections";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | Agenfy",
  description: "Politique de confidentialité du site Agenfy, marque de Hasfy SAS - Protection des données personnelles.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        <section className="py-24 lg:py-32">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <Badge variant="outline" className="rounded-full px-4 py-2 mb-8 border-primary/30 bg-primary/5">
              Légal
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-8 gradient-text">Politique de Confidentialité</h1>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground text-lg mb-8">
                Chez Agenfy (marque de Hasfy SAS), la protection de votre vie privée est importante pour nous. Cette politique de confidentialité a été rédigée pour vous informer sur la manière dont nous collectons, utilisons, partageons et protégeons vos informations lorsque vous utilisez notre site Web ou nos services.
              </p>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Préambule</h2>
                <p className="text-muted-foreground mb-4">
                  Cette politique de confidentialité s&apos;applique au site : https://www.agenfy.fr
                </p>
                <p className="text-muted-foreground mb-4">
                  L&apos;objectif de cette politique de confidentialité est d&apos;expliquer aux utilisateurs du site :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Comment leurs données personnelles sont collectées et traitées</li>
                  <li>Quels sont les droits des utilisateurs concernant ces données</li>
                  <li>Qui est responsable du traitement des données personnelles collectées et traitées</li>
                  <li>À qui ces données sont-elles transmises</li>
                  <li>Le cas échéant, la politique des cookies du site</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Principes généraux</h2>
                <p className="text-muted-foreground mb-4">
                  Conformément à l&apos;Article 5 du Règlement Européen 2016/679 (RGPD), la collecte et le traitement des données des utilisateurs sur le site respectent les principes suivants :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong className="text-foreground">Licéité, loyauté et transparence</strong> : les données sont collectées et traitées uniquement avec le consentement de l&apos;utilisateur</li>
                  <li><strong className="text-foreground">Finalité limitée</strong> : la collecte et le traitement des données sont effectués dans le but d&apos;atteindre les objectifs définis</li>
                  <li><strong className="text-foreground">Minimisation des données</strong> : seules les données nécessaires sont collectées</li>
                  <li><strong className="text-foreground">Conservation limitée dans le temps</strong> : les données sont conservées pour une durée limitée</li>
                  <li><strong className="text-foreground">Intégrité et confidentialité</strong> : le responsable du traitement veille à la sécurité des données collectées</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Données personnelles collectées</h2>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">3.1 Données collectées</h3>
                <p className="text-muted-foreground mb-4">Les données personnelles collectées sur le site sont les suivantes :</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong className="text-foreground">Informations d&apos;identification</strong> : prénom, nom, adresse e-mail, numéro de téléphone</li>
                  <li><strong className="text-foreground">Données de connexion</strong> : adresse IP, type de navigateur, données de navigation</li>
                  <li><strong className="text-foreground">Données professionnelles</strong> : entreprise, fonction</li>
                  <li><strong className="text-foreground">Cookies</strong> : préférences de navigation, historique d&apos;interactions</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.2 Durée de conservation</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Nom, e-mail : jusqu&apos;à la demande de suppression ou 3 ans d&apos;inactivité</li>
                  <li>Adresse IP : 30 jours</li>
                  <li>Type de navigateur : 30 jours</li>
                  <li>Cookies : variable (voir politique des cookies)</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.3 Transmission des données</h3>
                <p className="text-muted-foreground">
                  Les données personnelles collectées par le site ne sont pas transmises à des tiers et sont traitées uniquement par l&apos;opérateur du site.
                </p>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.4 Hébergement des données</h3>
                <p className="text-muted-foreground">
                  Le site https://www.agenfy.fr est hébergé par : Vercel, dont le siège est situé à San Francisco, aux États-Unis. Vous pouvez contacter l&apos;hébergeur via leur site web : <a href="https://vercel.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://vercel.com</a>
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Responsable du traitement</h2>
                <div className="bg-card/50 border border-border/50 rounded-xl p-6">
                  <p className="text-foreground mb-2"><strong>Hasfy SAS</strong></p>
                  <p className="text-muted-foreground mb-1">229 rue Saint-Honoré, 75001, Paris</p>
                  <p className="text-muted-foreground">Contact : <a href="mailto:contact@agenfy.fr" className="text-primary hover:underline">contact@agenfy.fr</a></p>
                </div>
                <p className="text-muted-foreground mt-4">
                  Le responsable du traitement s&apos;engage à protéger les données personnelles collectées, à ne pas les divulguer à des tiers sans l&apos;accord de l&apos;utilisateur, et à respecter les finalités pour lesquelles les données ont été collectées.
                </p>
                <p className="text-muted-foreground mt-4">
                  Le site dispose d&apos;un certificat SSL pour garantir la sécurité des informations et des échanges de données via le site.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Droits des utilisateurs</h2>
                <p className="text-muted-foreground mb-4">
                  Conformément au RGPD, l&apos;utilisateur dispose des droits suivants :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong className="text-foreground">Droit d&apos;accès</strong> : obtenir une copie de vos données</li>
                  <li><strong className="text-foreground">Droit de rectification</strong> : corriger vos données</li>
                  <li><strong className="text-foreground">Droit à l&apos;effacement</strong> : supprimer vos données</li>
                  <li><strong className="text-foreground">Droit à la portabilité</strong> : récupérer vos données</li>
                  <li><strong className="text-foreground">Droit d&apos;opposition</strong> : refuser certains traitements</li>
                  <li><strong className="text-foreground">Droit à la limitation</strong> : restreindre le traitement</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Pour exercer ces droits, adressez votre demande à <a href="mailto:contact@agenfy.fr" className="text-primary hover:underline">contact@agenfy.fr</a>. Le responsable du traitement est tenu de répondre dans un délai de 30 jours.
                </p>
                <p className="text-muted-foreground mt-4">
                  Vous pouvez également déposer une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  Le site peut utiliser des techniques de « cookies ». Un « cookie » est un petit fichier stocké par le site sur le disque dur de l&apos;utilisateur, contenant des informations relatives aux habitudes de navigation de l&apos;utilisateur.
                </p>
                <p className="text-muted-foreground mb-4">
                  Les types de cookies utilisés sur ce site comprennent :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong className="text-foreground">Cookies essentiels</strong> : nécessaires au fonctionnement du site</li>
                  <li><strong className="text-foreground">Cookies analytics</strong> : pour mesurer l&apos;audience (avec votre consentement)</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Pour l&apos;utilisation de cookies impliquant le stockage et l&apos;analyse des données personnelles, le consentement de l&apos;utilisateur doit être obtenu. Le consentement est considéré comme valide pour une période maximale de 6 mois.
                </p>
                <p className="text-muted-foreground mt-4">
                  Les utilisateurs peuvent refuser d&apos;accepter les cookies en configurant leur logiciel de navigation.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Modifications</h2>
                <p className="text-muted-foreground">
                  Cette politique de confidentialité peut être consultée à tout moment sur notre site. L&apos;éditeur du site se réserve le droit de la modifier afin d&apos;assurer sa conformité avec la législation en vigueur. En cas de modification substantielle, l&apos;utilisateur sera informé par e-mail.
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
