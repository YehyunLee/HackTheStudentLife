import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  Search,
  MessageCircle,
  Sparkles,
  GraduationCap,
  Briefcase,
  BookOpen,
  Shield,
  Zap,
  Globe,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-[60vh] pt-10 relative overflow-hidden bg-[url('../components/img/uoft-background.png')] bg-cover bg-center text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-[#001a3d]/70 via-[#002550]/55 to-[#003d76]/30" />
        <div className="absolute inset-0 bg-gradient-radial from-white/35 via-white/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:py-4">
          <div className="mx-auto max-w-3xl text-center rounded-[32px] bg-white/20 px-6 py-10 backdrop-blur-xl shadow-[0_35px_90px_rgba(0,23,49,0.35)] border border-white/25">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm text-white/90">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span>Hack the Student Life 2026</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl drop-shadow-[0_12px_35px_rgba(0,0,0,0.4)]">
              Connect with the
              <span className="block bg-gradient-to-r from-sky-200 via-white to-cyan-200 bg-clip-text text-transparent">
                UofT Community
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/90">
              Discover professors, alumni, and peers who share your interests.
              Build meaningful connections that strengthen your academic journey
              and career path.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/feed">
                <Button
                  size="lg"
                  className="bg-white text-[#002A5C] hover:bg-blue-50 font-semibold px-8 h-12 text-base"
                >
                  Explore Feed
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/discover">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 h-12 text-base bg-transparent"
                >
                  Find Connections
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Wave divider */}
        <div className="absolute -bottom-px left-0 right-0 ">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 46.7C840 53.3 960 66.7 1080 70C1200 73.3 1320 66.7 1380 63.3L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-[#002A5C]">
            One platform, every perspective
          </h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">
            Whether you&apos;re a student exploring opportunities, an alumni giving
            back, or a professor seeking collaborators — UofT Connect is for you.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: GraduationCap,
              title: "Students",
              desc: "Find mentors, study groups, and research opportunities aligned with your goals.",
              color: "from-sky-500 to-blue-600",
              bg: "bg-sky-50",
            },
            {
              icon: Briefcase,
              title: "Alumni",
              desc: "Give back by mentoring students and staying connected with the UofT community.",
              color: "from-amber-500 to-orange-600",
              bg: "bg-amber-50",
            },
            {
              icon: BookOpen,
              title: "Professors",
              desc: "Find research assistants, collaborators, and share your expertise with students.",
              color: "from-emerald-500 to-green-600",
              bg: "bg-emerald-50",
            },
            {
              icon: Shield,
              title: "Mentors",
              desc: "Industry partners and advisors helping shape the next generation of leaders.",
              color: "from-violet-500 to-purple-600",
              bg: "bg-violet-50",
            },
          ].map((role) => (
            <Card
              key={role.title}
              className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${role.color}`}
                >
                  <role.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">{role.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {role.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#002A5C]">
              How it works
            </h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              Built for the UofT community, powered by AWS
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Search,
                title: "Discover",
                desc: "AI-powered matching finds professors, alumni, and peers aligned with your interests and career goals.",
                step: "01",
              },
              {
                icon: MessageCircle,
                title: "Connect",
                desc: "Reach out casually or professionally. Start conversations that matter with privacy controls you trust.",
                step: "02",
              },
              {
                icon: Users,
                title: "Collaborate",
                desc: "Form study groups, join research projects, attend events, and grow your academic network.",
                step: "03",
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#002A5C]">
                  <feature.icon className="h-7 w-7 text-white" />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white">
                    {feature.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AWS + Tech Stack */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#002A5C]">
              Powered by AWS
            </h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              Enterprise-grade cloud infrastructure for a seamless experience
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { name: "Cognito", desc: "Auth & Identity" },
              { name: "DynamoDB", desc: "Profile Storage" },
              { name: "Personalize", desc: "AI Matching" },
              { name: "AppSync", desc: "Real-time API" },
              { name: "Amplify", desc: "Web Hosting" },
              { name: "SES", desc: "Notifications" },
            ].map((service) => (
              <Card
                key={service.name}
                className="border shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="flex flex-col items-center p-4 text-center">
                  <Zap className="mb-2 h-6 w-6 text-[#FF9900]" />
                  <span className="text-sm font-semibold text-gray-900">
                    {service.name}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {service.desc}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#002A5C] py-16 text-white text-center">
        <div className="mx-auto max-w-2xl px-4">
          <Globe className="mx-auto mb-4 h-10 w-10 text-blue-300" />
          <h2 className="text-3xl font-bold">
            Ready to strengthen your UofT network?
          </h2>
          <p className="mt-3 text-blue-200 max-w-md mx-auto">
            Join students, alumni, and faculty already building meaningful
            connections across the university.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/feed">
              <Button
                size="lg"
                className="bg-white text-[#002A5C] hover:bg-blue-50 font-semibold px-8"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 overflow-hidden rounded bg-cover bg-center bg-[url('../components/img/uoft-logo.png')]">
            </div>
            <span className="text-sm font-semibold text-[#002A5C]">
              UofT Connect
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Built at Hack the Student Life 2026 — AWS x Softchoice x IEEE UofT
          </p>
        </div>
      </footer>
    </div>
  );
}
