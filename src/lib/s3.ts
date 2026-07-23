import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin",
  },
});

const BUCKET = process.env.S3_BUCKET || "evidencia";

export async function uploadFile(key: string, buffer: Buffer, mimeType: string) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });
    return await s3Client.send(command);
  } catch (error) {
    console.error("Error al subir archivo a S3:", error);
    throw new Error("No se pudo subir el archivo al almacenamiento");
  }
}

export async function getFile(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });
    return await s3Client.send(command);
  } catch (error) {
    console.error("Error al obtener archivo de S3:", error);
    throw new Error("No se pudo obtener el archivo del almacenamiento");
  }
}
