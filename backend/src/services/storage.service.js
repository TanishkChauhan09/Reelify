const ImageKit = require("imagekit");

const imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT
});

async function uploadFile(file,fileName){
    const result = await imagekit.upload({
        file : file, //required , here we will send that file which is the buffer data of the file which we get from multer in the food and in return to this file we gwt a URL of that file which is stored in imagekit and we will store that URL in our database
        fileName : fileName // required
    })
    return result;
}

module.exports = {
    uploadFile
}
