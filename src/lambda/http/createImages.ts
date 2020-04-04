import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support';
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';

const docClient = new AWS.DynamoDB.DocumentClient();
const imagesTable = process.env.IMAGES_TABLE;
const groupsTable = process.env.GROUPS_TABLE;
const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

const s3 = new AWS.S3({
    signatureVersion: 'v4'
})


export const handler: APIGatewayProxyHandler = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Posting new image data");
    const imageId = uuid.v4();
    const groupId = event.pathParameters.groupId;
    const parsedBody = JSON.parse(event.body);
    const validGroup = await groupExists(groupId);

    console.log("Is a valid group??? ", validGroup);

    if(!validGroup){
        return{
            statusCode: 404,
            headers:{
                'Access-Control-Allow-Origin':'*'
            },
            body: JSON.stringify({error: 'Group not found'})
        }
    }
    
    const newImage = {
        imageId,
        groupId,
        timestamp: new Date().toString(),
        ...parsedBody,
        imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
    }

    console.log("New image object: ", newImage);

    await docClient.put({
        TableName: imagesTable,
        Item: newImage
    }).promise();

    const url = getUploadUrl(imageId);

    return {
        statusCode: 201,
        headers:{
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            newImage,
            uploadUrl:url,

        })
    }
}

async function groupExists(groupId: string) {
    const result = await docClient.get({
        TableName: groupsTable,
        Key: {
            id: groupId
        }
    }).promise();

    console.log("Get group: ", result);

    if(Object.keys(result).length == 0) {return false;}
    return !!result.Item;
}


function getUploadUrl(imageId: string){
    return s3.getSignedUrl('putObject', {
       Bucket: bucketName,
       Key: imageId,
       Expires: parseInt(urlExpiration) 
    });
}