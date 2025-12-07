"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {Button} from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {Input} from "@/components/ui/Input";
import {Label} from "@/components/ui/Label";
import {Textarea} from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {supabase} from "@/lib/supabase/client";
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Package,
  ArrowRight,
} from "lucide-react";
import Footer from "@/components/ui/Footer";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState<"mahasiswa" | "kurir">("mahasiswa");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const {data: authData, error: authError} = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const {error: profileError} = await supabase.from("profiles").insert([
          {
            id: authData.user.id,
            role,
            full_name: fullName,
            phone,
            address,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

        if (profileError) throw profileError;

        if (role === "kurir") {
          await supabase.from("courier_locations").insert([
            {
              courier_id: authData.user.id,
              coordinates: [0, 0],
              is_available: true,
              last_updated: new Date().toISOString(),
            },
          ]);
        }

        router.push("/login?registered=true");
      }
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-[80vh] gap-12">
          {/* Left Side - Illustration */}
          <div className="lg:w-1/2 space-y-8 animate-in">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Food<span className="text-primary">Express</span>
              </span>
            </Link>

            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Join{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  FoodExpress
                </span>{" "}
                today
              </h1>
              <p className="text-lg text-muted-foreground">
                Register as a student or courier. Be part of our campus delivery
                community.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">For Students</h3>
                  <p className="text-sm text-muted-foreground">
                    Order food from campus spots. Fast delivery to your
                    location.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">For Couriers</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn money delivering food on campus. Flexible hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="lg:w-1/2 w-full max-w-md">
            <Card className="border-none shadow-strong animate-in slide-up">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Create Account</CardTitle>
                <CardDescription>
                  Fill in your details to join our community
                </CardDescription>
              </CardHeader>

              <CardContent>
                {error && (
                  <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          placeholder="John Doe"
                          className="pl-10"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+62 812 3456 7890"
                          className="pl-10"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Must be at least 6 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your campus address or dorm location"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>I want to join as</Label>
                    <Select
                      value={role}
                      onValueChange={(value: "mahasiswa" | "kurir") =>
                        setRole(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="mahasiswa"
                          className="flex items-center"
                        >
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>Student (Order Food)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="kurir">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>Courier (Deliver Food)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {role === "kurir" && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-center space-x-2 text-primary">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Courier Benefits</span>
                      </div>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <li>• Earn money on flexible hours</li>
                        <li>• Use your own transportation</li>
                        <li>• Work around your class schedule</li>
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Link href="#" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full group"
                  >
                    {loading ? "Creating account..." : "Create Account"}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </form>
              </CardContent>

              <CardFooter>
                <p className="text-center text-sm text-muted-foreground w-full">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </Card>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                By creating an account, you agree to our campus delivery
                policies.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
