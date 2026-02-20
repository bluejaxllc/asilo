import { ImageResponse } from 'next/og'

export const size = {
    width: 180,
    height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 120,
                    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '32px',
                    color: 'white',
                    fontWeight: 900,
                    fontFamily: 'sans-serif',
                    letterSpacing: '-4px',
                }}
            >
                B
            </div>
        ),
        {
            ...size,
        }
    )
}
