import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/lib/blog-posts";
import { caseStudies } from "@/lib/case-studies";
import { FileText, Briefcase, Mail, Users, ArrowRight } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { count: subscriberCount, error: subscriberError } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true });

  const { count: newLeadsCount, error: leadsError } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("status", "Nouveau");

  const kpis = [
    { label: "Articles publiés", value: blogPosts.length, icon: FileText },
    { label: "Études de cas", value: caseStudies.length, icon: Briefcase },
    {
      label: "Abonnés newsletter",
      value: subscriberError ? "—" : (subscriberCount ?? 0),
      icon: Mail,
    },
    {
      label: "Nouveaux leads",
      value: leadsError ? "—" : (newLeadsCount ?? 0),
      icon: Users,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-card/50 border-border/50">
            <CardContent className="p-6">
              <kpi.icon className="w-5 h-5 text-primary mb-3" />
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 border-border/50 mb-6">
        <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-foreground font-medium mb-1">Leads entrants</p>
            <p className="text-sm text-muted-foreground">
              Gérez les demandes de contact reçues depuis le site.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin/leads">
              Voir les leads
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            La suite (édition du blog, SEO par page, redirects, génération de contenu IA)
            arrive dans les prochaines phases — voir{" "}
            <code className="text-foreground">docs/ADMIN-ARCHITECTURE.md</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
