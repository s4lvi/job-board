import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "development" },
      update: {},
      create: { name: "Development", slug: "development", icon: "💻" },
    }),
    prisma.category.upsert({
      where: { slug: "design" },
      update: {},
      create: { name: "Design", slug: "design", icon: "🎨" },
    }),
    prisma.category.upsert({
      where: { slug: "writing" },
      update: {},
      create: { name: "Writing", slug: "writing", icon: "📝" },
    }),
    prisma.category.upsert({
      where: { slug: "marketing" },
      update: {},
      create: { name: "Marketing", slug: "marketing", icon: "📊" },
    }),
    prisma.category.upsert({
      where: { slug: "operations" },
      update: {},
      create: { name: "Operations", slug: "operations", icon: "🔧" },
    }),
    prisma.category.upsert({
      where: { slug: "media" },
      update: {},
      create: { name: "Media", slug: "media", icon: "📹" },
    }),
  ]);

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@acpmi.us" },
    update: {},
    create: {
      name: "ACPMI Admin",
      email: "admin@acpmi.us",
      hashedPassword: adminPassword,
      role: "ADMIN",
      title: "Platform Administrator",
      location: "Michigan, USA",
      bio: "Managing the ACPMI Jobs platform.",
      emailVerified: new Date(),
    },
  });

  // Create sample poster
  const posterPassword = await bcrypt.hash("Poster123!", 12);
  const poster = await prisma.user.upsert({
    where: { email: "poster@acpmi.us" },
    update: {},
    create: {
      name: "Alex Johnson",
      email: "poster@acpmi.us",
      hashedPassword: posterPassword,
      role: "POSTER",
      title: "Project Manager",
      location: "Detroit, MI",
      bio: "Looking for talented individuals to help with various projects.",
      emailVerified: new Date(),
    },
  });

  // Create sample seeker
  const seekerPassword = await bcrypt.hash("Seeker123!", 12);
  const seeker = await prisma.user.upsert({
    where: { email: "seeker@acpmi.us" },
    update: {},
    create: {
      name: "Jordan Smith",
      email: "seeker@acpmi.us",
      hashedPassword: seekerPassword,
      role: "SEEKER",
      title: "Full Stack Developer",
      location: "Ann Arbor, MI",
      bio: "Experienced developer looking for interesting projects and gigs.",
      emailVerified: new Date(),
    },
  });

  // Create sample listings
  const listings = [
    {
      title: "Build Web Storefront for ACP Ohio",
      description:
        "ACP Ohio needs a full e-commerce storefront to sell chapter merchandise and event tickets online.\n\nRequirements:\n- Modern responsive web storefront\n- Product catalog with categories\n- Shopping cart and checkout flow\n- Stripe payment integration\n- Inventory management\n- Mobile-friendly design matching ACP branding\n\nMust have experience building e-commerce sites. Please share examples of previous storefronts.",
      type: "GIG" as const,
      status: "ACTIVE" as const,
      budgetFixed: 3500,
      isRemote: true,
      tags: ["web-development", "e-commerce", "storefront", "acp-ohio"],
      categoryId: categories[0].id,
      userId: poster.id,
    },
    {
      title: "Produce Flyers for Student Organizing at Wayne State University",
      description:
        "We need a designer to produce a set of print-ready flyers for our student organizing campaign at Wayne State University in Detroit.\n\nDeliverables:\n- 5 unique flyer designs (8.5x11)\n- Consistent visual identity across all designs\n- Print-ready PDF files (CMYK, 300dpi)\n- Editable source files (Figma or Illustrator)\n- QR codes linking to our signup page\n\nContent and copy will be provided. Designs should be bold, eye-catching, and appeal to college students. Tight turnaround needed.",
      type: "BOUNTY" as const,
      status: "ACTIVE" as const,
      budgetMin: 200,
      budgetMax: 500,
      location: "Detroit, MI",
      isRemote: false,
      tags: ["design", "print", "flyers", "student-organizing"],
      categoryId: categories[1].id,
      userId: poster.id,
    },
    {
      title: "Construction/Demolition on Residential House in Michigan",
      description:
        "Looking for experienced construction workers for a residential renovation project in Dearborn, MI.\n\nScope of work:\n- Interior demolition of kitchen and bathroom\n- Debris removal and disposal\n- Basic framing modifications\n- Prep for new flooring and drywall\n\nProject timeline: 2-3 weeks. Must have own tools and transportation. Experience with residential renovation required. Licensed and insured preferred.",
      type: "JOB" as const,
      status: "ACTIVE" as const,
      budgetFixed: 4500,
      location: "Dearborn, MI",
      isRemote: false,
      tags: ["construction", "demolition", "renovation", "residential"],
      categoryId: categories[4].id,
      userId: poster.id,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Social Investigation for ACP Wisconsin on Rural Farmers",
      description:
        "ACP Wisconsin is conducting a social investigation into the conditions facing rural farmers in the state.\n\nWe need a researcher/writer to:\n- Interview 10-15 rural farmers across Wisconsin\n- Document working conditions, land ownership, and economic challenges\n- Research relevant agricultural policy and its local impact\n- Produce a detailed written report (15-25 pages)\n- Include photographs and data visualizations\n\nTravel expenses covered separately. Must have experience with community-based research or journalism. Spanish language skills a plus.",
      type: "GIG" as const,
      status: "ACTIVE" as const,
      budgetMin: 2000,
      budgetMax: 3500,
      location: "Wisconsin",
      isRemote: false,
      tags: ["research", "writing", "social-investigation", "agriculture"],
      categoryId: categories[2].id,
      userId: admin.id,
    },
    {
      title: "Produce 50 T-Shirts with Provided Logo",
      description:
        "We need 50 custom t-shirts produced for an upcoming event.\n\nSpecs:\n- Quantity: 50 shirts\n- Sizes: Mix of S, M, L, XL, 2XL (breakdown provided)\n- Color: Black shirts\n- Print: Full-color front logo (provided), small back print\n- Material: Cotton or cotton-blend, good quality\n- Delivery: Shipped to Detroit, MI\n\nPlease include per-unit pricing and turnaround time in your bid. We will provide the logo files in vector format.",
      type: "BOUNTY" as const,
      status: "ACTIVE" as const,
      budgetFixed: 750,
      location: "Detroit, MI",
      isRemote: false,
      tags: ["merchandise", "t-shirts", "printing", "apparel"],
      categoryId: categories[4].id,
      userId: poster.id,
    },
    {
      title: "Video Production for ACP National Conference Recap",
      description:
        "We need a videographer/editor to produce a 3-5 minute recap video from footage of our national conference.\n\nDetails:\n- Raw footage will be provided (approx 8 hours)\n- Edit down to a polished 3-5 minute highlight reel\n- Add titles, lower thirds, and transitions\n- Background music (royalty-free)\n- Color correction and audio mixing\n- Deliver in 1080p and optimized for social media\n\nExperience with event recap videos required. Please share your reel.",
      type: "GIG" as const,
      status: "ACTIVE" as const,
      budgetFixed: 1200,
      isRemote: true,
      tags: ["video", "editing", "production", "conference"],
      categoryId: categories[5].id,
      userId: admin.id,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const listing of listings) {
    await prisma.listing.create({ data: listing });
  }

  // Create sample application
  const firstListing = await prisma.listing.findFirst({
    where: { userId: poster.id },
  });

  if (firstListing) {
    await prisma.application.create({
      data: {
        listingId: firstListing.id,
        userId: seeker.id,
        coverLetter: "I have extensive experience building React dashboards and would love to work on this project. Check out my portfolio for similar work.",
        bidAmount: 2200,
      },
    });
  }

  console.log("Seed completed successfully!");
  console.log(`  Admin: admin@acpmi.us / Admin123!`);
  console.log(`  Poster: poster@acpmi.us / Poster123!`);
  console.log(`  Seeker: seeker@acpmi.us / Seeker123!`);
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Listings: ${listings.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
