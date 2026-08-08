import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import satori from 'satori'
import { resolveColor } from './colors'

const __dirname = dirname(fileURLToPath(import.meta.url))

const interRegular = readFileSync(resolve(__dirname, 'assets/Inter-Regular.woff'))
const interSemiBold = readFileSync(resolve(__dirname, 'assets/Inter-SemiBold.woff'))
const interBold = readFileSync(resolve(__dirname, 'assets/Inter-Bold.woff'))

export interface ThumbnailOptions {
  headline?: string
  title: string
  description?: string
  primaryColor?: string
}

export async function generateThumbnail(options: ThumbnailOptions): Promise<string> {
  const { headline, title, description } = options
  const primaryColor = resolveColor(options.primaryColor)

  return satori(
    <div tw="w-full h-full flex flex-col justify-center bg-[#18181b]">
      <svg
        tw="absolute right-0 top-0"
        width="629"
        height="593"
        viewBox="0 0 629 593"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_f_199_94966)">
          <path
            d="M628.5 -578L639.334 -94.4223L806.598 -548.281L659.827 -87.387L965.396 -462.344L676.925 -74.0787L1087.69 -329.501L688.776 -55.9396L1160.22 -164.149L694.095 -34.9354L1175.13 15.7948L692.306 -13.3422L1130.8 190.83L683.602 6.50012L1032.04 341.989L668.927 22.4412L889.557 452.891L649.872 32.7537L718.78 511.519L628.5 36.32L538.22 511.519L607.128 32.7537L367.443 452.891L588.073 22.4412L224.955 341.989L573.398 6.50012L126.198 190.83L564.694 -13.3422L81.8734 15.7948L562.905 -34.9354L96.7839 -164.149L568.224 -55.9396L169.314 -329.501L580.075 -74.0787L291.604 -462.344L597.173 -87.387L450.402 -548.281L617.666 -94.4223L628.5 -578Z"
            fill={primaryColor}
          />
        </g>
        <defs>
          <filter
            id="filter0_f_199_94966"
            x="0.873535"
            y="-659"
            width="1255.25"
            height="1251.52"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="80" result="effect1_foregroundBlur_199_94966" />
          </filter>
        </defs>
      </svg>

      <div tw="flex flex-col w-[800px] pl-[100px]">
        <div tw="flex items-center mb-6">
          <svg
            width="48"
            height="48"
            viewBox="0 0 9 9"
            shape-rendering="crispEdges"
          >
            <g fill="#a83e08">
              <rect x="2" y="1" width="1" height="1" />
              <rect x="6" y="1" width="1" height="1" />
              <rect x="1" y="2" width="1" height="1" />
              <rect x="2" y="2" width="1" height="1" />
              <rect x="6" y="2" width="1" height="1" />
              <rect x="7" y="2" width="1" height="1" />
              <rect x="1" y="3" width="1" height="1" />
              <rect x="7" y="3" width="1" height="1" />
              <rect x="1" y="4" width="1" height="1" />
              <rect x="7" y="4" width="1" height="1" />
              <rect x="0" y="7" width="1" height="1" />
              <rect x="8" y="7" width="1" height="1" />
            </g>
            <g fill="#f2670f">
              <rect x="2" y="4" width="1" height="1" />
              <rect x="3" y="4" width="1" height="1" />
              <rect x="4" y="4" width="1" height="1" />
              <rect x="5" y="4" width="1" height="1" />
              <rect x="6" y="4" width="1" height="1" />
              <rect x="0" y="5" width="9" height="1" />
              <rect x="1" y="6" width="7" height="1" />
              <rect x="2" y="7" width="5" height="1" />
            </g>
            <g fill="#1c1917">
              <rect x="3" y="3" width="1" height="1" />
              <rect x="5" y="3" width="1" height="1" />
            </g>
          </svg>
          {headline && (
            <p tw="uppercase text-[24px] ml-4" style={{ color: primaryColor, fontWeight: 600 }}>
              {headline}
            </p>
          )}
        </div>
        <h1
          tw="w-[800px] m-0 text-[75px] font-bold mb-4"
          style={{
            display: 'block',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: 'white',
            fontWeight: 700,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            tw="text-[32px] text-[#E4E4E7] leading-tight"
            style={{
              display: 'block',
              WebkitLineClamp: 3,
              textOverflow: 'ellipsis',
              opacity: 0.5,
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>,
    {
      width: 960,
      height: 540,
      fonts: [
        {
          name: 'Inter',
          data: interRegular,
          weight: 400,
        },
        {
          name: 'Inter',
          data: interSemiBold,
          weight: 600,
        },
        {
          name: 'Inter',
          data: interBold,
          weight: 700,
        },
      ],
    },
  )
}
