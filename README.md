# Agent-Based E-Commerce

<div align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg" alt="Next.js" width="40" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React" width="40" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" alt="Tailwind CSS" width="40" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg" alt="MongoDB" width="40" height="40"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" alt="Node.js" width="40" height="40"/>
</div>

## Overview
Agent-Based E-Commerce is a specialized platform designed to be seamlessly accessible by both human users and autonomous AI agents. It addresses the growing need for programmatic commerce by offering machine-readable APIs and structured data interfaces alongside a modern, human-centric visual storefront. This dual-approach empowers AI models to independently search catalogs, verify stock, and execute purchases while providing an excellent graphical experience for traditional shoppers.

## Preview

https://github.com/user-attachments/assets/e9d4e82a-6041-42d7-ad64-880658b636cb




## System Architecture
The application follows a modern monolithic architecture with a unified frontend and backend.
- **Frontend Layer**: Client-side React components built with TailwindCSS and Framer Motion for a dynamic, glassmorphic UI.
- **Backend API Layer**: Next.js API Routes handle human user interactions (authentication, cart, checkout) and specialized LLM-friendly endpoints (e.g., `/api/llm/catalog`, `/api/llm/checkout`) optimized for agent consumption.
- **AI Integration Layer**: Powered by LangChain and Google GenAI, facilitating an integrated shopping assistant that can process natural language queries and interface directly with the database.
- **Database Layer**: MongoDB stores product catalogs, user profiles, orders, and interaction analytics.

## Features
- **Dual-Interface Design**: Specialized endpoints allow AI agents to navigate the catalog and perform actions programmatically.
- **Integrated AI Shopping Assistant**: A chat widget that helps users find products, process mock payments, and track orders using natural language.
- **Merchant Control Plane**: A role-based administration dashboard to monitor audit logs, sales data, and user interactions.
- **Interaction Analytics**: Automated tracking of user and agent behaviors, including searches, cart additions, and session metrics.
- **Review and Rating System**: Post-purchase review capabilities for authenticated users.
- **Order Tracking**: End-to-end tracking of purchases and shipment statuses.

## Tech Stack and Architecture Decisions
- **Next.js & React**: Chosen for server-side rendering, SEO optimization, and the ability to colocate API routes with the frontend, streamlining both agent and human data fetching.
- **MongoDB & Mongoose**: A NoSQL document database is ideal for handling the diverse schema requirements of product catalogs and high-volume analytics events.
- **Tailwind CSS & Framer Motion**: Enables rapid development of custom, responsive, and animated user interfaces with minimal CSS footprint.
- **LangChain & Google GenAI**: Provides robust tooling to build intelligent workflows and process natural language inputs from the user.
- **Jose (JWT)**: Ensures secure, stateless authentication for both human sessions and agent API access.

## Setup and Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or Atlas)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Agent-Based-E-Commerce
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the root directory and add the following keys:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   GOOGLE_API_KEY=your_gemini_api_key
   # Add any other required API keys
   ```

4. Seed the database (Optional):
   ```bash
   node scripts/seed_hf_amazon.mjs
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Access the application:
   Open `http://localhost:3000` in your browser.
