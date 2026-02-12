import { Link } from 'react-router-dom'

/** Values section – "Our Mission" pill, centered heading, 3 cards, More on our Mission button */

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

const VALUES = [
  {
    title: 'Spreading the Word',
    description: 'Sharing articles, books, podcasts, and other educational resources about Neurodevelopmental Disorders (ND) that keep families informed about the latest research and treatment options.',
    cardBg: '#0F006A',
    textColor: '#FFF',
    iconBg: '#93C5FD',
    iconColor: '#FFF',
  },
  {
    title: 'Advocating for Change',
    description: 'Leading the charge for a more inclusive world by increasing access to Neurodevelopmental Disorders (ND) assessments, therapy options, and employment opportunities',
    cardBg: '#FBCE3E',
    textColor: '#0F006A',
    iconBg: '#FFFFFF',
    iconColor: '#0F006A',
  },
  {
    title: 'Creating Opportunities to Be Seen and Heard',
    description: 'Sponsoring dance, art, sports, and other performance-based activities that give kids with Neurodevelopmental Disorders (ND) the opportunity to develop their talents and take center stage.',
    cardBg: '#3EFBE4',
    textColor: '#0F006A',
    iconBg: '#FFFFFF',
    iconColor: '#0F006A',
  },
]

export default function WhatWeDo() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="inline-flex h-[32px] items-center justify-center rounded-[50px] bg-[#DBD3F5] px-4 text-[#0F006A] text-base font-normal mb-6">
            Our Mission
          </span>
          <h2 className="font-sans text-2xl sm:text-3xl lg:text-[44px] lg:leading-[65px] lg:tracking-[-0.44px] font-medium text-[#000] text-center max-w-[66.666%]">
            We are guided by values that prioritize the well-being of both parents and children
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 mb-12">
          {VALUES.map((item, i) => (
            <div
              key={i}
              className="rounded-[25px] p-10 flex flex-col justify-between items-start flex-1 min-w-0 min-h-[434px] md:h-[434px]"
              style={{ backgroundColor: item.cardBg }}
            >
              <div className="flex flex-col items-start">
                <div
                  className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: item.iconBg }}
                >
                  <ShieldCheckIcon className="w-5 h-5" style={{ color: item.iconColor }} />
                </div>
                <h3
                  className="font-sans text-[24px] font-semibold leading-normal text-left mt-4"
                  style={{ color: item.textColor }}
                >
                  {item.title}
                </h3>
              </div>
              <p
                className="font-sans text-[16px] font-normal leading-normal text-left mt-auto"
                style={{ color: item.textColor }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            to="/purpose"
            className="inline-block bg-[#0F006A] text-[#FFF] px-10 py-4 rounded-full font-normal hover:opacity-90 transition-opacity shadow-md hover:shadow-lg text-base"
          >
            More on our Mission
          </Link>
        </div>
      </div>
    </section>
  )
}
