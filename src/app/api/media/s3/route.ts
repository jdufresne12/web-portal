import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: process.env.NEXT_PUBLIC_S3_REGION!,
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_KEY!,
    },
});

export async function POST(request: NextRequest) {
    try {
        const { fileBuffer, key, contentType } = await request.json();

        if (!fileBuffer || !key || !contentType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const buffer = Buffer.from(fileBuffer);

        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        };

        await s3Client.send(new PutObjectCommand(params));

        const fileUrl = `${process.env.NEXT_PUBLIC_S3_ENDPOINT}/${key}`;

        return NextResponse.json({
            success: true,
            fileUrl,
            key
        });
    } catch (error: any) {
        console.error('Error uploading to S3:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to upload file' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { key } = await request.json();

        if (!key) {
            return NextResponse.json({ error: 'Missing key' }, { status: 400 });
        }

        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!,
            Key: key,
        };

        await s3Client.send(new DeleteObjectCommand(params));

        return NextResponse.json({
            success: true,
            message: 'File deleted successfully from S3'
        });
    } catch (error: any) {
        console.error('Error deleting from S3:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete file' },
            { status: 500 }
        );
    }
}