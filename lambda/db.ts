
import * as AWS from 'aws-sdk'
AWS.config.update({
    region: 'eu-central-1'
})
const documentClient = new AWS.DynamoDB.DocumentClient()
export function addFavourite(product: Product): AWS.Request<AWS.DynamoDB.DocumentClient.PutItemOutput, AWS.AWSError> {
    const params = {
        Item: product,
        TableName: 'Favourite'
    }
    return documentClient.put(params)
}

export function getFavourites(): AWS.Request<AWS.DynamoDB.DocumentClient.ScanOutput, AWS.AWSError> {
    return documentClient.scan({ TableName: 'Favourite' })
}

export function deleteFavourite(id: string): AWS.Request<AWS.DynamoDB.DocumentClient.DeleteItemOutput, AWS.AWSError> {
    const params = {
        Key: {
            id
        },
        TableName: 'Favourite'
    }
    return documentClient.delete(params)
}