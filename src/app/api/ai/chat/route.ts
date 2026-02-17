import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDynamicKnowledgeBase } from '@/lib/ai-knowledge';
import { GoogleGenAI } from '@google/genai';

// ============================================================================
// 1. ⚙️ CONFIGURATION & CONSTANTS
// ============================================================================

const CONFIG = {
  API_KEY: process.env.GOOGLE_API_KEY,
  // Valid models for generateContent API
  MODELS: ['gemini-2.5-flash'],
  MAX_HISTORY: 10,
  TIMEOUT_MS: 30000,
};

export const dynamic = 'force-dynamic';

// ============================================================================
// 2. 📝 TYPES & INTERFACES
// ============================================================================

interface ChatRequest {
  message: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  isAuthenticated?: boolean;
  currentPath?: string;
}

interface UserSession {
  history: string[];
  lastAccess: number;
}

// Global definition for TypeScript
declare global {
  // eslint-disable-next-line no-var
  var sessionStore: Map<string, UserSession> | undefined;
}

const sessionStore = global.sessionStore || new Map<string, UserSession>();
if (process.env.NODE_ENV !== 'production') global.sessionStore = sessionStore;

// ============================================================================
// 3. 🧠 CONTEXT & DATA LAYER
// ============================================================================

class ContextBuilder {
  static async build(request: ChatRequest): Promise<string> {
    const [businessData, userData] = await Promise.all([
      this.getBusinessData(),
      request.isAuthenticated ? this.getUserData(request) : null,
    ]);

    const timeOfDay = this.getTimeGreeting();

    return `
${await this.getSystemPrompt(timeOfDay)}

=== 🏢 COMPANY KNOWLEDGE BASE ===
${businessData}

=== 👤 CURRENT USER CONTEXT ===
${userData || 'Guest User (Not Logged In)'}
Current Page: ${request.currentPath || '/'}

=== � CONVERSATION HISTORY ===
${this.getSessionHistory(request)}
`;
  }

  private static getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  private static async getSystemPrompt(timeOfDay: string): Promise<string> {
    // Fetch System Settings
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'main' },
    });

    return `
=== IDENTITY ===
Name: **Ahmed** (أحمد)
Role: Senior Customer Success Agent at **Al-Badil** (البديل للخدمات الحكومية).
Personality: Egyptian, Professional, Warm, Helpful, Empathetic.
Current Time Context: It is currently ${timeOfDay}.

=== PERSONALIZATION ===
- If you know the user's name (from the CURRENT USER CONTEXT), greet them at the beginning of the conversation or in a friendly way (e.g., "أهلاً بك يا أستاذ {name}").

=== ⚠️ CRITICAL RULES (ZERO TOLERANCE) ===
1. **SOURCE OF TRUTH:** You MUST retrieve "Required Documents" (الأوراق المطلوبة) and "Prices" ONLY from the **COMPANY KNOWLEDGE BASE** section below (which comes from the Database).
2. **NO HALLUCITNATION:** If the documents are not listed in the COMPANY KNOWLEDGE BASE for a specific service, say "I don't have the exact list right now" or ask the user to contact support. **NEVER INVENT DOCUMENTS.**
3. **PRIORITY:** The **COMPANY KNOWLEDGE BASE** (DB) overrides the **CORE KNOWLEDGE BASE** (Static) if there is a conflict regarding prices or documents.

=== 🧠 CORE KNOWLEDGE BASE (STATIC INFO) ===
${getDynamicKnowledgeBase(settings)}

=== 🔗 LINK FORMATTING RULES ===
BASE URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}

When providing a link to order a service, you MUST use FULL URLs with this EXACT format:
- **Correct Format:** [اسم الخدمة](${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/service/{slug})
- The slug comes from the SLUG field in the service data below.

EXAMPLES (using base URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}):
✅ CORRECT: [اطلب الخدمة الآن](${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/service/national-id-renewal)
✅ CORRECT: [تجديد البطاقة](${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/service/national-id-renewal)
❌ WRONG: [اطلب الخدمة](/service/national-id-renewal) ← relative path, needs full URL
❌ WRONG: [الرابط](service/national-id-renewal) ← missing base URL
❌ WRONG: [الرابط](${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/order/...) ← wrong path (order vs service)

=== INSTRUCTIONS ===
1. **Interaction Style:** DO NOT give all information at once. Be consultative.
   - **Step 1:** Ask clarifying questions to narrow down the user's specific case (e.g., "Is this first time or renewal?", "Do you have the old ID?").
   - **Step 2:** Once the case is clear, provide ONLY the relevant documents and steps for that specific scenario.
2. **Conciseness:** Keep responses SHORT (maximum 3-4 sentences per message). Users are on mobile; don't overwhelm them with long text blocks.
3. **Formatting:**
   - Use bold for key terms (documents, prices).
   - Use bullet points (-) for lists.
   - Always put the **Link to Order** at the very end of the final resolution using the EXACT format: [نص الرابط](/service/{slug})
4. **Tone:** Friendly, Egyptian, "Gad3" (Helpful & Reassuring).
5. **Links:** NEVER invent slugs. ONLY use slugs from the "SLUG:" field in the service data provided below.

=== EXAMPLE FLOW ===
User: "أنا عايز أجدد البطاقة"
Ahmed: "من عيوني يا فندم 😊. البطاقة منتهية ولا ضاعت منك؟ وهل فيه أي بيانات هتتغير (زي العنوان أو الحالة الاجتماعية)؟"
User: "لا منتهية بس"
Ahmed: "تمام جداً. في الحالة دي التجديد بسيط 👌.
الأوراق المطلوبة:
- **البطاقة المنتهية** (تسلم للمندوب).
- **صورة شخصية** (لو هنحتاج).

تقدر تطلب الخدمة فوراً من هنا:
[تجديد بطاقة الرقم القومي](${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/service/national-id-renewal)"

=== HANDLING UNKNOWN ===
If the answer isn't in the Knowledge Base or DB, say: "للتفاصيل الدقيقة دي بالذات، يا ريت تكلمنا على 01021606893 عشان نفيذك صح."
`;
  }

  private static async getBusinessData(): Promise<string> {
    try {
      const services = await prisma.service.findMany({
        where: { active: true },
        select: {
          name: true,
          slug: true,
          category: { select: { name: true } },
          variants: {
            where: { active: true },
            select: { name: true, priceCents: true, etaDays: true },
          },

          documents: {
            where: { active: true },
            select: { title: true, description: true, required: true, showIf: true },
          },

          fields: {
            where: { active: true },
            select: {
              label: true,
              type: true,
              required: true,
              showIf: true,
              options: { select: { label: true, value: true } },
            },
          },
        },
      });

      if (!services.length) return 'Services data currently unavailable.';

      return services
        .map((s: any) => {
          const variants = (s.variants || [])
            .map(
              (v: any) => `- ${v.name}: ${(v.priceCents / 100).toFixed(0)} EGP (${v.etaDays} days)`
            )
            .join('\n  ');

          const docs = (s.documents || [])
            .map(
              (d: any) =>
                `- ${d.title}${d.required ? ' (Required)' : ''}${d.showIf ? ` [Condition: ${d.showIf}]` : ''}: ${d.description || ''}`
            )
            .join('\n  ');

          const fields = (s.fields || [])
            .map((f: any) => {
              const options = f.options?.map((o: any) => o.label).join(', ');
              return `- ${f.label} (${f.type})${options ? `: [${options}]` : ''}${f.required ? '*' : ''}`;
            })
            .join('\n  ');

          return `
SERVICE: ${s.name} (${s.category?.name})
SLUG: /service/${s.slug}
VARIANTS:
  ${variants}
DOCUMENTS REQUIRED:
  ${docs || 'None'}
DYNAMIC FORM FIELDS:
  ${fields || 'None'}
`;
        })
        .join('\n\n-------------------\n\n');
    } catch (error) {
      // console.error('DB Error:', error);
      return 'Service catalog temporarily unavailable.';
    }
  }

  private static async getUserData(req: ChatRequest): Promise<string> {
    if (!req.userId && !req.userEmail) return '';

    try {
      const whereConditions: any[] = [];
      if (req.userId) whereConditions.push({ id: req.userId });
      if (req.userEmail) whereConditions.push({ email: req.userEmail });

      if (whereConditions.length === 0) return '';

      const user = await prisma.user.findFirst({
        where: { OR: whereConditions },
        include: {
          orders: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              status: true,
              totalCents: true,
              createdAt: true,
              service: { select: { name: true } },
            },
          },
        },
      });

      if (!user) return 'User profile not found.';

      const orders = (user as any).orders || [];
      let info = `User Name: ${user.name}\n`;
      if (orders.length) {
        info +=
          'Recent Orders & Status:\n' +
          orders
            .map((o: any) => {
              const date = new Date(o.createdAt).toLocaleDateString('ar-EG');
              const price = (o.totalCents / 100).toFixed(0);
              return `- ID: #${o.id.slice(-6)} | الخدمة: ${o.service?.name} | الحالة: ${o.status || 'قيد المراجعة'} | السعر: ${price} EGP | التاريخ: ${date}`;
            })
            .join('\n');
      } else {
        info += 'No order history found for this user.';
      }
      return info;
    } catch (e) {
      return 'Error fetching user history.';
    }
  }

  private static getSessionHistory(req: ChatRequest): string {
    const key = req.userId || req.userEmail || 'anonymous';
    const session = sessionStore.get(key);

    if (!session || !session.history.length) return 'No previous comments.';

    // Format: "User: msg" / "AI: msg"
    return session.history
      .slice(-CONFIG.MAX_HISTORY)
      .map(line => {
        return line.startsWith('U')
          ? `Customer: ${line.substring(5)}`
          : `Ahmed: ${line.substring(4)}`;
      })
      .join('\n');
  }

  public static updateHistory(req: ChatRequest, userMsg: string, aiMsg: string) {
    const key = req.userId || req.userEmail || 'anonymous';
    let session = sessionStore.get(key);

    if (!session) {
      session = { history: [], lastAccess: Date.now() };
      sessionStore.set(key, session);
    }

    session.history.push(`User: ${userMsg}`);
    session.history.push(`AI: ${aiMsg}`);

    // Prune
    if (session.history.length > 20) {
      session.history = session.history.slice(-20);
    }
    session.lastAccess = Date.now();
  }
}
// ============================================================================
// 4. 🤖 AI SERVICE LAYER with RETRY
// ============================================================================

// Initialize the Google GenAI Client
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' });

class GeminiService {
  static async generate(prompt: string): Promise<string> {
    let lastError;

    // Try primary then fallback models
    for (const model of CONFIG.MODELS) {
      try {
        // console.log(`[AI] Trying model: ${model}`);

        const response = await ai.models.generateContent({
          model: model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        });

        // console.log(`[AI] Response received from ${model}`);

        // Try getting text from common paths

        const text = response.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Check for blocked response

        if (response?.candidates?.[0]?.finishReason === 'SAFETY') {
          // console.warn(`[AI] Response blocked by safety filter on model ${model}`);
          throw new Error('Response blocked by safety filter');
        }

        if (text) {
          // console.log(`[AI] Success with model: ${model}, response length: ${text.length}`);
          return text;
        }

        // console.warn(`[AI] Empty response from ${model}`);
        throw new Error(`Empty response from ${model}`);
      } catch (e: any) {
        // console.error(`[AI] Model ${model} failed:`, e.message);
        lastError = e;
        // Continue to next model
      }
    }

    // console.error(`[AI] All models failed. Last error:`, lastError?.message);
    throw lastError || new Error('All AI models failed');
  }
}

// Removed callApi as it is no longer needed

// ============================================================================
// 5. 🎮 CONTROLLER (API ENTRY POINT)
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // 1. Parse & Validate
    const body = await req.json().catch(() => ({}));
    if (!body.message?.trim()) {
      return NextResponse.json({ success: false, response: 'Please speak up!' }, { status: 400 });
    }

    const request: ChatRequest = {
      message: body.message,
      userId: body.userId,
      userEmail: body.userEmail,
      isAuthenticated: !!body.isAuthenticated,
      currentPath: body.currentPath,
      userName: body.userName,
    };

    // 2. Build Context
    const fullContext = await ContextBuilder.build(request);
    const finalPrompt = `${fullContext}\n\n=== NEW MESSAGE ===\nCustomer: ${request.message}\n\nAhmed (Response):`;

    // 3. AI Generation (with retry)
    let aiResponse = '';
    try {
      aiResponse = await GeminiService.generate(finalPrompt);
    } catch (error: any) {
      // console.error('AI Generation Error:', error);
      aiResponse = `(Debug Error): ${error.message || 'Unknown error occurred'}`;
    }

    if (!aiResponse) aiResponse = "I'm listening...";

    // 4. Update Memory
    ContextBuilder.updateHistory(request, request.message, aiResponse);

    // 5. Respond
    return NextResponse.json({
      success: true,
      response: aiResponse,
      source: 'ai-v2',
    });
  } catch (error: any) {
    // console.error('FATAL API ERROR:', error);
    return NextResponse.json(
      { success: false, response: `System Error: ${error.message}` },
      { status: 500 }
    );
  }
}
