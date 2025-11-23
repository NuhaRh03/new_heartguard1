import { NextResponse } from 'next/server';
import crypto from 'crypto';

// The key and IV must match what's on the ESP32 device
const AES_KEY = 'MaCleSecreteAES1';
const AES_IV = Buffer.from([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
const ALGORITHM = 'aes-128-cbc';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const encryptedData = body.data;

    if (!encryptedData || typeof encryptedData !== 'string') {
      return new Response('Encrypted data not provided or in wrong format.', { status: 400 });
    }

    // The data is Base64 encoded, so we need to decode it first
    const encryptedBytes = Buffer.from(encryptedData, 'base64');
    
    // Create the decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, AES_KEY, AES_IV);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedBytes);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // The result is a JSON string, so we parse it
    const decryptedJson = JSON.parse(decrypted.toString());

    return NextResponse.json(decryptedJson);

  } catch (error: any) {
    console.error('Decryption error:', error);
    // It's important to provide a specific error message for debugging
    let errorMessage = 'Failed to decrypt data.';
    if(error.code === 'ERR_OSSL_EVP_BAD_DECRYPT') {
        errorMessage = 'Decryption failed. This is often due to an incorrect key or IV, or corrupted data.';
    } else if (error instanceof SyntaxError) {
        errorMessage = 'Failed to parse decrypted data as JSON. The data might be corrupted.';
    }

    return new Response(errorMessage, { status: 500 });
  }
}
