"use client";

import {useState, useEffect} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {useAuth} from "@/components/providers/AuthProvider";
import Footer from "@/components/ui/Footer";
import {
  ArrowRight,
  Package,
  Clock,
  Shield,
  MapPin,
  Star,
  ChevronRight,
  Users,
  Zap,
  Truck,
  Phone,
} from "lucide-react";
import {cn} from "@/lib/utils";

export default function HomePage() {
  const {user, loading} = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Fast Delivery",
      description: "Get your food delivered in under 30 minutes",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Payment",
      description: "100% secure payment with Midtrans",
      color: "from-emerald-500 to-green-500",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Real-time Tracking",
      description: "Track your order live on the map",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Campus Community",
      description: "Supporting student couriers",
      color: "from-orange-500 to-red-500",
    },
  ];

  const stats = [
    {label: "Orders Delivered", value: "10,000+"},
    {label: "Happy Customers", value: "5,000+"},
    {label: "Student Couriers", value: "500+"},
    {label: "Delivery Time", value: "<30 min"},
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in">
              <div className="inline-flex items-center rounded-full border px-4 py-2 text-sm bg-primary/10 border-primary/20">
                <span className="mr-2">🚀</span>
                Fastest Campus Delivery
              </div>

              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Hungry?{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  We've got you
                </span>
                <br />
                covered.
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl">
                Order food from your favorite campus spots and get it delivered
                fast by student couriers. Simple, fast, and reliable.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {!user ? (
                  <>
                    <Button size="lg" className="group">
                      <Link href="/register">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline">
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </>
                ) : (
                  <Button size="lg" className="group">
                    <Link
                      href={user.role === "kurir" ? "/courier" : "/dashboard"}
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-primary/10"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Rated 4.9/5 by 1000+ students
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative">
                    {/* Hero Illustration */}
                    <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl" />
                    <div className="relative space-y-6">
                      <div className="glass-effect rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                            <Package className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Instant Delivery</h3>
                            <p className="text-sm text-muted-foreground">
                              From campus to your door
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="glass-effect rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                            <Truck className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Live Tracking</h3>
                            <p className="text-sm text-muted-foreground">
                              Watch your order arrive
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="text-primary">FoodExpress</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for convenient campus food delivery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-none bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-soft hover:shadow-strong transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={cn(
                    "absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity",
                    `bg-gradient-to-br ${feature.color}`
                  )}
                />
                <CardHeader>
                  <div
                    className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center mb-4",
                      `bg-gradient-to-br ${feature.color}`
                    )}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to get your food delivered
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
              {[
                {
                  step: "01",
                  title: "Create Order",
                  description:
                    "Select pickup and delivery locations on the map",
                  icon: "📍",
                },
                {
                  step: "02",
                  title: "Track Delivery",
                  description: "Watch your order being delivered in real-time",
                  icon: "🚚",
                },
                {
                  step: "03",
                  title: "Enjoy Food",
                  description: "Receive your food fresh and fast",
                  icon: "🎉",
                },
              ].map((step, index) => (
                <div key={index} className="relative">
                  <Card className="relative overflow-hidden border-none bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-soft hover:shadow-medium transition-all duration-300">
                    <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-xl" />
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                            <span className="text-2xl">{step.icon}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">
                            Step {step.step}
                          </div>
                          <h3 className="text-xl font-semibold mb-2">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary to-primary/80">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Ready to get started?
                  </h2>
                  <p className="text-lg text-white/80 mb-6">
                    Join thousands of students enjoying fast food delivery on
                    campus.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="bg-white text-primary hover:bg-white/90"
                    >
                      <Link href="/register">
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                    >
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </div>
                </div>
                <div className="flex justify-center lg:justify-end">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-xl" />
                    <div className="relative rounded-2xl bg-white/10 backdrop-blur-sm p-6">
                      <div className="text-center">
                        <Phone className="h-12 w-12 text-white mx-auto mb-4" />
                        <p className="text-white font-medium">
                          Available on campus now
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
