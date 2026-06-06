import Link from 'next/link'
import { ScanLine, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Branded header */}
      <div className="bg-slate-950 border-b border-white/8 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/30">
              <ScanLine className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-black tracking-tight">AutoAuditAI</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </div>

      {/* Page header */}
      <div className="bg-white border-b border-slate-100 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full mb-4">
            Legal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: June 2026 · We keep this simple and honest</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Summary banner */}
          <div className="bg-teal-50 border-b border-teal-100 px-6 py-5">
            <h2 className="text-sm font-bold text-teal-800 mb-1">The short version</h2>
            <p className="text-sm text-teal-700">
              We collect only what we need to run the service. We don&apos;t sell your data. You can delete everything at any time from your account settings.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              {
                n: '1', title: 'What We Collect',
                list: [
                  'Account: name, email, business name, phone, industry',
                  'Vehicles: make, model, year, licence plate, colour',
                  'Inspection media: photos and video frames you upload for analysis',
                  'AI reports: damage findings, grades, and descriptions generated from your media',
                  'Usage: pages visited, features used, inspection counts (via PostHog analytics)',
                  'Payments: processed by Stripe — we never store card numbers',
                ],
              },
              {
                n: '2', title: 'How We Use Your Data',
                list: [
                  'To provide AI-powered vehicle inspection reports',
                  'To send transactional emails (verification, completion notifications, password resets)',
                  'To improve AI detection accuracy using aggregate, anonymised analysis only',
                  'To manage your subscription and billing',
                  'To provide customer support',
                ],
              },
              {
                n: '3', title: 'Data Storage and Security',
                body: 'Your data is stored on secure cloud infrastructure (Neon PostgreSQL, Vercel Blob Storage). Media files are stored with encryption. We use bcrypt password hashing, JWT session tokens, and HTTPS on all connections. We do not sell your data to third parties.',
              },
              {
                n: '4', title: 'Third-Party Services',
                list: [
                  'Google Gemini / Anthropic Claude: Photos are sent to AI APIs for analysis. Media is not retained beyond the API call.',
                  'Stripe: Handles payment processing — subject to Stripe\'s privacy policy.',
                  'Vercel: Hosting and edge infrastructure.',
                  'Resend: Transactional email delivery.',
                  'PostHog: Product analytics (anonymised usage data — respects your cookie consent choice).',
                ],
              },
              {
                n: '5', title: 'Media Retention',
                body: 'Inspection photos and video frames are stored for as long as your account is active. Deleting an inspection permanently removes associated media from our storage.',
              },
              {
                n: '6', title: 'Your Rights',
                list: [
                  'Access: View all your data in your dashboard at any time',
                  'Delete: Go to Settings → Delete Account to permanently remove all your data',
                  'Export: Contact us via WhatsApp to request a copy of your data',
                  'Correction: Update your profile from the dashboard at any time',
                  'Cookie opt-out: Decline analytics cookies via the banner on our website',
                ],
              },
              {
                n: '7', title: 'Cookies',
                body: 'We use essential session cookies (required for login) and optional analytics cookies (PostHog). You can decline analytics cookies via the cookie consent banner. Essential cookies cannot be disabled — they are required for the app to function.',
              },
              {
                n: '8', title: 'Children',
                body: 'AutoAuditAI is not intended for users under 18. We do not knowingly collect data from minors.',
              },
              {
                n: '9', title: 'Changes to This Policy',
                body: 'We may update this policy. We will notify registered users by email for significant changes. Continued use of the Service after changes constitutes acceptance.',
              },
              {
                n: '10', title: 'Contact',
                body: null,
                contact: true,
              },
            ].map((section) => (
              <div key={section.n} className="px-6 py-6">
                <h2 className="text-base font-bold text-slate-900 mb-2.5">{section.n}. {section.title}</h2>
                {section.body && <p className="text-sm text-slate-600 leading-relaxed">{section.body}</p>}
                {section.list && (
                  <ul className="space-y-1.5">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-teal-500 mt-0.5 shrink-0">•</span> {item}
                      </li>
                    ))}
                  </ul>
                )}
                {section.contact && (
                  <p className="text-sm text-slate-600">
                    For privacy concerns or data requests, contact us via{' '}
                    <a href="https://wa.me/923434994409" className="text-teal-600 hover:underline font-medium">WhatsApp</a>
                    {' '}or{' '}
                    <a href="tel:+923434994409" className="text-teal-600 hover:underline font-medium">+92-343-4994409</a>.
                    We respond within 48 hours.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 text-xs text-slate-400">
          <span>© 2026 AutoAuditAI</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
