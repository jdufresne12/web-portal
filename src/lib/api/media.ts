import { MediaDTO } from '@/src/app/types/form-types';

/**
 * Uploads a file to S3 and database via the server API
 */
export async function uploadMedia(media: MediaDTO, type: string, id: string) {
    if (!media.file) throw new Error('File is required');

    const file = media.file;
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const key = type === 'products' ? `${type}/${fileName}` : `${type}/${id}/${fileName}`;

    const buffer = await file.arrayBuffer();
    const contentType = file.type;

    let result;
    try {
        // Upload to s3
        const s3Result = await fetch('/api/media/s3', {
            method: 'POST',
            body: JSON.stringify({
                fileBuffer: Array.from(new Uint8Array(buffer)),
                key,
                contentType,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        result = await s3Result.json();
        if (!s3Result.ok) throw new Error(result.error || 'Upload failed (s3)');
        else {
            delete media.previewUrl
            delete media.file
            media.url = result.fileUrl
        }

        // Upload to database (media table)
        const dbResult = await fetch("/api/media/db", {
            method: "PUT",
            body: JSON.stringify(media),
            headers: {
                'Content-Type': 'application/json'
            },
        })
        if (!dbResult.ok) throw new Error('Upload failed (db)');

        // REMOVE WHEN api/medium IS FIXED (tag issue)
        const dbResult2 = await fetch("/api/media/db", {
            method: "PUT",
            body: JSON.stringify(media),
            headers: {
                'Content-Type': 'application/json'
            },
        })
        if (!dbResult2.ok) throw new Error('Upload failed (db)');

    } catch (error) {
        console.error(error)
    }

    return result
}

/**
 * Deletes a file from S3 and database via the server API
 */
export async function deleteMedia(media: MediaDTO, type: string, id: string, cascadeDelete: boolean = false) {
    if (!media.url) throw new Error('URL is required');

    const fileName = media.url.split('/').pop();
    if (!fileName) throw new Error('Could not parse filename from URL');

    const key = type === 'products' ? `${type}/${fileName}` : `${type}/${id}/${fileName}`;
    const mediaId = media.id;

    try {
        // Delete from s3
        const s3Result = await fetch('/api/media/s3', {
            method: 'DELETE',
            body: JSON.stringify({ key, mediaId }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!s3Result.ok) throw new Error('Delete failed (s3)');

        if (!cascadeDelete) {
            // Delete from database (media table)
            const dbResult = await fetch(`/api/media/db/${mediaId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!dbResult.ok) throw new Error('Delete failed (db)');
        }
    } catch (error) {
        console.error(error);
    }
}