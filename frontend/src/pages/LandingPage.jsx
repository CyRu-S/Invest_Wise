import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, TrendingUp, Shield, Wallet, CheckCircle2, Star, Zap, Globe, Users, Link as LinkIcon } from 'lucide-react';
import { MagicCard, MagicGrid } from '../components/MagicCard';
import SplineChainBackground from '../components/SplineChainBackground';

export default function LandingPage() {
  return (
    <div id="landing-page" className="min-h-screen relative bg-transparent text-foreground selection:bg-primary/20">

      {/* Spline 3D Chain Background */}
      <SplineChainBackground />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 hover:glow-blue transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground/80">
              New: AI-Powered Portfolio Analysis
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Invest Smarter with
            <br />
            <span className="gradient-text">Intelligent Insights</span>
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            InvestWise helps you track your mutual funds, analyze risk, and discover top-performing opportunities using advanced analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link to="/register">
              <button className="bg-primary hover:bg-primary/90 text-white px-8 h-14 text-lg rounded-full glow-blue transition-all hover:scale-105 inline-flex items-center gap-2 font-semibold">
                Start Investing Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/funds">
              <button className="px-8 h-14 text-lg rounded-full border border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-primary/10 transition-all hover:scale-105 text-foreground font-semibold">
                Explore Funds
              </button>
            </Link>
          </div>
        </div>

        {/* Dashboard Preview / Visual */}
        <div className="mt-20 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="relative rounded-2xl border border-white/10 glass-card p-2 md:p-4 shadow-2xl shadow-primary/20">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-3xl blur opacity-20" />
            <div className="relative bg-black/40 rounded-xl overflow-hidden aspect-[16/9] md:aspect-[21/9] flex items-center justify-center border border-white/5">
              <MagicGrid className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full p-4 md:p-6 opacity-90 h-full items-center">
                {/* Card 1: Portfolio Growth */}
                <MagicCard className="glass-card p-6 rounded-xl border-white/5 bg-black/50 flex flex-col justify-between" enableStars={true}>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Portfolio</p>
                      <h3 className="text-2xl font-bold text-white mt-1">₹12,45,320</h3>
                    </div>
                    <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs font-bold text-green-500">+12.5%</span>
                    </div>
                  </div>
                  <div className="relative z-10 mt-auto">
                    <div className="h-16 w-full flex items-end gap-1">
                      {[30, 45, 35, 60, 50, 75, 65, 80].map((h, i) => (
                        <div key={i} className="flex-1 bg-primary/20 hover:bg-primary/60 transition-colors rounded-t-sm" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>
                </MagicCard>

                {/* Card 2: Main Balance (Center Highlight) */}
                <MagicCard className="glass-card p-6 rounded-xl border-primary/20 bg-primary/5 transform md:scale-110 shadow-2xl shadow-primary/10 flex flex-col justify-between relative overflow-hidden" particleCount={30} enableStars={true}>
                  <div className="absolute top-0 right-0 p-4 opacity-50">
                    <Wallet className="w-24 h-24 text-primary/10 -rotate-12" />
                  </div>
                  <div className="relative z-10">
                    <div className="inline-block p-3 bg-primary/10 rounded-2xl mb-4 border border-primary/20 backdrop-blur-md">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm text-primary/80 font-medium mb-1">Wallet Balance</p>
                    <h3 className="text-4xl font-bold text-white tracking-tight mb-2">₹8,43,200</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Updated just now
                    </p>
                  </div>
                  <div className="relative z-10 mt-auto">
                    <Link to="/funds" className="w-full inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 border border-white/10 rounded-lg px-4 py-2 font-semibold transition-colors">
                      Invest Now
                    </Link>
                  </div>
                </MagicCard>

                {/* Card 3: Recent Activity */}
                <MagicCard className="glass-card p-6 rounded-xl border-white/5 bg-black/50" enableStars={true}>
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <h4 className="text-sm font-semibold text-white">Recent Activity</h4>
                    <button className="h-6 w-6 text-muted-foreground hover:text-white inline-flex items-center justify-center">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-4 relative z-10">
                    {[
                      { name: 'SBI Blue Chip', amount: '-₹10,000', icon: 'S', color: 'bg-blue-500' },
                      { name: 'Dividend Received', amount: '+₹4,250', icon: '₹', color: 'bg-green-500' },
                      { name: 'HDFC Mid Cap', amount: '-₹5,000', icon: 'H', color: 'bg-red-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${item.color}/20 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform`}>
                            <span className={`text-xs font-bold ${item.color.replace('bg-', 'text-')}`}>{item.icon}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">Today, 10:23 AM</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${item.amount.startsWith('+') ? 'text-green-500' : 'text-white'}`}>
                          {item.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </MagicCard>
              </MagicGrid>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section (Social Proof) */}
      <section className="py-10 border-y border-white/5 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">Trusted by investors from top institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-xl font-bold font-mono">FINCORP</span>
            <span className="text-xl font-bold font-serif italic">TrustBank</span>
            <span className="text-xl font-bold tracking-widest">WËALTH</span>
            <span className="text-xl font-bold">Invest<span className="text-primary">AI</span></span>
            <span className="text-xl font-bold font-mono">Ledger</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">How <span className="gradient-text">InvestWise</span> Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Your journey to smarter investing in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent -z-10" />

            {[
              { step: '01', title: 'Create Account', desc: 'Sign up in seconds with email or Google OAuth.', icon: Users },
              { step: '02', title: 'Risk Assessment', desc: 'Complete a 5-question behavioral profile.', icon: LinkIcon },
              { step: '03', title: 'Smart Analysis', desc: 'Our engine computes CAGR, Sharpe Ratio & more.', icon: Zap },
              { step: '04', title: 'Grow Wealth', desc: 'Invest, track your portfolio, and optimize.', icon: TrendingUp },
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="w-24 h-24 mx-auto bg-background rounded-full border-4 border-background flex items-center justify-center mb-6 relative z-10 transition-transform group-hover:scale-110 duration-300 shadow-xl shadow-primary/5">
                  <div className="w-full h-full rounded-full bg-secondary/50 flex items-center justify-center border border-white/10">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    {item.step}
                  </div>
                </div>
                <div className="text-center p-4 rounded-2xl transition-colors hover:bg-white/5">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-secondary/20 relative" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide mb-6">
                Key Features
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Everything you need to
                <br />
                <span className="gradient-text">Master the Market</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Stop guessing. Start investing with precision using our comprehensive suite of tools designed for the modern investor.
              </p>

              <div className="space-y-6">
                {[
                  { title: 'Behavioral Risk Profiler', desc: 'A 5-question wizard that maps your psychology to a risk category.' },
                  { title: 'Real-Time Financial Analytics', desc: 'Live CAGR, Sharpe Ratio, standard deviation on every fund.' },
                  { title: 'Digital Wallet & Trading', desc: 'Seamless fund buying/selling with instant wallet settlement.' },
                  { title: 'Advisor Marketplace', desc: 'Browse certified advisors, book consultations, and grow smarter.' }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link to="/funds">
                  <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-foreground font-semibold">
                    View All Funds <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Feature Visual */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-3xl blur-2xl opacity-40 animate-pulse" />
              <MagicCard className="glass-card p-0 rounded-2xl border border-white/10 relative overflow-hidden" disableAnimations={true}>
                <div className="bg-black/80 rounded-xl p-6 md:p-8 space-y-6 relative z-10">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Total Balance</p>
                      <h3 className="text-3xl font-bold text-white">₹12,45,920</h3>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-bold">+12.5%</span>
                    </div>
                  </div>
                  <div className="h-40 flex items-end gap-2">
                    {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-t hover:bg-primary/50 transition-colors" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white/5">
                      <Shield className="w-5 h-5 text-blue-400 mb-2" />
                      <p className="text-xs text-muted-foreground">Risk Score</p>
                      <p className="font-bold">Conservative</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <Globe className="w-5 h-5 text-purple-400 mb-2" />
                      <p className="text-xs text-muted-foreground">Market Exposure</p>
                      <p className="font-bold">Diversified</p>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Loved by Investors</h2>

          <MagicGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Rahul S.', role: 'Software Engineer', quote: 'InvestWise simplified my investment strategy completely. The analytics are spot on!' },
              { name: 'Priya M.', role: 'Small Business Owner', quote: 'I finally understand where my money is going. The dashboard is intuitive and beautiful.' },
              { name: 'Ankit R.', role: 'Product Manager', quote: 'The best platform for tracking mutual funds I\'ve used. Highly recommended!' }
            ].map((testimonial, i) => (
              <MagicCard key={i} className="glass-card border-white/5 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 bg-black/40" particleCount={6} enableStars={true}>
                <div className="p-6 relative z-10">
                  <div className="flex text-yellow-500 mb-4">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-lg mb-6 text-foreground/90">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center font-bold text-white">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </MagicCard>
            ))}
          </MagicGrid>
        </div>
      </section>

      {/* Pre-Footer CTA */}
      <section className="py-24 px-4 relative">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-3xl blur opacity-30" />
          <MagicCard className="glass-card relative rounded-2xl p-8 md:p-12 text-center border-white/10 bg-black/40" enableStars={true} particleCount={20}>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Grow Your Wealth?</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Join thousands of investors who are taking control of their financial future with InvestWise.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register">
                  <button className="bg-white text-black hover:bg-white/90 w-full sm:w-auto text-lg h-12 px-8 rounded-lg font-semibold transition-colors">
                    Create Free Account
                  </button>
                </Link>
                <Link to="/login">
                  <button className="w-full sm:w-auto text-lg h-12 px-8 rounded-lg border border-white/20 hover:bg-white/10 text-foreground font-semibold transition-colors">
                    Sign In
                  </button>
                </Link>
              </div>
            </div>
          </MagicCard>
        </div>
      </section>
    </div>
  );
}
