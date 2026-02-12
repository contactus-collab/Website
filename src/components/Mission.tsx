import { Link } from 'react-router-dom'

export default function Mission() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-[25px] bg-[#F6F3FD] p-8 sm:p-10 lg:p-12">
          {/* Pill label */}
          <span className="inline-flex h-[32px] items-center justify-center rounded-[50px] bg-[#DBD3F5] px-4 text-brand-purple-dark text-base font-normal mb-6">
            Our Mission
          </span>

          {/* Heading row: title left (half width), button right */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
            <h2 className="font-sans text-2xl sm:text-3xl lg:text-[44px] lg:leading-[65px] lg:tracking-[-0.44px] font-medium text-[#000] max-w-full lg:max-w-[66.666%]">
              Raising Neurodevelopmental Disorders (ND) Awareness So Every Kid Can Be in the Spotlight.
            </h2>
            <Link
              to="/purpose"
              className="inline-block shrink-0 bg-[#0F006A] text-[#FFF] px-10 py-4 rounded-full font-normal hover:opacity-90 transition-opacity shadow-md hover:shadow-lg text-base"
            >
              More on our Mission
            </Link>
          </div>

          {/* Paragraph */}
          <p className="font-sans text-[18px] font-normal leading-[155%] text-[var(--sds-color-text-default-default)] max-w-3xl mb-10">
            The Ball Four Foundation raises awareness for Neurodevelopmental Disorders (ND) through education and advocacy as well as by sponsoring performance-based activities for kids with disabilities.
          </p>

          {/* Two images side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <img
              src="/images/Image.png"
              alt="Raising ND awareness"
              className="w-full h-auto rounded-[25px] object-cover aspect-[4/3]"
            />
            <img
              src="/images/Image%20(1).png"
              alt="Every kid in the spotlight"
              className="w-full h-auto rounded-[25px] object-cover aspect-[4/3]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
