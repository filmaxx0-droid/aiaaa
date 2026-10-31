# Kazandıran — PRD

## Original problem
User (Turkish) asked for a money-making product that people will use, fully autonomous, Turkey focus. Approved plan: AI content studio with credit-pack revenue.

## Architecture
- FastAPI (server.py, prompts.py, payments.py, clerk_auth.py) + MongoDB (users, generations, orders)
- React (CRA) + Tailwind; Clerk (Emergent-managed) email+password auth
- LLM: Claude Sonnet 5.5 via Emergent LLM key, SSE streaming
- Payments: iyzico Checkout Form (hosted page, callback /api/payments/callback, HMAC signature check). Stripe not supported for TR.

## Implemented (2026-06)
- Landing (hero, sample tabs, tools, pricing, FAQ), Turkish UI, mobile bottom nav
- 3 tools: listing (Trendyol/Hepsiburada/n11/Amazon/Etsy), CV + cover letter, social 7-day plan; 4 output languages
- Streaming output, copy/download/regenerate, history list/detail/delete
- 5 free credits, atomic 1-credit deduction, refund on failure/disconnect, 402 at 0
- Packs: 50/99TL, 200/299TL, 600/699TL; iyzico flow coded, INACTIVE until IYZICO_API_KEY/IYZICO_SECRET_KEY are added

## Backlog
- P0: add iyzico keys (sandbox, then live with IYZICO_BASE_URL=api.iyzipay.com) and test a payment
- P1: admin panel (users, sales, top tool), CV PDF export, Turkish Clerk localization, PayTR
- P2: subscriptions, product-photo-to-listing, referral credits, bulk generation for agencies
