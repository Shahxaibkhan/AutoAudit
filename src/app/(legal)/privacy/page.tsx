import Link from 'next/link'
import { ScanLine } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
            <ScanLine className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-slate-900">AutoAuditAI</span>
        </Link>

        <h1 className="text-3xl font-black text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-10">Last updated: June 2026</p>

        <div className="space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">1. What We Collect</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Account information:</strong> name, email, business name, phone number, industry</li>
              <li><strong>Vehicle information:</strong> make, model, year, license plate, colour</li>
              <li><strong>Inspection media:</strong> photos and video recordings you upload for analysis</li>
              <li><strong>AI-generated reports:</strong> damage findings, grades, and descriptions</li>
              <li><strong>Usage data:</strong> pages visited, features used, inspection counts</li>
              <li><strong>Payment information:</strong> handled by Stripe — we do not store card numbers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">2. How We Use Your Data</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>To provide AI-powered vehicle inspection reports</li>
              <li>To send transactional emails (verification, inspection completion, password reset)</li>
              <li>To improve AI detection accuracy (aggregate, anonymised analysis only)</li>
              <li>To manage your subscription and billing</li>
              <li>To provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">3. Data Storage and Security</h2>
            <p>Your data is stored on secure cloud infrastructure (Neon PostgreSQL, Vercel Blob Storage). Media files are stored encrypted. We use industry-standard security practices including bcrypt password hashing and JWT session tokens. We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">4. Third-Party Services</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Google Gemini / Anthropic Claude:</strong> Photos are sent to AI APIs for analysis. Media is not retained by these providers beyond the API call.</li>
              <li><strong>Stripe:</strong> Handles payment processing. Subject to Stripe's privacy policy.</li>
              <li><strong>Vercel:</strong> Hosting and edge infrastructure. Subject to Vercel's privacy policy.</li>
              <li><strong>Resend:</strong> Transactional email delivery.</li>
              <li><strong>PostHog:</strong> Product analytics (anonymised usage data).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">5. Media Retention</h2>
            <p>Inspection photos and video frames are stored for as long as your account is active. You can delete individual inspections at any time from your dashboard. Deleting an inspection permanently removes associated media from our storage.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">6. Your Rights</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Access:</strong> You can view all your data in your dashboard at any time</li>
              <li><strong>Export:</strong> Contact us to request a copy of your data</li>
              <li><strong>Deletion:</strong> You can delete your account and all associated data from Settings → Account → Delete Account</li>
              <li><strong>Correction:</strong> You can update your profile information from the dashboard</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">7. Cookies</h2>
            <p>We use essential cookies for session management (NextAuth.js) and optional analytics cookies (PostHog). You can decline analytics cookies via the cookie consent banner. Essential cookies cannot be disabled as they are required for login to work.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">8. Children</h2>
            <p>AutoAuditAI is not intended for users under 18. We do not knowingly collect data from minors.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">9. Contact</h2>
            <p>For privacy concerns or data requests, contact us at <a href="tel:+923434994409" className="text-teal-600 hover:underline">+92-343-4994409</a> or via <a href="https://wa.me/923434994409" className="text-teal-600 hover:underline">WhatsApp</a>.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex gap-6 text-sm text-slate-400">
          <Link href="/" className="hover:text-slate-600">← Back to home</Link>
          <Link href="/terms" className="hover:text-slate-600">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}
