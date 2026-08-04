"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRISCodeProps {
  amount: number;
  merchantName?: string;
  size?: number;
}

export default function QRISCode({
  amount,
  merchantName = "Q-DISTRO",
  size = 256,
}: QRISCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Format data QRIS (simulasi format EMV QRIS)
    const qrisData = `00020101021230${size}0016COM.DANA.WALLET.ID01189360012345678901230214ID123456789012340303UMI0408123456780508123456780608123456780714QD-${merchantName}0808000000000908${amount.toString().padStart(12, "0")}10${merchantName.length.toString().padStart(2, "0")}${merchantName}1106000012${amount.toString().padStart(10, "0")}530336054${amount.toString().length.toString().padStart(2, "0")}${amount}6304`;
    const hash = crc16(qrisData);
    const fullData = qrisData + hash;

    QRCode.toCanvas(canvasRef.current, fullData, {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    }).catch((err) => {
      console.error("QR generation failed:", err);
    });
  }, [amount, merchantName, size]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-xl"
      style={{ width: size, height: size }}
    />
  );
}

// CRC-16/CCITT-FALSE (required by EMV QRIS spec)
function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
