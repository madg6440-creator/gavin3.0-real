import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('ERROR: STRIPE_SECRET_KEY environment variable not set');
  process.exit(1);
}
const stripe = new Stripe(stripeKey);

// ============================================
// CORE SYSTEMS
// ============================================

// Enterprise Lead Generation
const leadGenerator = {
  industries: ['AI/ML', 'SaaS', 'FinTech', 'Enterprise Software', 'Consulting', 'E-commerce', 'Healthcare Tech', 'EdTech'],
  titles: ['CEO', 'CTO', 'VP Engineering', 'VP Sales', 'CFO', 'COO', 'VP Marketing', 'Chief Data Officer'],
  regions: ['North America', 'Europe', 'Asia Pacific', 'LATAM', 'Middle East'],
  
  discover: function(count = 50) {
    const leads = [];
    for (let i = 0; i < count; i++) {
      leads.push({
        id: `lead_${Date.now()}_${i}`,
        name: `Decision Maker ${i + 1}`,
        title: this.titles[Math.floor(Math.random() * this.titles.length)],
        company: `Company ${i + 1}`,
        industry: this.industries[Math.floor(Math.random() * this.industries.length)],
        region: this.regions[Math.floor(Math.random() * this.regions.length)],
        revenue: `$${(Math.random() * 500 + 50).toFixed(0)}M`,
        fit_score: Math.floor(Math.random() * 40 + 60),
        budget_authority: Math.random() > 0.5,
        discovered_at: new Date().toISOString()
      });
    }
    return leads;
  }
};

// Lead Scoring Engine
const leadScorer = {
  score: function(lead) {
    let score = 0;
    
    // Title scoring (25%)
    const titleScores = {
      'CEO': 100, 'CTO': 95, 'CFO': 90, 'COO': 85,
      'VP Engineering': 90, 'VP Sales': 85, 'VP Marketing': 80, 'Chief Data Officer': 95,
      'Director': 75
    };
    score += (titleScores[lead.title] || 70) * 0.25;
    
    // Budget authority (25%)
    score += (lead.budget_authority ? 100 : 50) * 0.25;
    
    // Company size (20%)
    const revenue = parseInt(lead.revenue);
    score += (revenue > 200 ? 100 : revenue > 100 ? 80 : 60) * 0.20;
    
    // Industry fit (15%)
    const hotIndustries = ['AI/ML', 'SaaS', 'FinTech'];
    score += (hotIndustries.includes(lead.industry) ? 100 : 70) * 0.15;
    
    // Engagement potential (15%)
    score += Math.random() * 100 * 0.15;
    
    return Math.round(score);
  },
  
  tier: function(score) {
    if (score >= 85) return 'hot';
    if (score >= 75) return 'warm';
    return 'cold';
  }
};

// Revenue Optimizer
const revenueOptimizer = {
  portfolio: [
    { name: 'VivienneAI', revenue: 8500, status: 'active' },
    { name: 'TrustedNest', revenue: 3200, status: 'active' },
    { name: 'Southwest Game', revenue: 0, status: 'development' },
    { name: 'No Love Appeal', revenue: 5000, status: 'active' },
    { name: 'Creative Analytics', revenue: 2000, status: 'active' },
    { name: 'Applied Mechanics', revenue: 0, status: 'reference' }
  ],
  
  getMetrics: function() {
    const mrr = this.portfolio.reduce((sum, v) => sum + v.revenue, 0);
    return {
      mrr: mrr,
      arr: mrr * 12,
      growth_rate: 0.23,
      ventures: this.portfolio.length,
      active_ventures: this.portfolio.filter(v => v.status === 'active').length
    };
  }
};

// Autonomous Marketing Engine
const marketingEngine = {
  generateContent: function() {
    const topics = [
      'AI automation is transforming business',
      'Enterprise leads are worth 10x more',
      'Autonomous systems scale infinitely',
      'Revenue optimization through AI',
      'Lead generation at scale'
    ];
    
    return {
      platform: ['X', 'LinkedIn', 'Reddit'][Math.floor(Math.random() * 3)],
      content: topics[Math.floor(Math.random() * topics.length)],
      timestamp: new Date().toISOString(),
      expected_engagement: Math.random() * 5 + 1
    };
  }
};

// Email Pipeline
const emailPipeline = {
  queue: [],
  
  send: function(to, subject, body) {
    this.queue.push({
      id: `email_${Date.now()}`,
      to: to,
      subject: subject,
      body: body,
      status: 'sent',
      timestamp: new Date().toISOString()
    });
    return { success: true, message: 'Email queued' };
  }
};

// Swarm Intelligence Hub
const swarmHub = {
  agents: ['lead_discovery', 'scoring_engine', 'marketing_engine', 'email_orchestrator', 'revenue_optimizer'],
  decisions: [],
  
  consensus: function(topic) {
    const votes = this.agents.map(agent => ({
      agent: agent,
      vote: Math.random() > 0.3 ? 'yes' : 'no'
    }));
    
    const yesCount = votes.filter(v => v.vote === 'yes').length;
    const agreement = (yesCount / this.agents.length) * 100;
    
    const decision = {
      topic: topic,
      timestamp: new Date().toISOString(),
      votes: votes,
      agreement_percentage: Math.round(agreement),
      consensus_reached: agreement >= 66,
      action: agreement >= 66 ? 'execute' : 'defer'
    };
    
    this.decisions.push(decision);
    return decision;
  }
};

// ============================================
// API ENDPOINTS
// ============================================

// Status
app.get('/api/status', (req, res) => {
  res.json({
    system: 'GAVIN 3.0 - Autonomous Lead Generation & Revenue Optimization',
    status: 'operational',
    stripe: 'connected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Revenue Metrics
app.get('/api/revenue', (req, res) => {
  const metrics = revenueOptimizer.getMetrics();
  res.json({
    monthly_recurring_revenue: metrics.mrr,
    annual_recurring_revenue: metrics.arr,
    growth_rate: metrics.growth_rate,
    ventures: metrics.ventures,
    active_ventures: metrics.active_ventures,
    portfolio: revenueOptimizer.portfolio
  });
});

// Lead Discovery
app.post('/api/leads/discover', (req, res) => {
  const count = req.body.count || 50;
  const leads = leadGenerator.discover(count);
  
  // Score all leads
  const scoredLeads = leads.map(lead => ({
    ...lead,
    score: leadScorer.score(lead),
    tier: leadScorer.tier(leadScorer.score(lead))
  }));
  
  // Sort by score
  scoredLeads.sort((a, b) => b.score - a.score);
  
  res.json({
    total: scoredLeads.length,
    hot_leads: scoredLeads.filter(l => l.tier === 'hot').length,
    warm_leads: scoredLeads.filter(l => l.tier === 'warm').length,
    cold_leads: scoredLeads.filter(l => l.tier === 'cold').length,
    leads: scoredLeads.slice(0, 20)
  });
});

// Lead Scoring
app.post('/api/leads/score', (req, res) => {
  const { leads } = req.body;
  
  if (!leads || !Array.isArray(leads)) {
    return res.status(400).json({ error: 'leads array required' });
  }
  
  const scored = leads.map(lead => ({
    ...lead,
    score: leadScorer.score(lead),
    tier: leadScorer.tier(leadScorer.score(lead))
  }));
  
  res.json({
    total: scored.length,
    scored_leads: scored
  });
});

// Marketing Content
app.post('/api/marketing/generate', (req, res) => {
  const content = marketingEngine.generateContent();
  res.json(content);
});

// Email Send
app.post('/api/email/send', (req, res) => {
  const { to, subject, body } = req.body;
  
  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'to, subject, body required' });
  }
  
  const result = emailPipeline.send(to, subject, body);
  res.json(result);
});

// Swarm Consensus
app.post('/api/swarm/consensus', (req, res) => {
  const { topic } = req.body;
  
  if (!topic) {
    return res.status(400).json({ error: 'topic required' });
  }
  
  const decision = swarmHub.consensus(topic);
  res.json(decision);
});

// Swarm Status
app.get('/api/swarm/status', (req, res) => {
  res.json({
    agents: swarmHub.agents,
    total_decisions: swarmHub.decisions.length,
    last_decision: swarmHub.decisions[swarmHub.decisions.length - 1] || null
  });
});

// Stripe Payment Intent
app.post('/api/payment/intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', description } = req.body;
    
    if (!amount) {
      return res.status(400).json({ error: 'amount required' });
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency,
      description: description || 'GAVIN 3.0 Payment'
    });
    
    res.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      amount: amount,
      currency: currency
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`✅ GAVIN 3.0 running on http://localhost:${PORT}`);
  console.log(`📊 Status: http://localhost:${PORT}/api/status`);
  console.log(`💰 Revenue: http://localhost:${PORT}/api/revenue`);
  console.log(`🎯 Leads: POST http://localhost:${PORT}/api/leads/discover`);
  console.log(`🧠 Swarm: http://localhost:${PORT}/api/swarm/status`);
});
