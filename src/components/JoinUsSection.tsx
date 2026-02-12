import { Link } from 'react-router-dom'

/** Join Us in Making a Difference – heading, paragraph, two CTAs, then large image with quote overlay */

const QUOTE =
  '"Every child deserves the opportunity to shine, regardless of their unique challenges. Together, we can create a world where neurodiversity is not just accepted, but celebrated."'

export default function JoinUsSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header: heading + paragraph + buttons */}
        <div className="text-center mb-12">
          <h2 className="font-sans text-2xl sm:text-3xl lg:text-[44px] lg:leading-[65px] lg:tracking-[-0.44px] font-medium text-[#000] text-center mb-4">
            Join Us in Making a Difference
          </h2>
          <p className="font-sans text-[18px] font-normal leading-[155%] text-[var(--sds-color-text-default-default)] text-center max-w-2xl mx-auto mb-8">
            Your support helps us provide resources, sponsor activities, and create opportunities for children with Neurodevelopmental Disorders to shine. Together, we can build a more inclusive world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/resources"
              className="flex h-[50px] items-center justify-center bg-[#0F006A] text-[#FFF] px-8 rounded-full font-normal hover:opacity-90 transition-opacity text-base"
            >
              Explore resources
            </Link>
            <Link
              to="/newsletter"
              className="flex h-[50px] items-center justify-center bg-white border-2 border-[#0F006A] text-[#0F006A] px-8 rounded-full font-normal hover:bg-[#0F006A]/5 transition-colors text-base"
            >
              Stay Connected
            </Link>
          </div>
        </div>

        {/* Large image with quote overlay – yellow box pops out (half on image, half below) */}
        <div className="relative w-full pb-[90px]">
          <div className="relative w-full rounded-[25px] overflow-hidden aspect-[16/10] sm:aspect-[2/1] max-h-[500px] bg-gray-200">
            <img
              src="/images/homepage.png"
              alt=""
              className="absolute inset-0 w-full h-full min-w-full object-cover rounded-[25px]"
            />
          </div>
          {/* Yellow quote – center at image bottom, half sticks out below */}
          <div
            className="absolute left-1/2 w-[85%] max-w-4xl flex justify-center px-0"
            style={{ bottom: '90px', transform: 'translate(-50%, 50%)' }}
          >
            <div className="flex min-h-[170px] w-full flex-col items-start justify-center gap-[25px] rounded-[25px] bg-[#FBCE3E] px-6 py-[34px] sm:px-10 lg:px-12 shadow-lg">
              <p className="font-sans text-[18px] font-semibold leading-normal text-[#000] text-left">
                {QUOTE}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
