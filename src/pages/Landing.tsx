import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "FolioX",
  "description": "Build a stunning developer portfolio in minutes.",
  "url": "https://portfolio-hubs.vercel.app/",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
};

const marqueeItems = [
  'Developer Portfolio', 'SEO Optimized', 'Dark Mode',
  'Mobile First', 'Custom Domain', 'Blog Posts', 'Resume Builder',
  'Real Analytics', 'Custom Branding', 'Contact Forms', 'Testimonials',
  'Developer Portfolio', 'SEO Optimized', 'Dark Mode',
  'Mobile First', 'Custom Domain', 'Blog Posts', 'Resume Builder',
  'Real Analytics', 'Custom Branding', 'Contact Forms', 'Testimonials',
];

const features = [
  { num: '01', title: 'Beautiful Themes', body: 'Choose from stunning themes or build your own brand identity with full color control. Every element is yours.' },
  { num: '02', title: 'Developer-First Layouts', body: 'Showcase projects, tech stacks, experience, and certifications with layouts built specifically for developers.' },
  { num: '03', title: 'Blazing Fast', body: 'Under 1 second load time. Optimized assets, minimal JS. Your portfolio makes its impression fast.' },
  { num: '04', title: 'Built-in Blog', body: 'Write technical articles with Markdown, share insights, and build thought leadership — all in one place.' },
  { num: '05', title: 'Custom Portfolio URL', body: 'foliox.com/p/yourname. One link for recruiters, clients, and your resume. Simple and memorable.' },
  { num: '06', title: 'Real Analytics', body: 'See who\'s viewing your portfolio, which pages they visit, and how often. Real insights, zero setup.' },
];

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, [threshold]);
  return scrolled;
}

export default function Landing() {
  const { user } = useAuth();
  const scrolled = useScrolled();

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#F7F5F0' }}>
      <SEO
        title="FolioX | Build a Stunning Portfolio in Minutes"
        description="Build a stunning developer portfolio in minutes. Showcase your projects, skills, and experience. No coding required."
        schema={webAppSchema}
      />

      {/* ── NAV ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(14,14,14,0.96)' : '#0E0E0E',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-5 h-[52px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-[28px] w-[28px] rounded-[6px] flex items-center justify-center" style={{ background: '#C6F135' }}>
              <span className="text-[11px] font-bold font-mono" style={{ color: '#0E0E0E' }}>Fx</span>
            </div>
            <span className="font-display font-bold text-[15px] tracking-tight text-white">FolioX</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <a href="#features" className="hover:text-white transition-colors duration-150">Features</a>
            <a href="#how" className="hover:text-white transition-colors duration-150">How it works</a>
            <a href="#" className="hover:text-white transition-colors duration-150">Blog</a>
          </nav>

          <div className="flex items-center gap-2">
            {/* Theme toggle styled for dark nav */}
            <ThemeToggle />
            {user ? (
              <Link to="/dashboard"
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-[7px] rounded-[6px] transition-all duration-150"
                style={{ background: '#C6F135', color: '#0E0E0E' }}>
                Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link to="/auth"
                  className="text-sm px-3 py-[7px] transition-colors duration-150 hidden sm:block"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = 'white'}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.45)'}
                >
                  Login
                </Link>
                <Link to="/auth"
                  className="flex items-center gap-1.5 text-sm font-semibold px-4 py-[7px] rounded-[6px] transition-all duration-150 hover:opacity-90"
                  style={{ background: '#C6F135', color: '#0E0E0E' }}>
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO — full dark section ── */}
      <section style={{ background: '#0E0E0E', paddingTop: '52px' }}>
        <div className="max-w-[1200px] mx-auto px-5">
          {/* Meta row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between pt-12 pb-8"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <span className="font-mono text-[11px] tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.22)' }}>
              v2.0 — Portfolio Builder
            </span>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#C6F135' }} />
              <span className="font-mono text-[11px] tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.22)' }}>
                Free Forever
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold leading-[0.93] tracking-[-0.03em] pt-12 pb-10"
            style={{
              fontSize: 'clamp(54px, 8.5vw, 116px)',
              color: '#F0EDE6',
            }}
          >
            Build the portfolio<br />
            that gets you{' '}
            <span style={{ color: '#C6F135' }}>noticed.</span>
          </motion.h1>

          {/* Subtext + CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-base md:text-[17px] leading-[1.65] max-w-[380px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
              FolioX is a portfolio builder for developers and creators.
              Beautiful by default, blazing fast, completely free.
            </p>

            <div className="flex items-center gap-3 shrink-0">
              <Link to="/auth"
                className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-[7px] transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#C6F135', color: '#0E0E0E' }}>
                Start building free
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/p/demo"
                className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-[7px] transition-all duration-150"
                style={{
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.55)',
                  background: 'rgba(255,255,255,0.03)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'rgba(255,255,255,0.22)';
                  el.style.color = 'rgba(255,255,255,0.8)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'rgba(255,255,255,0.12)';
                  el.style.color = 'rgba(255,255,255,0.55)';
                }}
              >
                View demo
              </Link>
            </div>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="grid grid-cols-2 md:grid-cols-4"
          >
            {[
              { value: '10K+', label: 'Portfolios built' },
              { value: '4.9★', label: 'Average rating' },
              { value: '<1s', label: 'Page load time' },
              { value: '100%', label: 'Free, always' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="py-7 flex flex-col gap-1.5"
                style={{
                  paddingLeft: i === 0 ? 0 : '32px',
                  paddingRight: i === 3 ? 0 : '32px',
                  borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }}
              >
                <span className="font-display font-bold text-[32px] tracking-tight" style={{ color: '#F0EDE6' }}>
                  {stat.value}
                </span>
                <span className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div
        style={{
          background: '#0E0E0E',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          overflow: 'hidden',
          paddingTop: '12px',
          paddingBottom: '12px',
        }}
      >
        <div className="flex animate-marquee whitespace-nowrap">
          {marqueeItems.map((text, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-5 font-mono text-[10px] tracking-[0.18em] uppercase"
              style={{ margin: '0 24px', color: 'rgba(255,255,255,0.18)' }}
            >
              <span className="h-[3px] w-[3px] rounded-full shrink-0" style={{ background: '#C6F135' }} />
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="max-w-[1200px] mx-auto px-5 py-24">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14"
          style={{ paddingBottom: '28px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}
        >
          <div>
            <span className="block font-mono text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: '#9B9690' }}>
              Features
            </span>
            <h2 className="font-display font-bold text-[clamp(30px,4.5vw,52px)] leading-tight tracking-tight" style={{ color: '#0E0E0E' }}>
              Everything in one place.
            </h2>
          </div>
          <p className="text-sm leading-relaxed max-w-xs md:text-right" style={{ color: '#9B9690' }}>
            Every tool you need to build, customize, and share a portfolio that stands out.
          </p>
        </motion.div>

        {/* Feature rows */}
        <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          {features.map((f, i) => (
            <motion.div
              key={f.num}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.42, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col md:flex-row md:items-center gap-3 py-5 cursor-default"
              style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
            >
              <span className="font-mono text-[11px] w-10 shrink-0 mt-0.5" style={{ color: 'rgba(0,0,0,0.18)' }}>
                {f.num}
              </span>
              <h3
                className="font-display font-bold text-[17px] w-52 shrink-0 transition-colors duration-200"
                style={{ color: '#0E0E0E' }}
              >
                {f.title}
              </h3>
              <p className="text-[14px] leading-relaxed flex-1" style={{ color: '#6B6660' }}>{f.body}</p>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 hidden md:block opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                style={{ color: '#0E0E0E' }}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ background: '#0E0E0E' }}>
        <div className="max-w-[1200px] mx-auto px-5 py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <span className="block font-mono text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.22)' }}>
              Process
            </span>
            <h2
              className="font-display font-bold leading-[1.05] tracking-tight"
              style={{ color: '#F0EDE6', fontSize: 'clamp(32px,4.5vw,56px)' }}
            >
              Up and running<br />in 2 minutes.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              {
                step: '01',
                title: 'Create an account',
                body: 'Sign up for free in under 30 seconds. No credit card needed. Your username becomes your portfolio URL immediately.',
              },
              {
                step: '02',
                title: 'Fill in your details',
                body: 'Add your experience, projects, skills, and education. Upload an avatar and pick your brand color. It\'s that intuitive.',
              },
              {
                step: '03',
                title: 'Share it anywhere',
                body: 'Get your unique link. Put it on your LinkedIn, GitHub bio, or email signature. Start getting noticed by the right people.',
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.48, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-5 py-10"
                style={{
                  paddingLeft: i === 0 ? 0 : '40px',
                  paddingRight: i === 2 ? 0 : '40px',
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }}
              >
                <span className="font-mono text-[11px] tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>{s.step}</span>
                <h3 className="font-display font-bold text-[20px]" style={{ color: '#F0EDE6' }}>{s.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#F7F5F0' }}>
        <div className="max-w-[1200px] mx-auto px-5 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55 }}
          >
            {/* Full-width dark CTA block */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#0E0E0E' }}
            >
              <div className="px-10 md:px-16 py-14 md:py-16 flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div>
                  <span className="block font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Get started for free
                  </span>
                  <h2
                    className="font-display font-bold leading-tight tracking-tight"
                    style={{ color: '#F0EDE6', fontSize: 'clamp(28px,3.5vw,48px)' }}
                  >
                    Ready to impress?
                  </h2>
                  <div className="flex flex-col gap-2 mt-6">
                    {[
                      'No credit card. Free forever.',
                      'Your portfolio URL in minutes.',
                      '10,000+ portfolios already live.',
                    ].map((b) => (
                      <div key={b} className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#C6F135' }} />
                        <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 shrink-0">
                  <Link to="/auth"
                    className="flex items-center justify-center gap-2 text-sm font-bold px-8 py-3.5 rounded-[8px] transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                    style={{ background: '#C6F135', color: '#0E0E0E' }}>
                    Build your portfolio now
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link to="/p/demo"
                    className="flex items-center justify-center text-center text-sm px-8 py-3.5 rounded-[8px] transition-colors duration-150"
                    style={{ color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  >
                    View demo portfolio →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0E0E0E', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-[1200px] mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div className="h-[22px] w-[22px] rounded-[5px] flex items-center justify-center" style={{ background: '#C6F135' }}>
              <span className="text-[9px] font-bold font-mono" style={{ color: '#0E0E0E' }}>Fx</span>
            </div>
            <span className="font-display font-bold text-sm text-white">FolioX</span>
          </div>
          <p className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} FolioX — Free forever
          </p>
          <div className="flex gap-6 font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {['GitHub', 'Twitter', 'Privacy'].map(l => (
              <a key={l} href="#" className="hover:text-white transition-colors duration-150">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
