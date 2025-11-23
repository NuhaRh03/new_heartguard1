import { NextResponse } from 'next/server';
import crypto from 'crypto';

// These must match the values on your ESP32 device
const AES_KEY = Buffer.from('MaCleSecreteAES1'); // 16 bytes for AES-128
const AES_IV = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]); // 16 bytes

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const encryptedDataB64 = body.data;

    if (!encryptedDataB64) {
      return NextResponse.json({ error: 'No encrypted data provided.' }, { status: 400 });
    }
    
    // The ESP32 code sends Base64, but the AES library on Node.js expects a Buffer.
    const encryptedDataBuffer = Buffer.from(encryptedDataB64, 'base64');
    
    // The ESP32's AESLib uses CBC mode with PKCS7 padding.
    const decipher = crypto.createDecipheriv('aes-128-cbc', AES_KEY, AES_IV);
    
    // Disable automatic padding. The ESP32 library seems to handle it.
    decipher.setAutoPadding(true);

    let decrypted = decipher.update(encryptedDataBuffer, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    // The result from the ESP32 is a JSON string, so we parse it.
    // The decryption can sometimes leave null characters (\u0000) at the end, so we trim them.
    const cleanedJsonString = decrypted.replace(/\0/g, '').trim();
    const jsonData = JSON.parse(cleanedJsonString);

    return NextResponse.json(jsonData);
  } catch (error: any) {
    console.error('Decryption error:', error);
    // It's useful to know what data caused the error.
    const requestBody = await request.text().catch(() => "Could not read body");
    console.error('Request body was:', requestBody);
    return NextResponse.json({ error: 'Failed to decrypt data.', details: error.message }, { status: 500 });
  }
}
