# PriceGram Production Checklist & Setup Tasks

This guide outlines the immediate tasks required to transition the **PriceGram** application from mock/simulation mode to a fully functional production environment.

## 1. Authentication Integration (Clerk)
- [ ] Create a production project in the [Clerk Dashboard](https://dashboard.clerk.com).
- [ ] Retrieve production API keys:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- [ ] Configure Phone OTP + Google authentication under Clerk's **User & Auth** > **Social Connections** and **Sign-in Methods**.
- [ ] Set up redirect URLs to point to your live domain:
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
  - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`
  - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`

## 2. Database Integration (Supabase)
- [ ] Spin up a free PostgreSQL database instance on [Supabase](https://supabase.com).
- [ ] Configure database schemas:
  - `tracked_products` (id, user_id, title, platform, current_price, target_price, last_updated)
  - `user_profiles` (id, email, full_name, phone_number, premium_status)
  - `coupons` (id, code, discount, platform, category, expires_at)
- [ ] Secure production keys:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Replace mock states in `src/app/dashboard/page.tsx` with live `supabase-js` client queries.

## 3. Real-Time Scraping & Proxies Setup
- [ ] Configure `VALUESERP_API_KEY` for Google Shopping search compilation.
- [ ] Connect a proxy network (e.g., Bright Data, ScrapingBee) to prevent rate limits and IP blocking during direct retail scraping on Amazon, Flipkart, Blinkit, and Zepto.
- [ ] Set up a Cron Job or Vercel Cron to fetch price updates for tracked products twice daily.

## 4. Stripe Subscription Setup
- [ ] Create a [Stripe Account](https://stripe.com).
- [ ] Set up product pricing tiers:
  - Monthly subscription (₹99/mo)
  - Annual subscription (₹999/yr)
- [ ] Setup Stripe Webhook endpoint in Next.js to listen for `checkout.session.completed` events and update `user_profiles.premium_status` in Supabase.
- [ ] Swap the mock payment form in `src/app/premium/page.tsx` with Stripe Checkout redirection.
