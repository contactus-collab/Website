import { Link } from 'react-router-dom'

export default function Mission() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-left">
              Raising Neurodevelopmental Disorders (ND) Awareness So Every Kid Can Be in the Spotlight
            </h2>
            <p className="text-lg text-gray-700 mb-6 text-left">
              With one in 36 kids on the spectrum, Neurodevelopmental Disorders (ND) are a growing issue affecting families across the US — <strong>with many not getting the support they need.</strong>
            </p>
            <p className="text-gray-700 text-lg mb-8 text-left">
              The Ball Four Foundation was created to bridge the gaps in awareness and care about Neurodevelopmental Disorders (ND), so that families can find the books about them and the resources they need, young people can reach their full potential, and together we can create a more inclusive world for everyone.
            </p>
            <div className="text-left">
              <Link
                to="/purpose"
                className="inline-block text-primary-600 font-semibold hover:text-primary-700 transition-colors underline-offset-4 hover:underline cursor-pointer"
              >
                More on our Mission →
              </Link>
            </div>
          </div>
          
          {/* Right Side - Image */}
          <div className="order-1 lg:order-2">
            <img
              src="/images/Home_Page_1.png"
              alt="Ball Four Foundation Mission"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
