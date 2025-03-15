import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const client = new PrismaClient();

const TOPIC_NAME = "zap-events";
const kafka = new Kafka({
    clientId: 'outbox-processor',
    brokers: ['localhost:9092']
})

async function main () {
    
    const consumer = kafka.consumer({
        groupId: 'main-worker-2'
    });

    await consumer.connect();
    
    await consumer.subscribe({
        topic: TOPIC_NAME,
        fromBeginning: true
    })

    await consumer.run({
        autoCommit: false,
        eachMessage: async ({ topic, partition, message}) => {
            console.log({
                partition, 
                offset: message.offset, 
                value: message.value?.toString()
            })

            // substitute for the operation we will be performing
            await new Promise (r => setTimeout(r, 1000));
            console.log("processing done");

            await consumer.commitOffsets([{
                topic: TOPIC_NAME,
                partition: partition,
                offset: (parseInt(message.offset) + 1).toString()
            }])
        }
    })

    
    

    

    
}

main();