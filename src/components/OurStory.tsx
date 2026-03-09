export default function OurStory() {
  return (
    <section className="py-12 px-4 sm:py-16">
      <div className="max-w-7xl mx-auto overflow-hidden rounded-[24px] sm:rounded-[28px] shadow-lg relative aspect-[16/9] sm:aspect-[21/9] min-h-[240px] sm:min-h-[280px] bg-gray-100">
        <img
          src="/images/Container.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute left-4 sm:left-6 right-4 sm:right-auto top-1/2 -translate-y-1/2 w-auto sm:w-[608px] max-w-[calc(100%-2rem)] flex flex-col items-start gap-[10px] rounded-[25px] py-[34px] px-[26px]"
          style={{ backgroundColor: '#FBCE3E' }}
        >
          <span
            className="inline-flex w-fit h-[32px] items-center justify-center rounded-[50px] px-4 text-sm font-medium"
            style={{ backgroundColor: '#EBE8FD', color: 'var(--Primary-Blue, #0F006A)' }}
          >
            Our Story
          </span>
          <p
            className="max-w-full"
            style={{
              color: 'var(--sds-color-text-default-default)',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '18px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '155%',
            }}
          >
            With one in 36 kids on the spectrum, Neurodevelopmental Disorder (ND) are a growing issue affecting families across the US — with many not getting the support they need. The Ball Four Foundation was created to bridge the gaps in awareness and care about Neurodevelopmental Disorder (ND), so that families can find the books about them and the resources they need, young people can reach their full potential, and together we can create a more inclusive world for everyone.
          </p>
        </div>
      </div>
    </section>
  )
}
