import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import DigitalIdButton from "@/components/digital-id-button"
import { FancyButtonType2  } from "@/components/ui/fancy-button2";


import {
  Shield,
  Users,
  AlertTriangle,
  MapPin,
  Smartphone,
  Brain,
  Globe,
  Star,
  CheckCircle,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-professional">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 gradient-primary rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">SafeTour</h1>
                <p className="text-sm text-muted-foreground">Smart Tourist Safety Monitoring System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="border-primary/20 bg-transparent">
                <Globe className="h-4 w-4 mr-2" />
                EN
              </Button>
              <Button className="bg-destructive hover:bg-destructive/90 shadow-professional">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/modern-city-skyline-with-digital-overlay-and-safet.jpg"
            alt="Smart city background"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">
              Advanced Tourist Safety Monitoring &<span className="text-gradient"> Incident Response</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty leading-relaxed">
              Comprehensive digital platform ensuring tourist safety through AI-powered monitoring, real-time incident
              response, and blockchain-secured digital identification.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <DigitalIdButton href="/register" />
              
              <FancyButtonType2>
                <Link href="/police-login">
                  <Shield className="h-5 w-5 mr-2" />
                  security dashboard
                </Link>
              </FancyButtonType2>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Blockchain Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-warning" />
                <span>24/7 Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-foreground mb-6">System Components</h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our integrated platform combines multiple technologies to provide comprehensive safety coverage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Digital ID Generation */}

            <Card className="border-border hover:shadow-professional transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 gradient-primary rounded-xl group-hover:scale-110 transition-transform">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">Digital Tourist ID</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Blockchain-secured identification
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-lg overflow-hidden">
                  <Image
                    src="/digital-id-card-with-qr-code-and-blockchain-securi.jpg"
                    alt="Digital Tourist ID"
                    width={300}
                    height={200}
                    className="w-full h-32 object-cover"
                  />
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Secure, tamper-proof digital identification system with QR codes and blockchain verification.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Blockchain
                  </Badge>
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                    QR Codes
                  </Badge>
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    Secure
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Application */}
            <Card className="border-border hover:shadow-professional transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 gradient-primary rounded-xl group-hover:scale-110 transition-transform">
                    <Smartphone className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">Mobile App</CardTitle>
                    <CardDescription className="text-muted-foreground">Tourist safety companion</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-lg overflow-hidden">
                  <Image
                    src="/mobile-app-interface-showing-safety-map-with-locat.jpg"
                    alt="Mobile Safety App"
                    width={300}
                    height={200}
                    className="w-full h-32 object-cover"
                  />
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Real-time safety scoring, geo-fencing alerts, panic button, and multilingual support.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Real-time
                  </Badge>
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                    Geo-fencing
                  </Badge>
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    Multilingual
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* AI Anomaly Detection */}
            <Card className="border-border hover:shadow-professional transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 gradient-primary rounded-xl group-hover:scale-110 transition-transform">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">AI Detection</CardTitle>
                    <CardDescription className="text-muted-foreground">Intelligent monitoring system</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-lg overflow-hidden">
                  <Image
                    src="/ai-dashboard-with-neural-network-visualization-and.jpg"
                    alt="AI Anomaly Detection"
                    width={300}
                    height={200}
                    className="w-full h-32 object-cover"
                  />
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Machine learning algorithms detect unusual patterns and potential safety threats automatically.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Machine Learning
                  </Badge>
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                    Pattern Recognition
                  </Badge>
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    Automated
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Admin Dashboard */}
            <Card className="border-border hover:shadow-professional transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 gradient-primary rounded-xl group-hover:scale-110 transition-transform">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">Admin Dashboard</CardTitle>
                    <CardDescription className="text-muted-foreground">Command & control center</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-lg overflow-hidden">
                  <Image
                    src="/professional-admin-dashboard-with-charts--maps--an.jpg"
                    alt="Admin Dashboard"
                    width={300}
                    height={200}
                    className="w-full h-32 object-cover"
                  />
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Comprehensive dashboard for tourism departments and police with real-time monitoring.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Real-time
                  </Badge>
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                    Analytics
                  </Badge>
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    Multi-user
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* IoT Integration */}
            <Card className="border-border hover:shadow-professional transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 gradient-primary rounded-xl group-hover:scale-110 transition-transform">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">IoT Integration</CardTitle>
                    <CardDescription className="text-muted-foreground">Smart city connectivity</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-lg overflow-hidden">
                  <Image
                    src="/iot-sensors-and-smart-city-infrastructure-with-con.jpg"
                    alt="IoT Integration"
                    width={300}
                    height={200}
                    className="w-full h-32 object-cover"
                  />
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Integration with smart city infrastructure, emergency beacons, and sensor networks.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    IoT Sensors
                  </Badge>
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                    Smart City
                  </Badge>
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Data Privacy */}
            <Card className="border-border hover:shadow-professional transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 gradient-primary rounded-xl group-hover:scale-110 transition-transform">
                    <AlertTriangle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">Data Privacy</CardTitle>
                    <CardDescription className="text-muted-foreground">GDPR compliant security</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-lg overflow-hidden">
                  <Image
                    src="/data-security-visualization-with-encryption-locks-.jpg"
                    alt="Data Privacy & Security"
                    width={300}
                    height={200}
                    className="w-full h-32 object-cover"
                  />
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  End-to-end encryption, GDPR compliance, and comprehensive data protection measures.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    GDPR
                  </Badge>
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                    Encrypted
                  </Badge>
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    Secure
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">System Performance</h3>
            <p className="text-muted-foreground">Real-time metrics from our safety monitoring platform</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-card rounded-xl shadow-professional">
              <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
                <TrendingUp className="h-8 w-8" />
                24/7
              </div>
              <div className="text-muted-foreground font-medium">Monitoring Coverage</div>
            </div>
            <div className="text-center p-6 bg-card rounded-xl shadow-professional">
              <div className="text-4xl font-bold text-accent mb-2">5 Min</div>
              <div className="text-muted-foreground font-medium">Average Response Time</div>
            </div>
            <div className="text-center p-6 bg-card rounded-xl shadow-professional">
              <div className="text-4xl font-bold text-success mb-2">12+</div>
              <div className="text-muted-foreground font-medium">Supported Languages</div>
            </div>
            <div className="text-center p-6 bg-card rounded-xl shadow-professional">
              <div className="text-4xl font-bold text-warning mb-2">99.9%</div>
              <div className="text-muted-foreground font-medium">System Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 gradient-primary rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gradient">SafeTour System</span>
            </div>
            <div className="text-muted-foreground">© 2024 Tourist Safety Monitoring System. All rights reserved.</div>
          </div>
        </div>
      </footer>
      {/* <div className="flex justify-center items-center h-screen bg-gray-900">
      <Card
        variant="fancy"
        title="Explore More"
        description="Dive into curated collections, traverse user-friendly interfaces, and let curiosity guide your exploration."
      />
    </div> */}

    </div>
  )
}
