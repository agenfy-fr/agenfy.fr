import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { blogPosts } from "@/lib/blog-posts";
import { caseStudies } from "@/lib/case-studies";
import { FileText, Briefcase, Mail, LogOut } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: subscriberCount, error: subscriberError } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true });

  const kpis = [
    { label: "Articles publiés", value: blogPosts.length, icon: FileText },
    { label: "Études de cas", value: caseStudies.length, icon: Briefcase },
    {
      label: "Abonnés newsletter",
      value: subscriberError ? "—" : (subscriberCount ?? 0),
      icon: Mail,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">Connecté en tant que {user?.email}</p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm" className="rounded-full">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </form>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
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

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Première version du dashboard : authentification fonctionnelle, pas encore de
            gestion de contenu. La suite (édition du blog, leads, SEO par page, redirects)
            arrive dans les prochaines phases — voir{" "}
            <code className="text-foreground">docs/ADMIN-ARCHITECTURE.md</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
