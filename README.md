# Saptambu Custom Store

Fully custom Railway-hosted ecommerce app for Kiranashva Creation/Saptambu.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- PostgreSQL on Railway
- Prisma ORM
- Razorpay checkout
- Cloudinary product image uploads
- SMTP email notifications

## Local Setup

1. Copy `.env.example` to `.env`.
2. Fill admin, Razorpay, Cloudinary, and SMTP values.
3. Start the local Postgres server and seed the scanned Shopify catalog:

```bash
npm run local:setup
```

4. Start development:

```bash
npm run dev
```

## Important Commands

```bash
npm run build        # production build
npm run lint         # eslint
npm run local:db     # start local Postgres in Docker
npm run local:setup  # start local Postgres, push schema, seed catalog
npm run db:push      # push Prisma schema to Postgres
npm run db:seed      # import current 55 Shopify products and create admin
npm run railway:setup
```

## Admin

Admin lives at `/admin`.

The seed command creates one admin user from:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

The admin can manage products, stock, categories, coupon codes, orders, delivery messages, and store settings.

## Deployment Notes

Railway should provide `DATABASE_URL` from the Postgres plugin. Replace the local `DATABASE_URL` in Railway env vars, then run `npm run railway:setup` once after setting env vars to create tables and import products. Product images uploaded after launch go to Cloudinary; Railway disk is not used for durable uploads.
