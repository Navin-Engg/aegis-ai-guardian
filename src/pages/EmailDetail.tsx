import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2, Mail, Clock } from "lucide-react";

export default function EmailDetail() {
  const { id } = useParams();
  const [email, setEmail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("analyzed_emails")
        .select("*")
        .eq("id", id)
        .single();
      setEmail(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const getThreatIcon = (level: string) => {
    if (level === "safe") return <CheckCircle2 className="h-6 w-6 text-success" />;
    return <AlertTriangle className="h-6 w-6 text-destructive" />;
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case "safe": return "bg-success/10 border-success/20";
      case "suspicious": return "bg-warning/10 border-warning/20";
      default: return "bg-destructive/10 border-destructive/20";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <Link to="/emails">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Emails
          </Button>
        </Link>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : !email ? (
          <Card className="glass">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Email not found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Threat Summary */}
            <Card className={`glass border ${getThreatColor(email.threat_level)}`}>
              <CardContent className="flex items-center gap-4 py-6">
                {getThreatIcon(email.threat_level)}
                <div>
                  <h2 className="text-xl font-bold text-foreground capitalize">{email.threat_level}</h2>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {email.confidence_score}% • Analyzed {new Date(email.analyzed_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant={email.threat_level === "safe" ? "default" : "destructive"} className="ml-auto capitalize text-sm px-4 py-1">
                  {email.threat_level}
                </Badge>
              </CardContent>
            </Card>

            {/* Email Details */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" /> Email Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Subject</p>
                    <p className="text-sm font-medium text-foreground">{email.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sender</p>
                    <p className="text-sm font-mono text-foreground">{email.sender}</p>
                  </div>
                  {email.recipient && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Recipient</p>
                      <p className="text-sm font-mono text-foreground">{email.recipient}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date</p>
                    <p className="text-sm text-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {new Date(email.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {email.body && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Body</p>
                    <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground font-mono whitespace-pre-wrap max-h-60 overflow-auto">
                      {email.body}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {email.analysis_summary && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Summary</p>
                    <p className="text-sm text-foreground">{email.analysis_summary}</p>
                  </div>
                )}
                {email.indicators && Array.isArray(email.indicators) && email.indicators.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Threat Indicators</p>
                    <div className="space-y-2">
                      {email.indicators.map((indicator: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded bg-muted/50">
                          <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{indicator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
