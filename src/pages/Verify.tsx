import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

export default function Verify() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { verifyOtp } = useAuth();
  const email = (location.state as { email?: string })?.email || "";

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({ title: "Invalid Code", description: "Please enter the 6-digit verification code.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await verifyOtp(email, otp);
    setLoading(false);
    if (error) {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Verified!", description: "Your account has been verified successfully." });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark px-4">
      <Card className="w-full max-w-md glass glow-primary">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">AegisAI</span>
          </Link>
          <CardTitle className="text-xl">Two-Step Verification</CardTitle>
          <CardDescription>
            {email ? `Enter the 6-digit code sent to ${email}` : "Enter your verification code"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button className="w-full" onClick={handleVerify} disabled={loading || otp.length !== 6}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Verify & Continue
          </Button>
          <p className="text-sm text-muted-foreground">
            Didn't receive a code?{" "}
            <button className="text-primary hover:underline font-medium" onClick={() => toast({ title: "Code Resent", description: "A new code has been sent to your email." })}>
              Resend
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
