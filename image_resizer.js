const fs = require("node:fs/promises")
const path = require('path');
const sharp = require('sharp');
const sequelize = require("./lib/sequelize");
const { queueName, connectToRabbitMQ, getChannel } = require("./lib/rabbitmq")
const { getPhotoById, updatePhotoById } = require("./models/photo")

async function main() {
  try {
    await sequelize.authenticate();
    await connectToRabbitMQ()
    const channel = getChannel()

    channel.consume(queueName, async msg => {
        if (msg) {
            const id = parseInt(msg.content.toString());
            const photo = await getPhotoById(id);
            console.log("== photo:", photo.path);
            const photoData = await fs.readFile(photo.path);
            const outputPath = './uploads/thumb';
            const absolutePath = path.resolve(outputPath);
        
            try {
                // check if outputPath exists
                await fs.access(outputPath);
            } catch (err) {
                await fs.mkdir(outputPath);
            }
        
            // use sharp to change photo size
            sharp(photoData)
                .resize(100, 100)
                .toFile(`${outputPath}/${photo.filename}`)
                .then(() => {
                  console.log('successfully saved picture');
                })
                .catch(err => {
                  console.error('err:', err);
                });
            const updatedPhotoData = {
                thumbPath: `${absolutePath}/${photo.filename}`
            }
            const result = await updatePhotoById(id, updatedPhotoData)
            console.log(result)

        channel.ack(msg)
      }
    })
  } catch (e) {
    console.error("== Error:", e)
  }
}

main()