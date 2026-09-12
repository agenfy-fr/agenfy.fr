import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeadStatusSelect } from "./lead-status-select";
import { Mail, Phone, Building2 } from "lucide-react";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-foreground mb-6">Leads</h1>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <p className="text-foreground font-medium mb-2">
              La table &quot;leads&quot; n&apos;existe pas encore.
            </p>
            <p className="text-sm text-muted-foreground">
              Appliquez la migration{" "}
              <code className="text-foreground">supabase/migrations/0001_leads.sql</code> depuis
              le SQL Editor de votre projet Supabase, puis rechargez cette page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Leads</h1>
        <span className="text-sm text-muted-foreground">{leads?.length ?? 0} au total</span>
      </div>

      {!leads || leads.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Aucun lead pour le moment. Les soumissions du formulaire de contact apparaîtront
              ici.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <Card key={lead.id} className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <p className="font-medium text-foreground">{lead.name}</p>
                    {lead.company && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" />
                        {lead.company}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {lead.service && (
                      <Badge variant="outline" className="rounded-full">
                        {lead.service}
                      </Badge>
                    )}
                    <LeadStatusSelect leadId={lead.id} status={lead.status} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {lead.email}
                  </a>
                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {lead.phone}
                    </a>
                  )}
                </div>

                {lead.message && (
                  <p className="text-sm text-foreground bg-secondary/50 rounded-lg p-3 mb-3">
                    {lead.message}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Reçu le{" "}
                  {new Date(lead.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {lead.source && ` · Source : ${lead.source}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
