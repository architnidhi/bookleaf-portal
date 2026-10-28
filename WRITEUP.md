# Brief Write-Up: BookLeaf Portal Approach

### What I Prioritized
Given the 5-day timeframe, I prioritized delivering a **fully functional core ticket lifecycle** and a **rock-solid AI integration** over pixel-perfect UI. The application needed to prove it could solve BookLeaf's actual operational bottleneck: handling author queries at scale. Therefore, I built robust JWT authentication, strict Role-Based Access Control (RBAC), and a highly empathetic prompt for the AI.

### Trade-offs Made
1. **Next.js App Router vs. Separate Backend:** I chose Next.js API routes to consolidate the stack. This allowed me to build and deploy the entire application in a single repository quickly, reducing CORS and deployment complexities.
2. **Polling vs. WebSockets:** For near real-time updates, I used React polling every 5 seconds. While WebSockets are more efficient for true real-time apps, polling is significantly easier to implement and perfectly adequate for a support ticket system where updates aren't happening every millisecond.
3. **AI Fallback vs. Hard Failure:** I intentionally wrote the AI service to degrade gracefully. If OpenAI fails (e.g., no credits), the app doesn't crash; it generates a smart, category-specific fallback draft. This ensures the Admin ops team is never blocked.

### Evolving into a Production System
If given the opportunity to take this to production, I would evolve it in the following ways:
1. **Queue System for AI:** Move AI generation to a background job queue (e.g., Redis + BullMQ). This ensures the UI remains snappy and can retry AI generation if the OpenAI API times out.
2. **File Storage:** Implement S3 or Cloudinary for the attachment UI so authors can actually upload photos of defective print copies.
3. **Advanced Analytics:** Add an Admin dashboard showing metrics like "Average Resolution Time" and "Tickets by Category" to help BookLeaf identify systemic issues (e.g., if 40% of tickets are Royalty complaints).
4. **Vector Search Knowledge Base:** Instead of pasting the entire KB into the prompt, I would embed the KB into a vector database (Pinecone) and use RAG (Retrieval-Augmented Generation) to only fetch the relevant policy snippets, further reducing AI costs.
5. **WebSockets:** Upgrade the ticket thread to use WebSockets or SSE for instantaneous messaging between Admin and Author.
