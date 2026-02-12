/** Home page – section order matches Figma Ball4 Foundation Website */

import Hero from '../components/Hero'
import Mission from '../components/Mission'
import WhatWeDo from '../components/WhatWeDo'
import Impact from '../components/Impact'
import LatestNotes from '../components/LatestNotes'
import JoinUsSection from '../components/JoinUsSection'
import Newsletter from '../components/Newsletter'

export default function Home() {
  return (
    <>
      <Hero />
      <Mission />
      <WhatWeDo />
      <Impact />
      <LatestNotes />
      <JoinUsSection />
      <Newsletter />
    </>
  )
}
