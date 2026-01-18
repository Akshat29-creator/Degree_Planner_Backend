"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Brain,
  Target,
  TrendingUp,
  ArrowRight,
  Users,
  Zap,
  GraduationCap,
  Sparkles,
  Shield,
  Clock,
  CheckCircle2,
  ChevronRight,
  Github,
  Twitter,
  Linkedin
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- COMPONENTS ---

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
      scrolled ? "bg-black/80 backdrop-blur-md border-white/10 py-4" : "bg-transparent border-transparent py-6"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">DegreePlanner</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/register">
            <Button size="sm" className="rounded-full bg-white text-black hover:bg-zinc-200">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function StatsTicker() {
  const stats = [
    { label: "Course Combinations", value: "10M+" },
    { label: "Universities Supported", value: "500+" },
    { label: "Student Happiness", value: "99%" },
    { label: "Time Saved", value: "100hrs" },
  ];

  return (
    <div className="border-y border-white/10 bg-black/50 backdrop-blur-sm z-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-1">
              <h4 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
                {stat.value}
              </h4>
              <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



// --- SCROLL TEXT ---
function ScrollRevealText({ children, className }: { children: React.ReactNode, className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-20% 0px -20% 0px", once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- HOLOGRAPHIC CARD ---
function HolographicCard({ feature, index }: { feature: any, index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);

  const rotateX = useTransform(y, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(x, [-0.5, 0.5], ["-15deg", "15deg"]);

  function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "group relative min-h-[300px] overflow-visible rounded-3xl p-[1px] transition-all duration-200 ease-linear",
        feature.colSpan
      )}
    >
      <div className={cn("absolute inset-0 rounded-3xl opacity-20 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r", feature.gradient)} />
      <div className="relative h-full w-full rounded-3xl bg-black/90 p-8 flex flex-col justify-between overflow-hidden">
        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: useTransform(
              [x, y],
              (values: any) => {
                const [latestX, latestY] = values;
                return `radial-gradient(600px circle at ${(latestX + 0.5) * 100}% ${(latestY + 0.5) * 100}%, rgba(255,255,255,0.1), transparent 40%)`;
              }
            )
          }}
        />
        <div className="relative z-10 transform translate-z-20">
          <div className={cn("mb-6 inline-flex rounded-2xl p-4 ring-1 ring-inset bg-white/5 backdrop-blur-md shadow-lg group-hover:scale-110 transition-transform duration-300 w-fit", feature.color.replace('text-', 'ring-'))}>
            <feature.icon className={cn("h-8 w-8", feature.color)} />
          </div>
          <h3 className={cn("text-3xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r", feature.gradient)}>
            {feature.title}
          </h3>
          <p className="text-zinc-400 text-lg leading-relaxed font-medium group-hover:text-white transition-colors">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 200]);

  // Generate stars on client
  const [stars, setStars] = useState<any[]>([]);
  useEffect(() => {
    setStars([...Array(200)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5
    })));
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Automated conflict-free generation.",
      color: "text-rose-400",
      gradient: "from-orange-400 to-rose-500",
      colSpan: "md:col-span-2",
    },
    {
      icon: Brain,
      title: "Career Genius",
      description: "AI-driven skill mapping.",
      color: "text-violet-400",
      gradient: "from-violet-400 to-fuchsia-500",
      colSpan: "md:col-span-1",
    },
    {
      icon: TrendingUp,
      title: "Grade Guard",
      description: "Predictive GPA simulations.",
      color: "text-emerald-400",
      gradient: "from-emerald-400 to-teal-500",
      colSpan: "md:col-span-1",
    },
    {
      icon: Users,
      title: "Social Study",
      description: "Connect with peers based on courses.",
      color: "text-blue-400",
      gradient: "from-blue-400 to-cyan-500",
      colSpan: "md:col-span-1",
    },
    {
      icon: Target,
      title: "Goal Tracker",
      description: "Keep your milestones in sight.",
      color: "text-yellow-400",
      gradient: "from-yellow-400 to-orange-500",
      colSpan: "md:col-span-1",
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white selection:bg-fuchsia-500/30 font-sans overflow-x-hidden">

      <LandingNav />

      {/* BACKGROUND GRID */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-black">
        {/* Grid Line Animation */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,30,40,0.5)_0%,rgba(0,0,0,1)_100%)]" />

        {/* Floating Stars */}
        {stars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] bg-white rounded-full opacity-20"
            initial={{ opacity: 0.1, top: star.top, left: star.left }}
            animate={{ opacity: [0.1, 0.8, 0.1] }}
            transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
          />
        ))}
      </div>

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-20">
        <motion.div style={{ y: heroY }} className="z-10 text-center px-4 max-w-5xl mx-auto">

          {/* Badge */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur-md"
          >
            <Sparkles className="w-3 h-3 text-violet-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wide text-violet-300 uppercase">
              Now with Career Gap Analysis
            </span>
          </motion.div>

          {/* Main Title */}
          <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter leading-[0.9] mb-8">
            <span className="block text-white">DESIGN</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white animate-gradient-x p-2">
              YOUR FUTURE
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            The intelligent <span className="text-white font-medium">Degree Architect</span> that transforms your transcript into a career-ready roadmap in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.push("/register")}
                className="h-16 px-10 rounded-full text-xl font-bold bg-white text-black hover:bg-zinc-200 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                Start Planning Free
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="h-16 px-10 rounded-full text-xl font-bold bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <StatsTicker />

      {/* TEXT REVEAL SECTION */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-20">
          <ScrollRevealText className="text-4xl md:text-6xl font-bold">
            Stop playing <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">catch-up</span> with your credits.
          </ScrollRevealText>

          <ScrollRevealText className="text-4xl md:text-6xl font-bold">
            Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">dominating</span> your degree.
          </ScrollRevealText>

          <ScrollRevealText className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            DegreePlanner simulates thousands of semester combinations to find your optimal path—so you graduate on time, every time.
          </ScrollRevealText>
        </div>
      </section>

      {/* PARALLAX FEATURES */}
      <section className="relative z-10 py-20 px-4 max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400">
              Power Tools
            </span> for Students
          </h2>
          <p className="text-zinc-500 text-lg">Everything you need to succeed, all in one dashboard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 perspective-1000">
          {features.map((feature, i) => (
            <HolographicCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS - REDESIGNED */}
      <section className="relative z-10 py-32 bg-zinc-900/40 border-y border-white/5 my-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">From Chaos to Clarity</h2>
            <p className="text-zinc-400">Your perfect schedule in 3 simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Creating the connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-rose-500/50 via-violet-500/50 to-emerald-500/50 border-t border-dashed border-white/20 -z-10" />

            {[
              {
                step: "01",
                title: "Upload",
                desc: "Drop your transcript PDF. We parse it instantly.",
                icon: Shield,
                color: "text-rose-400",
                bg: "bg-rose-500/10",
                border: "border-rose-500/20"
              },
              {
                step: "02",
                title: "Generate",
                desc: "Receive a personalized 4-year plan in seconds.",
                icon: Zap,
                color: "text-violet-400",
                bg: "bg-violet-500/10",
                border: "border-violet-500/20"
              },
              {
                step: "03",
                title: "Execute",
                desc: "Track progress and auto-adjust as you go.",
                icon: CheckCircle2,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20"
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center group"
              >
                <div className={cn("w-24 h-24 rounded-3xl flex items-center justify-center mb-8 border backdrop-blur-md shadow-2xl relative transition-transform duration-300 group-hover:scale-110", item.bg, item.border)}>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center font-bold text-xs text-zinc-400 shadow-lg">
                    {item.step}
                  </div>
                  <item.icon className={cn("w-10 h-10", item.color)} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-zinc-400 leading-relaxed max-w-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BIG CTA */}
      <section className="py-32 flex flex-col items-center justify-center relative z-10 overflow-hidden">
        <div className="text-center z-10 max-w-4xl px-4">
          <h2 className="text-5xl md:text-8xl font-black leading-none tracking-tighter mb-10 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-600">
            READY TO PLAN?
          </h2>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => router.push("/register")}
              className="h-24 px-16 rounded-full text-3xl font-bold bg-white text-black hover:bg-zinc-200 shadow-[0_0_60px_rgba(255,255,255,0.4)] border-4 border-white/50"
            >
              Get Started Now <ChevronRight className="ml-2 w-8 h-8" />
            </Button>
          </motion.div>
          <p className="mt-8 text-zinc-500">No credit card required. Free for students.</p>
        </div>
      </section>


    </div>
  );
}
