'use client';

import React, { useState } from 'react';
import { Mail, MessageSquare, Clock, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  return (
    <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 w-full space-y-12 min-h-screen">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/3 -z-10 h-[300px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]"></div>

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">Get In Touch</h1>
        <p className="text-sm text-slate-400">
          Have queries about typing speeds, corporate layouts, or exam prep exercises? Let us know.
        </p>
      </div>

      {/* Contact Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        {/* Support Sidebar details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 space-y-6">
            <h3 className="text-lg font-bold text-white">Contact Info</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex gap-3.5 items-start">
                <div className="h-8 w-8 rounded-lg bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-300">Email Support</p>
                  <p className="text-slate-400 mt-0.5">support@typevision.com</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="h-8 w-8 rounded-lg bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-300">Working Hours</p>
                  <p className="text-slate-400 mt-0.5">Mon - Fri: 9:00 AM - 6:00 PM</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="h-8 w-8 rounded-lg bg-purple-950/50 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-300">Headquarters</p>
                  <p className="text-slate-400 mt-0.5">New Delhi, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-6 sm:p-8 shadow-xl backdrop-blur-sm">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-bounce">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Message Sent Successfully!</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Thank you for reaching out. A support coordinator will review your request and get back to you within 24 business hours.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="rounded-xl border border-white/10 bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Inquiry about Remington keyboard practice layouts"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Your Message</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what you need help with..."
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
