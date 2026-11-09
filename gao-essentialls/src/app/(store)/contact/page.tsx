import { Mail, MapPin, MessageSquare, Phone, Clock } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="container-page py-12 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          Customer Concierge
        </span>
        <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">
          We&apos;re Here to Help
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-neutral-500 leading-relaxed">
          Questions regarding your shipment, product specifications, bulk orders, or returns? Reach out to our team below.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-4xl grid gap-8 md:grid-cols-[1fr_340px]">
        {/* Contact Form Card */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-6 sm:p-8">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-neutral-950">
            Send an Inquiry
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            Complete the fields below and our team will get in touch promptly.
          </p>

          <form
            onSubmit={undefined}
            action="#"
            className="mt-6 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="label">
                  Your Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Lerato Khumalo"
                  className="input text-xs"
                />
              </div>

              <div>
                <label htmlFor="email" className="label">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="input text-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="label">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="e.g. 071 234 5678"
                className="input text-xs"
              />
            </div>

            <div>
              <label htmlFor="subject" className="label">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="e.g. Inquiry regarding order delivery"
                className="input text-xs"
              />
            </div>

            <div>
              <label htmlFor="message" className="label">
                Message <span className="text-red-600">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                placeholder="How can our customer team assist you?"
                className="input min-h-24 resize-none text-xs"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-md bg-neutral-950 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-6 space-y-5">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-950">
              Direct Contact
            </h3>

            {settings.phone && (
              <div className="flex items-start gap-3 text-xs">
                <div className="grid h-8 w-8 place-items-center rounded-sm bg-neutral-900 text-white shrink-0">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400">Phone Support</span>
                  <p className="font-bold text-neutral-950 mt-0.5">{settings.phone}</p>
                </div>
              </div>
            )}

            {settings.whatsapp && (
              <div className="flex items-start gap-3 text-xs">
                <div className="grid h-8 w-8 place-items-center rounded-sm bg-emerald-700 text-white shrink-0">
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400">WhatsApp Dispatch</span>
                  <p className="font-bold text-neutral-950 mt-0.5">{settings.whatsapp}</p>
                </div>
              </div>
            )}

            {settings.email && (
              <div className="flex items-start gap-3 text-xs">
                <div className="grid h-8 w-8 place-items-center rounded-sm bg-neutral-900 text-white shrink-0">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400">Email Inquiries</span>
                  <p className="font-bold text-neutral-950 break-all mt-0.5">{settings.email}</p>
                </div>
              </div>
            )}

            {settings.address && (
              <div className="flex items-start gap-3 text-xs">
                <div className="grid h-8 w-8 place-items-center rounded-sm bg-neutral-900 text-white shrink-0">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400">Collection Warehouse</span>
                  <p className="font-medium text-neutral-900 leading-snug mt-0.5">{settings.address}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 text-xs border-t border-neutral-200 pt-4">
              <div className="grid h-8 w-8 place-items-center rounded-sm bg-neutral-200 text-neutral-700 shrink-0">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <div>
                <span className="font-semibold uppercase tracking-wider text-[10px] text-neutral-400">Business Hours</span>
                <p className="text-xs text-neutral-900 font-medium mt-0.5">Mon – Fri: 08:30 – 17:30</p>
                <p className="text-xs text-neutral-900">Saturday: 09:00 – 14:00</p>
                <p className="text-[11px] text-neutral-400">Sunday & Holidays: Online only</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
