import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { ScanSearch, Loader2, Shield } from "lucide-react";
import { z } from "zod";

const emailSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(500),
  sender: z.string().trim().email("Invalid sender email").max(255),
  recipient: z.string().trim().email("Invalid recipient email").max(255).optional().or(z.literal("")),
  body: z.string().trim().min(1, "Email body is required").max(50000),
});

export default function AnalyzeEmail() {
  const [subject, setSubject] = useState("");
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse({ subject, sender, recipient: recipient || undefined, body });
    if (!result.success) {
      toast({ title: "Validation Error", description: result.error.errors[0].message, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-email", {
        body: { subject, sender, recipient, body },
      });

      if (error) throw error;

      // Save to database
      const { data: saved, error: saveError } = await supabase
        .from("analyzed_emails")
        .insert({
          user_id: user!.id,
          subject,
          sender,
          recipient: recipient || null,
          body,
          threat_level: data.threat_level,
          confidence_score: data.confidence_score,
          analysis_summary: data.analysis_summary,
          indicators: data.indicators,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      toast({
        title: "Analysis Complete",
        description: `Threat level: ${data.threat_level.toUpperCase()} (${data.confidence_score}% confidence)`,
      });
      navigate(`/emails/${saved.id}`);
    } catch (err: any) {
      toast({ title: "Analysis Failed", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanSearch className="h-5 w-5 text-primary" />
              Analyze Email
            </CardTitle>
            <CardDescription>
              Paste an email's details below and AegisAI will analyze it for phishing, malware, and tampering threats.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAnalyze}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sender">Sender Email</Label>
                <Input id="sender" type="email" placeholder="sender@example.com" value={sender} onChange={(e) => setSender(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Email (optional)</Label>
                <Input id="recipient" type="email" placeholder="you@example.com" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Email subject line" value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  placeholder="Paste the full email content here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                  required
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" /> Analyze for Threats
                  </>
                )}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
