import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";
import {
  processAction,
  supportedActionEvents,
} from "./logical_services/checkActionEvent";

const client = new PrismaClient();

const TOPIC_NAME = "zap-events";
const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

async function main() {
  const consumer = kafka.consumer({ groupId: "main-worker-2" });
  await consumer.connect();
  const producer = kafka.producer();
  await producer.connect();

  await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      });

      if (!message.value?.toString()) {
        return;
      }

      const parsedValue = JSON.parse(message.value?.toString());
      const zapRunId = parsedValue.zapRunId;
      const stage = parsedValue.stage;

      console.log(`Processing zap run ${zapRunId} at stage ${stage}`);

      const zapRunDetails = await client.zapRun.findUnique({
        where: {
          id: zapRunId,
        },
        include: {
          zap: {
            include: {
              actions: {
                include: {
                  type: true,
                },
              },
            },
          },
        },
      });

      const currentAction = zapRunDetails?.zap.actions.find(
        (x) => x.sortingOrder === stage
      );
      if (!currentAction) {
        console.log("Current action not found?");
        return;
      }

      const zapRunMetadata = zapRunDetails?.metadata as Record<string, any>;
      const actionMetadata = currentAction.metadata as any;

      console.log("Current action:", currentAction);
      console.log("ZapRun metadata:", zapRunMetadata);

      // Process the action using our new system
      const actionEvent = actionMetadata.actionEvent as string;
      if (!actionEvent) {
        console.error("No actionEvent specified in action metadata");
        return;
      }

      // Process the action using checkActionEvent.ts
      const result = await processAction(
        actionEvent,
        actionMetadata,
        zapRunId,
        zapRunMetadata
      );
      console.log(`Successfully processed zapRun: ${zapRunId}`);

      // Wait a bit to simulate real work
      await new Promise((r) => setTimeout(r, 500));

      const lastStage = (zapRunDetails?.zap.actions?.length || 1) - 1; // 1
      console.log(lastStage);
      console.log(stage);
      if (lastStage !== stage) {
        console.log("pushing back to the queue");
        await producer.send({
          topic: TOPIC_NAME,
          messages: [
            {
              value: JSON.stringify({
                stage: stage + 1,
                zapRunId,
              }),
            },
          ],
        });
      }

      console.log("processing done");

      await consumer.commitOffsets([
        {
          topic: TOPIC_NAME,
          partition: partition,
          offset: (parseInt(message.offset) + 1).toString(), // 5
        },
      ]);
    },
  });
}

main();
