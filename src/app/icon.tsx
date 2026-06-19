import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div style={{
      width: 512, height: 512,
      background: '#F8F7F4',
      borderRadius: 112,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 260,
      color: '#9333ea',
      fontWeight: 700,
    }}>
      図
    </div>,
    { width: 512, height: 512 }
  )
}
