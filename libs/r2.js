import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Create an S3 client using AWS SDK v3
export const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    endpoint: process.env.AWS_ENDPOINT,
    region: "auto",
});

// Generate signed URL using AWS SDK v3
export const generateSignedUrl = async (bucket, key) => {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: 'leave/'+key,
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn: 300 }); // URL expires in 5 minutes (300 seconds)
};

export const uploadFileToS3 = async (file, bucketName) => {
    const fileName = new Date().getTime()+ '-' +file.originalname; // Generate a unique file name
    const params = {
        Bucket: bucketName,
        Key: 'leave/'+fileName, // Use the file name as the key
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    try {
        const command = new PutObjectCommand(params);
        const response = await s3Client.send(command);
        
        // Return the URL of the uploaded file
        return {
            fileName: fileName,
        };
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw error;
    }
}