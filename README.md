# LEAD Hockey - Technical Skills Platform

A modern, responsive Next.js 14 application for hockey training and skill development, built with TypeScript, Tailwind CSS, and shadcn/ui components.

## 🏒 Features

- **Modern Tech Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Responsive Design**: Mobile-first approach with perfect responsiveness across all devices
- **Performance Optimized**: Image optimization, lazy loading, and code splitting
- **SEO Ready**: Comprehensive metadata, Open Graph, and Twitter Card support
- **Accessibility**: WCAG compliant with semantic HTML and ARIA attributes
- **Smooth Animations**: Framer Motion for engaging user interactions
- **Component Library**: Built with shadcn/ui for consistent design system

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd hockey-skills-platform
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
# or
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
pnpm dev
# or
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

\`\`\`
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── pricing/           # Pricing page
│   ├── programs/          # Programs page
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── layout/           # Layout components (Navbar, Footer)
│   ├── sections/         # Page sections (Hero, Features, etc.)
│   └── ui/               # UI components (shadcn/ui + custom)
├── data/                 # Content data files
│   ├── navigation.ts     # Navigation configuration
│   ├── hero.ts          # Hero section content
│   ├── features.ts      # Features content
│   ├── testimonials.ts  # Testimonials data
│   ├── pricing.ts       # Pricing plans
│   └── faq.ts           # FAQ content
├── lib/                  # Utility functions
└── public/              # Static assets
\`\`\`

## 🎨 Content Management

All content is stored in TypeScript files in the `data/` directory for easy management:

### Adding New Content

1. **Navigation**: Edit `data/navigation.ts` to modify menu items
2. **Hero Section**: Update `data/hero.ts` for homepage hero content
3. **Features**: Modify `data/features.ts` to add/edit feature cards
4. **Testimonials**: Update `data/testimonials.ts` for customer reviews
5. **Pricing**: Edit `data/pricing.ts` to modify pricing plans
6. **FAQ**: Update `data/faq.ts` to add/edit frequently asked questions

### Example: Adding a New Feature

\`\`\`typescript
// data/features.ts
{
  icon: "Zap", // Lucide React icon name
  title: "Lightning Fast",
  description: "Experience blazing fast performance with our optimized platform."
}
\`\`\`

## 🎯 Customization

### Brand Colors

Update the color scheme in `tailwind.config.ts`:

\`\`\`typescript
colors: {
  hockey: {
    blue: "#1e40af",    // Primary blue
    red: "#dc2626",     // Accent red
    ice: "#f0f9ff",     // Light background
    dark: "#0f172a",    // Dark text
  }
}
\`\`\`

### Fonts

Change fonts in `tailwind.config.ts` and `app/globals.css`:

\`\`\`typescript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  heading: ['Inter', 'system-ui', 'sans-serif'],
}
\`\`\`

### Logo

Replace the logo by updating the `src` in `data/navigation.ts`:

\`\`\`typescript
logo: {
  src: "/your-logo.png",
  alt: "Your Brand",
  width: 120,
  height: 40
}
\`\`\`

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

## 📱 Responsive Breakpoints

The application uses Tailwind CSS breakpoints:

- `sm`: 640px and up
- `md`: 768px and up  
- `lg`: 1024px and up
- `xl`: 1280px and up
- `2xl`: 1536px and up

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Other Platforms

1. Build the application:
\`\`\`bash
pnpm build
\`\`\`

2. Deploy the `out` directory to your hosting provider

## 🔒 Environment Variables

For production deployment, you may need to set:

\`\`\`bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
\`\`\`

## 📈 Performance

The application is optimized for performance with:

- Next.js Image optimization
- Automatic code splitting
- Lazy loading for below-the-fold content
- Optimized fonts with `next/font`
- Efficient bundle sizes

## ♿ Accessibility

Built with accessibility in mind:

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Sufficient color contrast ratios
- Screen reader compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Email: support@leadhockey.com
- Documentation: [Project Wiki]
- Issues: [GitHub Issues]

---

Built with ❤️ for the hockey community
