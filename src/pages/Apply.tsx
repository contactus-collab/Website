import { useState, FormEvent } from 'react'
import Newsletter from '../components/Newsletter'
import { supabase } from '../lib/supabase'

export default function Apply() {
  const [childName, setChildName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [parentName, setParentName] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const { error: insertError } = await supabase.from('grant_applications').insert({
        child_name: childName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        parent_name: parentName.trim() || null,
        additional_notes: additionalNotes.trim() || null,
      })

      if (insertError) throw insertError
      setSubmitted(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section – matches Purpose page */}
      <section className="bg-white flex flex-col">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div
            className="rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-xl"
            style={{
              background: 'linear-gradient(180deg, #E8E4F7 0%, #F8F7FC 50%, #FFFFFF 100%)',
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-5 sm:p-6 lg:p-8 items-center">
              {/* Left – pill, headline, paragraph */}
              <div className="order-2 lg:order-1">
                <span
                  className="inline-flex h-[32px] items-center justify-center rounded-[50px] px-4 text-sm font-bold mb-4"
                  style={{ backgroundColor: '#ECE6FE', color: '#4E288E' }}
                >
                  Apply
                </span>
                <h1
                  className="mb-4 text-3xl sm:text-4xl lg:text-[44px] lg:leading-[58px]"
                  style={{
                    color: 'var(--Primary-Blue, #0F006A)',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    letterSpacing: '-0.62px',
                  }}
                >
                  <span style={{ color: '#000' }}>Apply for a </span>
                  <span>Grant</span>
                </h1>
                <p
                  className="mb-6 max-w-xl"
                  style={{
                    color: 'var(--sds-color-text-default-default)',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: '18px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '155%',
                  }}
                >
                  In order to receive a grant, please share the event details, the phone number for the event organiser, or the URL for which the child is applying for. You can provide this information in the additional notes section below.
                </p>
              </div>

              {/* Right – 4-image collage */}
              <div className="order-1 lg:order-2 grid grid-cols-2 gap-2 sm:gap-3">
                <img
                  src="/images/Purpose_Image.jpeg"
                  alt=""
                  className="w-full aspect-[4/3] object-cover rounded-[2rem_3rem_1.5rem_2.5rem]"
                />
                <img
                  src="/images/purpose.jpeg"
                  alt=""
                  className="w-full aspect-[4/3] object-cover rounded-[3rem_1.5rem_2.5rem_2rem] mt-2 sm:mt-3"
                />
                <img
                  src="/images/Hero_Image.jpeg"
                  alt=""
                  className="w-full aspect-[4/3] object-cover rounded-[1.5rem_2rem_3rem_1.5rem] -mt-1 sm:-mt-2"
                />
                <img
                  src="/images/Image.png"
                  alt=""
                  className="w-full aspect-[4/3] object-cover rounded-[2.5rem_1.5rem_2rem_3rem] mt-1 sm:mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form section */}
      <section
        className="py-12 px-4 sm:py-16 pb-20"
        style={{
          background: 'linear-gradient(180deg, #FAFAFC 0%, #F5F3F9 50%, #FFFFFF 100%)',
        }}
      >
        <div className="max-w-2xl mx-auto">
          <h2
            className="mb-8 text-2xl sm:text-3xl font-medium"
            style={{
              color: '#0F006A',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              letterSpacing: '-0.5px',
            }}
          >
            Application details
          </h2>

          {submitted ? (
            <div
              className="text-center py-12"
              style={{
                color: 'var(--sds-color-text-default-default)',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: '18px',
                lineHeight: '155%',
              }}
            >
              <p className="font-medium text-[#0F006A] mb-2">Thank you for your application.</p>
              <p>We will review your submission and be in touch.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
                    {error}
                  </div>
                )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="childName"
                    className="block mb-2 font-medium"
                    style={{
                      color: 'var(--sds-color-text-default-default)',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: '15px',
                    }}
                  >
                    Name of the child <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="childName"
                    name="childName"
                    type="text"
                    required
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Child's full name"
                    className="w-full h-[50px] px-5 rounded-2xl border border-gray-200 bg-white/80 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0F006A]/25 focus:border-[#0F006A] focus:bg-white transition-all"
                    style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px' }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 font-medium"
                    style={{
                      color: 'var(--sds-color-text-default-default)',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: '15px',
                    }}
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full h-[50px] px-5 rounded-2xl border border-gray-200 bg-white/80 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0F006A]/25 focus:border-[#0F006A] focus:bg-white transition-all"
                    style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="phone"
                    className="block mb-2 font-medium"
                    style={{
                      color: 'var(--sds-color-text-default-default)',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: '15px',
                    }}
                  >
                    Phone number <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full h-[50px] px-5 rounded-2xl border border-gray-200 bg-white/80 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0F006A]/25 focus:border-[#0F006A] focus:bg-white transition-all"
                    style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px' }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="parentName"
                    className="block mb-2 font-medium"
                    style={{
                      color: 'var(--sds-color-text-default-default)',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: '15px',
                    }}
                  >
                    Name of the parent <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="parentName"
                    name="parentName"
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Parent or guardian name"
                    className="w-full h-[50px] px-5 rounded-2xl border border-gray-200 bg-white/80 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0F006A]/25 focus:border-[#0F006A] focus:bg-white transition-all"
                    style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px' }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="additionalNotes"
                  className="block mb-2 font-medium"
                  style={{
                    color: 'var(--sds-color-text-default-default)',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: '15px',
                  }}
                >
                  Additional notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <p
                  className="mb-2 text-sm text-gray-600"
                  style={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    lineHeight: '155%',
                  }}
                >
                  Include event details, event organiser phone number, or the URL for which the child is applying.
                </p>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  rows={4}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Event details, organiser phone number, or application URL..."
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white/80 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0F006A]/25 focus:border-[#0F006A] focus:bg-white transition-all resize-y min-h-[120px]"
                  style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px', lineHeight: '155%' }}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto sm:min-w-[220px] h-[52px] flex items-center justify-center rounded-full font-medium text-white border-0 focus:outline-none focus:ring-2 focus:ring-[#0F006A]/50 transition-all hover:opacity-95 hover:shadow-lg hover:shadow-[#0F006A]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#0F006A', fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '16px' }}
                >
                  {submitting ? 'Submitting...' : 'Submit application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <Newsletter />
    </div>
  )
}
