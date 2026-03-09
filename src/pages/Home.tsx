/** Home page – section order matches Figma Ball4 Foundation Website */

import Hero from '../components/Hero'
import Mission from '../components/Mission'
import WhatWeDo from '../components/WhatWeDo'
import OurStory from '../components/OurStory'
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
      <OurStory />
      <Impact />
      <LatestNotes />
      <JoinUsSection
        heading="Stay Informed"
        description="Together, we can build a more inclusive world."
        primaryLabel="Join Our Newsletter"
        primaryTo="/newsletter"
        secondaryLabel="Stay Connected"
        secondaryTo="#footer"
        secondaryIsAnchor
      />
      <Newsletter />
    </>
  )
}
