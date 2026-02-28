import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, Mail, CheckCircle2, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { SkeletonDashboard } from "@/components/skeletons/SkeletonDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const COLORS = {
  safe: "hsl(142, 72%, 40%)",
  suspicious: "hsl(38, 92%, 50%)",
  phishing: "hsl(0, 72%, 55%)",
  malicious: "hsl(0, 62%, 45%)",
  tampering: "hsl(262, 60%, 55%)",
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchEmails = async () => {
      const { data } = await supabase
        .from("analyzed_emails")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setEmails(data || []);
      setLoading(false);
    };
    // Simulate loading for skeleton showcase
    const timer = setTimeout(fetchEmails, 800);
    return () => clearTimeout(timer);
  }, [user]);

  if (loading) return <DashboardLayout><SkeletonDashboard /></DashboardLayout>;

  const threatCounts = {
    safe: emails.filter((e) => e.threat_level === "safe").length,
    suspicious: emails.filter((e) => e.threat_level === "suspicious").length,
    phishing: emails.filter((e) => e.threat_level === "phishing").length,
    malicious: emails.filter((e) => e.threat_level === "malicious").length,
    tampering: emails.filter((e) => e.threat_level === "tampering").length,
  };

  const pieData = Object.entries(threatCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  const barData = [
    { name: "Safe", count: threatCounts.safe },
    { name: "Suspicious", count: threatCounts.suspicious },
    { name: "Phishing", count: threatCounts.phishing },
    { name: "Malicious", count: threatCounts.malicious },
    { name: "Tampering", count: threatCounts.tampering },
  ];

  const stats = [
    { title: "Total Scanned", value: emails.length, icon: Mail, color: "text-primary" },
    { title: "Safe Emails", value: threatCounts.safe, icon: CheckCircle2, color: "text-success" },
    { title: "Threats Detected", value: threatCounts.phishing + threatCounts.malicious + threatCounts.tampering, icon: AlertTriangle, color: "text-destructive" },
    { title: "Detection Rate", value: emails.length > 0 ? `${Math.round(((threatCounts.phishing + threatCounts.malicious + threatCounts.tampering) / emails.length) * 100)}%` : "N/A", icon: TrendingUp, color: "text-warning" },
  ];

  const recentEmails = emails.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor your email threat landscape</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.title} className="glass">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader><CardTitle className="text-base">Threats by Category</CardTitle></CardHeader>
            <CardContent>
              {emails.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>No emails analyzed yet</p>
                    <Link to="/analyze" className="text-primary text-sm hover:underline">Analyze your first email →</Link>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 16%)" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(220 10% 55%)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(220 10% 55%)", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "hsl(222 30% 9%)", border: "1px solid hsl(220 20% 16%)", borderRadius: 8 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {barData.map((entry) => (
                        <Cell key={entry.name} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || COLORS.safe} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader><CardTitle className="text-base">Threat Distribution</CardTitle></CardHeader>
            <CardContent>
              {pieData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <p>No data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || COLORS.safe} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(222 30% 9%)", border: "1px solid hsl(220 20% 16%)", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Emails */}
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Analyses</CardTitle>
            <Link to="/emails" className="text-sm text-primary hover:underline">View All →</Link>
          </CardHeader>
          <CardContent>
            {recentEmails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No emails analyzed yet. <Link to="/analyze" className="text-primary hover:underline">Start analyzing →</Link></p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentEmails.map((email) => (
                  <Link key={email.id} to={`/emails/${email.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{email.subject}</p>
                      <p className="text-xs text-muted-foreground">{email.sender}</p>
                    </div>
                    <Badge variant={email.threat_level === "safe" ? "default" : "destructive"} className="ml-2 capitalize text-xs">
                      {email.threat_level}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
