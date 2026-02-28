import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";
import { SkeletonEmailList } from "@/components/skeletons/SkeletonEmailList";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Search, Filter, ScanSearch } from "lucide-react";

const THREAT_FILTERS = ["all", "safe", "suspicious", "phishing", "malicious", "tampering"] as const;

const threatBadgeVariant = (level: string) => {
  switch (level) {
    case "safe": return "default" as const;
    case "suspicious": return "secondary" as const;
    default: return "destructive" as const;
  }
};

export default function EmailList() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("analyzed_emails")
        .select("*")
        .order("created_at", { ascending: false });
      setEmails(data || []);
      setLoading(false);
    };
    const timer = setTimeout(fetch, 600);
    return () => clearTimeout(timer);
  }, [user]);

  const filtered = emails.filter((e) => {
    const matchesFilter = filter === "all" || e.threat_level === filter;
    const matchesSearch = !search || e.subject.toLowerCase().includes(search.toLowerCase()) || e.sender.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <DashboardLayout>
      {loading ? (
        <SkeletonEmailList />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">Analyzed Emails</h1>
            <Link to="/analyze">
              <Button className="gap-2"><ScanSearch className="h-4 w-4" /> Analyze New</Button>
            </Link>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by subject or sender..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {THREAT_FILTERS.map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  className="capitalize text-xs"
                  onClick={() => setFilter(f)}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          {/* Email list */}
          <Card className="glass">
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No emails found</p>
                  <p className="text-sm mt-1">{emails.length === 0 ? "Start by analyzing an email" : "Try adjusting your filters"}</p>
                </div>
              ) : (
                filtered.map((email) => (
                  <Link
                    key={email.id}
                    to={`/emails/${email.id}`}
                    className="flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      email.threat_level === "safe" ? "bg-success/10" : email.threat_level === "suspicious" ? "bg-warning/10" : "bg-destructive/10"
                    }`}>
                      <Mail className={`h-5 w-5 ${
                        email.threat_level === "safe" ? "text-success" : email.threat_level === "suspicious" ? "text-warning" : "text-destructive"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{email.subject}</p>
                      <p className="text-xs text-muted-foreground">From: {email.sender} • {new Date(email.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {email.confidence_score && (
                        <span className="text-xs text-muted-foreground font-mono">{email.confidence_score}%</span>
                      )}
                      <Badge variant={threatBadgeVariant(email.threat_level)} className="capitalize text-xs">
                        {email.threat_level}
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
