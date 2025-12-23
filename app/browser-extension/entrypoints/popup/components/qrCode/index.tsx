import QRCodeStyling, { CornerSquareType, DotType, ErrorCorrectionLevel, Options } from 'qr-code-styling';
import { useEffect, useMemo, useRef } from 'react';

interface Props {
  value: string;
  size?: number;
  image?: string;
  imageSize?: number;
  margin?: number;
  backgroundColor?: string;
  borderRadius?: number;
  dotType?: DotType;
  cornerSquareType?: CornerSquareType;
  errorCorrectionLevel?: ErrorCorrectionLevel;
}

export function QrCode({
  value,
  size = 192,
  image,
  margin = 0,
  borderRadius = 0,
  backgroundColor = 'transparent',
  dotType = 'square',
  cornerSquareType = 'square',
  errorCorrectionLevel = 'L',
}: Props) {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  const options: Options = useMemo(() => {
    const color = backgroundColor === 'transparent' ? '#ffffff' : '#000000';
    return {
      type: 'svg',
      width: size,
      height: size,
      data: value,
      image: image,
      margin: margin,
      dotsOptions: {
        type: dotType,
        color: color,
      },
      cornersSquareOptions: {
        type: cornerSquareType,
        color: color,
      },
      cornersDotOptions: {
        color: color,
      },
      backgroundOptions: {
        color: backgroundColor,
      },
      imageOptions: {
        imageSize: 1.5,
        crossOrigin: 'anonymous',
        hideBackgroundDots: true,
      },
      qrOptions: {
        errorCorrectionLevel: errorCorrectionLevel,
      },
    };
  }, [backgroundColor, size, value, image, margin, dotType, cornerSquareType, errorCorrectionLevel]);

  useEffect(() => {
    qrCode.current = new QRCodeStyling(options);
    if (qrRef.current) {
      qrCode.current.append(qrRef.current);
    }
  }, [options]);

  useEffect(() => {
    if (qrCode.current) {
      qrCode.current.update(options);
    }
  }, [options]);

  return (
    <div style={{ width: size, height: size, borderRadius: borderRadius }}>
      <div ref={qrRef} />
    </div>
  );
}
