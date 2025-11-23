
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// WARNING: Hardcoding keys is insecure. Use environment variables in production.
const AES_KEY_STRING = 'MaCleSecreteAES1';
const AES_KEY = Buffer.from(AES_KEY_STRING, 'utf8');
const AES_IV = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

function unpadPKCS7(data: Buffer): Buffer {
    const padding = data[data.length - 1];
    if (padding > data.length) {
        // This would be an invalid padding
        return data;
    }
    return data.slice(0, data.length - padding);
}


export async function POST(request: Request) {
  try {
    const { data: encryptedBase64 } = await request.json();

    if (!encryptedBase64 || typeof encryptedBase64 !== 'string') {
      return NextResponse.json({ error: 'Encrypted data not provided or in wrong format' }, { status: 400 });
    }
    
    // 1. Base64 Decode
    const encryptedBytes = Buffer.from(encryptedBase64, 'base64');
    
    // 2. Decrypt AES-128-CBC
    const decipher = crypto.createDecipheriv('aes-128-cbc', AES_KEY, AES_IV);
    decipher.setAutoPadding(false); // We will handle unpadding manually
    let decrypted = decipher.update(encryptedBytes);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    // 3. Remove PKCS7 Padding
    const unpadded = unpadPKCS7(decrypted);

    // 4. Decode to JSON string
    const jsonString = unpadded.toString('utf8');
    
    // 5. Parse JSON
    const jsonData = JSON.parse(jsonString);

    return NextResponse.json(jsonData, { status: 200 });

  } catch (error: any) {
    console.error('Decryption failed:', error);
    let errorMessage = 'An unknown error occurred during decryption.';
    if (error instanceof SyntaxError) {
        errorMessage = 'Failed to parse decrypted data as JSON.';
    } else if (error.message) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Decryption failed', details: errorMessage }, { status: 500 });
  }
}
