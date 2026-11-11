---
layout: page
title: Pricing
---

<script setup>
import { ref } from 'vue'

const plans = ref([
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for personal use',
    features: [
      'Unlimited tunnels',
      '1 Edge server',
      'HTTP/TCP/UDP support',
      'Community support',
      'Basic extensions',
      'Shared Edge marketplace'
    ],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'For power users and developers',
    features: [
      'Everything in Free',
      '5 Edge servers',
      'Custom domains',
      'Priority support',
      'All extensions',
      'P2P direct connection',
      'WireGuard VPN',
      'Advanced statistics'
    ],
    cta: 'Start Pro Trial',
    popular: true
  },
  {
    name: 'Team',
    price: '$29',
    period: '/month',
    description: 'For teams and businesses',
    features: [
      'Everything in Pro',
      'Unlimited Edge servers',
      'Team collaboration',
      'SSO integration',
      'Dedicated support',
      'SLA guarantee',
      'Audit logs',
      'Custom branding'
    ],
    cta: 'Contact Sales',
    popular: false
  }
])

const faqs = ref([
  {
    question: 'Can I switch plans anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
  },
  {
    question: 'What happens when I exceed my Edge limit?',
    answer: 'You\'ll be notified when approaching the limit. Existing Edges continue to work, but you cannot create new ones until upgrading or removing Edges.'
  },
  {
    question: 'Is there a free trial for Pro?',
    answer: 'Yes! All new accounts get a 14-day Pro trial automatically.'
  },
  {
    question: 'Do you offer discounts for nonprofits?',
    answer: 'Yes, we offer 50% discount for verified nonprofit organizations. Contact us for details.'
  }
])
</script>

# Simple, Transparent Pricing

Choose the plan that fits your needs. All plans include core tunneling features.

<div class="pricing-grid">
  <div v-for="plan in plans" :key="plan.name" 
       class="pricing-card" 
       :class="{ popular: plan.popular }">
    <div v-if="plan.popular" class="popular-badge">Most Popular</div>
    
    <h3>{{ plan.name }}</h3>
    <p class="description">{{ plan.description }}</p>
    
    <div class="price-section">
      <span class="price">{{ plan.price }}</span>
      <span class="period">{{ plan.period }}</span>
    </div>
    
    <ul class="features-list">
      <li v-for="feature in plan.features" :key="feature">
        <span class="check">✓</span>
        {{ feature }}
      </li>
    </ul>
    
    <a href="#" class="cta-button" :class="{ primary: plan.popular }">
      {{ plan.cta }}
    </a>
  </div>
</div>

## Frequently Asked Questions

<div class="faq-section">
  <div v-for="faq in faqs" :key="faq.question" class="faq-item">
    <h4>{{ faq.question }}</h4>
    <p>{{ faq.answer }}</p>
  </div>
</div>

## Compare Plans

| Feature | Free | Pro | Team |
|---------|------|-----|------|
| **Tunnels** | Unlimited | Unlimited | Unlimited |
| **Edge Servers** | 1 | 5 | Unlimited |
| **Protocols** | HTTP/TCP/UDP | All | All |
| **Custom Domains** | ❌ | ✅ | ✅ |
| **P2P Mode** | ❌ | ✅ | ✅ |
| **WireGuard** | ❌ | ✅ | ✅ |
| **Team Features** | ❌ | ❌ | ✅ |
| **SSO** | ❌ | ❌ | ✅ |
| **Support** | Community | Priority | Dedicated |
| **SLA** | ❌ | ❌ | ✅ |

<style scoped>
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin: 60px 0;
}

.pricing-card {
  position: relative;
  padding: 40px 30px;
  border: 2px solid var(--vp-c-divider);
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.pricing-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.pricing-card.popular {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-bg-soft);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 20px;
  background: var(--vp-c-brand);
  color: white;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 600;
}

.pricing-card h3 {
  font-size: 1.8em;
  margin-bottom: 8px;
  color: var(--vp-c-text-1);
}

.description {
  color: var(--vp-c-text-2);
  margin-bottom: 24px;
}

.price-section {
  margin: 30px 0;
}

.price {
  font-size: 4em;
  font-weight: bold;
  color: var(--vp-c-text-1);
}

.period {
  font-size: 1.2em;
  color: var(--vp-c-text-3);
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 30px 0;
  text-align: left;
}

.features-list li {
  padding: 12px 0;
  padding-left: 30px;
  position: relative;
  color: var(--vp-c-text-2);
}

.check {
  position: absolute;
  left: 0;
  color: var(--vp-c-brand);
  font-weight: bold;
}

.cta-button {
  display: inline-block;
  width: 100%;
  padding: 14px 30px;
  border: 2px solid var(--vp-c-brand);
  color: var(--vp-c-brand);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.cta-button:hover {
  background: var(--vp-c-brand);
  color: white;
}

.cta-button.primary {
  background: var(--vp-c-brand);
  color: white;
}

.cta-button.primary:hover {
  background: var(--vp-c-brand-dark);
}

.faq-section {
  margin: 60px 0;
}

.faq-item {
  padding: 24px;
  margin-bottom: 16px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
}

.faq-item h4 {
  margin: 0 0 12px;
  color: var(--vp-c-text-1);
}

.faq-item p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 40px 0;
}

th, td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--vp-c-divider);
}

th {
  background: var(--vp-c-bg-soft);
  font-weight: 600;
  color: var(--vp-c-text-1);
}
</style>
