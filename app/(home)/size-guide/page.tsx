import Link from 'next/link'
import { Home, ChevronRight } from 'lucide-react'

export default function SizeGuidePage() {
  const sizeCharts = [
    {
      gender: "Women's",
      sizes: [
        { us: '5', uk: '2.5', eu: '35', cm: '22' },
        { us: '5.5', uk: '3', eu: '35.5', cm: '22.5' },
        { us: '6', uk: '3.5', eu: '36', cm: '23' },
        { us: '6.5', uk: '4', eu: '37', cm: '23.5' },
        { us: '7', uk: '4.5', eu: '37.5', cm: '24' },
        { us: '7.5', uk: '5', eu: '38', cm: '24.5' },
        { us: '8', uk: '5.5', eu: '38.5', cm: '25' },
        { us: '8.5', uk: '6', eu: '39', cm: '25.5' },
        { us: '9', uk: '6.5', eu: '40', cm: '26' },
        { us: '9.5', uk: '7', eu: '40.5', cm: '26.5' },
        { us: '10', uk: '7.5', eu: '41', cm: '27' },
      ],
    },
    {
      gender: "Men's",
      sizes: [
        { us: '6', uk: '5.5', eu: '38.5', cm: '24' },
        { us: '6.5', uk: '6', eu: '39', cm: '24.5' },
        { us: '7', uk: '6.5', eu: '40', cm: '25' },
        { us: '7.5', uk: '7', eu: '40.5', cm: '25.5' },
        { us: '8', uk: '7.5', eu: '41', cm: '26' },
        { us: '8.5', uk: '8', eu: '42', cm: '26.5' },
        { us: '9', uk: '8.5', eu: '42.5', cm: '27' },
        { us: '9.5', uk: '9', eu: '43', cm: '27.5' },
        { us: '10', uk: '9.5', eu: '44', cm: '28' },
        { us: '10.5', uk: '10', eu: '44.5', cm: '28.5' },
        { us: '11', uk: '10.5', eu: '45', cm: '29' },
        { us: '11.5', uk: '11', eu: '45.5', cm: '29.5' },
        { us: '12', uk: '11.5', eu: '46', cm: '30' },
      ],
    },
    {
      gender: 'Kids\'',
      sizes: [
        { us: '3.5', uk: '2.5', eu: '35', cm: '22' },
        { us: '4', uk: '3', eu: '36', cm: '23' },
        { us: '4.5', uk: '3.5', eu: '36.5', cm: '23.5' },
        { us: '5', uk: '4', eu: '37', cm: '24' },
        { us: '5.5', uk: '4.5', eu: '38', cm: '24.5' },
        { us: '6', uk: '5.5', eu: '38.5', cm: '25' },
        { us: '6.5', uk: '6', eu: '39', cm: '25.5' },
        { us: '7', uk: '6.5', eu: '40', cm: '26' },
      ],
    },
  ]

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Breadcrumb */}
      <nav className='flex items-center gap-1 text-sm text-muted-foreground mb-6'>
        <Link href='/' className='hover:text-foreground transition-colors'>
          <Home className='h-4 w-4' />
        </Link>
        <ChevronRight className='h-4 w-4' />
        <span className='text-foreground font-medium'>Size Guide</span>
      </nav>

      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Size Guide</h1>
          <p className='text-muted-foreground'>
            Find your perfect fit with our comprehensive size charts. Measure your
            foot length in centimeters and match it to the corresponding size.
          </p>
        </div>

        {/* How to Measure */}
        <div className='bg-gray-50 rounded-xl p-6 mb-8'>
          <h2 className='text-lg font-semibold mb-3'>How to Measure Your Feet</h2>
          <ol className='space-y-2 text-sm text-muted-foreground'>
            <li className='flex gap-3'>
              <span className='flex-shrink-0 w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold'>
                1
              </span>
              <span>
                <strong>Stand on a piece of paper</strong> — Place a sheet of paper
                on a hard floor. Stand on it with your heel against a wall.
              </span>
            </li>
            <li className='flex gap-3'>
              <span className='flex-shrink-0 w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold'>
                2
              </span>
              <span>
                <strong>Trace your foot</strong> — Have someone trace the outline of
                your foot while you stand still. Keep the pencil perpendicular to the
                paper.
              </span>
            </li>
            <li className='flex gap-3'>
              <span className='flex-shrink-0 w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold'>
                3
              </span>
              <span>
                <strong>Measure</strong> — Measure the length from the wall to the
                tip of your longest toe in centimeters.
              </span>
            </li>
            <li className='flex gap-3'>
              <span className='flex-shrink-0 w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold'>
                4
              </span>
              <span>
                <strong>Match to the chart</strong> — Find your foot length on the
                chart below to determine your size.
              </span>
            </li>
          </ol>
        </div>

        {/* Size Charts */}
        <div className='space-y-8'>
          {sizeCharts.map(({ gender, sizes }) => (
            <div key={gender}>
              <h2 className='text-lg font-semibold mb-3'>{gender} Sizes</h2>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b'>
                      <th className='text-left py-2 px-3 font-semibold'>US</th>
                      <th className='text-left py-2 px-3 font-semibold'>UK</th>
                      <th className='text-left py-2 px-3 font-semibold'>EU</th>
                      <th className='text-left py-2 px-3 font-semibold'>CM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map((row) => (
                      <tr key={row.us} className='border-b hover:bg-gray-50'>
                        <td className='py-2 px-3'>{row.us}</td>
                        <td className='py-2 px-3'>{row.uk}</td>
                        <td className='py-2 px-3'>{row.eu}</td>
                        <td className='py-2 px-3'>{row.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className='mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6'>
          <h2 className='text-lg font-semibold mb-3 text-amber-800'>
            Fit Tips
          </h2>
          <ul className='space-y-2 text-sm text-amber-700'>
            <li>• If you\'re between sizes, we recommend going up half a size.</li>
            <li>• Feet tend to swell during the day — try shoes on in the afternoon.</li>
            <li>• Brand sizing can vary — always check the specific size chart on the product page.</li>
            <li>• Our shoes are designed with some break-in flexibility. If it feels snug at first, give it a few wears.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
