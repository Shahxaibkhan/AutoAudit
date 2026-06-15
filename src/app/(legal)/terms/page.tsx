import Link from 'next/link'
import { ScanLine, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">Terms of Service</h1>
          <p className="text-slate-400 text-sm">Last updated: June 2026 · Effective immediately upon account creation</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* AI Disclaimer — highlighted */}
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-5">
            <h2 className="text-sm font-bold text-amber-800 mb-2">⚠️ Important: AI Inspection Disclaimer</h2>
            <ul className="space-y-1.5 text-sm text-amber-700 list-disc list-inside">
              <li>AutoAuditAI reports are AI-generated and are <strong>not a substitute for a physical inspection by a qualified mechanic or assessor.</strong></li>
              <li>AI detection accuracy depends on photo/video quality, lighting, and angles. Some damage may be missed; some findings may be false positives.</li>
              <li>Repair cost estimates are approximate regional averages. Actual costs may vary significantly.</li>
              <li>We do not guarantee accuracy, completeness, or fitness for any legal purpose of any inspection report.</li>
              <li>Reports should be used as a screening tool — not as the sole basis for financial or legal decisions.</li>
            </ul>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              {
                n: '1', title: 'Acceptance of Terms',
                body: 'By accessing or using AutoAuditAI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.',
              },
              {
                n: '2', title: 'Description of Service',
                body: 'AutoAuditAI provides AI-powered vehicle inspection reports using photographs and video recordings. The Service is intended for use by vehicle owners, rental businesses, dealerships, and individual car buyers and sellers worldwide.',
              },
              {
                n: '3', title: 'User Responsibilities',
                body: null,
                list: [
                  'You must provide accurate information when registering and creating inspections.',
                  'You must have the legal right to inspect the vehicle being photographed.',
                  'You must not use the Service for fraudulent purposes or to misrepresent vehicle condition.',
                  'You are responsible for the accuracy and legality of photos/videos you upload.',
                  'You must not share your account credentials or allow unauthorised access.',
                ],
              },
              {
                n: '4', title: 'Subscriptions and Credits',
                body: 'The Service is offered on a credit-based model. Credits expire at the end of each billing period unless otherwise stated. Free trial includes 1–2 inspections depending on account type (individual or business). We reserve the right to modify pricing with 30 days notice. No refunds are provided for unused credits except as required by law.',
              },
              {
                n: '5', title: 'Intellectual Property',
                body: 'You retain ownership of photos and videos you upload. By uploading, you grant AutoAuditAI a limited licence to process and analyse them to provide the Service. We do not sell or share your inspection data with third parties except as required by law.',
              },
              {
                n: '6', title: 'Limitation of Liability',
                body: 'To the maximum extent permitted by applicable law, AutoAuditAI shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the 30 days preceding any claim.',
              },
              {
                n: '7', title: 'Data and Privacy',
                body: null,
                link: { href: '/privacy', text: 'View our Privacy Policy' },
                body2: 'Your use of the Service is also governed by our Privacy Policy. You may request deletion of your account and all data at any time from Settings → Delete Account.',
              },
              {
                n: '8', title: 'Changes to Terms',
                body: 'We may update these Terms from time to time. We will notify registered users by email. Continued use of the Service after changes constitutes acceptance of the updated Terms.',
              },
              {
                n: '9', title: 'Contact',
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
                {section.link && (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {section.body2}{' '}
                    <Link href={section.link.href} className="text-teal-600 hover:underline font-medium">{section.link.text}</Link>
                  </p>
                )}
                {section.contact && (
                  <p className="text-sm text-slate-600">
                    For questions about these Terms, contact us via{' '}
                    <a href="https://wa.me/923434994409" className="text-teal-600 hover:underline font-medium">WhatsApp</a>
                    {' '}or{' '}
                    <a href="tel:+923434994409" className="text-teal-600 hover:underline font-medium">+92-343-4994409</a>.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 text-xs text-slate-400">
          <span>© 2026 AutoAuditAI</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
