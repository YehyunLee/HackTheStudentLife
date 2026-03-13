const { DynamoDBClient, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-west-2" });
const docClient = DynamoDBDocumentClient.from(client);

const POSTS_TABLE = "uoft-connect-posts";
const USERS_TABLE = "uoft-connect-users";
const MESSAGES_TABLE = "uoft-connect-messages";

const tableKeyCache = new Map();

async function getKeySchema(tableName) {
  if (tableKeyCache.has(tableName)) {
    return tableKeyCache.get(tableName);
  }

  const describe = await client.send(
    new DescribeTableCommand({ TableName: tableName })
  );

  const keySchema = describe.Table.KeySchema;
  const partitionKey = keySchema.find((k) => k.KeyType === "HASH")?.AttributeName;
  const sortKey = keySchema.find((k) => k.KeyType === "RANGE")?.AttributeName;

  tableKeyCache.set(tableName, { partitionKey, sortKey });
  return { partitionKey, sortKey };
}

async function clearTable(tableName) {
  const { partitionKey, sortKey } = await getKeySchema(tableName);
  if (!partitionKey) {
    throw new Error(`Unable to determine partition key for ${tableName}`);
  }

  try {
    console.log(`\n🗑️  Clearing ${tableName}...`);
    
    const result = await docClient.send(
      new ScanCommand({ TableName: tableName })
    );

    if (!result.Items || result.Items.length === 0) {
      console.log(`   ✓ ${tableName} is already empty`);
      return 0;
    }

    console.log(`   Found ${result.Items.length} items to delete`);
    
    let deleted = 0;
    for (const item of result.Items) {
      const key = { [partitionKey]: item[partitionKey] };

      if (sortKey) {
        if (item[sortKey] === undefined || item[sortKey] === null) {
          console.warn(`   ⚠️  Skipping item missing sort key (${sortKey}):`, item[partitionKey]);
          continue;
        }
        key[sortKey] = item[sortKey];
      }

      if (deleted === 0 && sortKey) {
        console.log(`   Debug - First item keys:`, JSON.stringify(key, null, 2));
        console.log(`   Debug - Full item:`, JSON.stringify(item, null, 2));
      }

      await docClient.send(
        new DeleteCommand({
          TableName: tableName,
          Key: key,
        })
      );
      deleted++;
      
      if (deleted % 10 === 0) {
        process.stdout.write(`\r   Deleted ${deleted}/${result.Items.length} items...`);
      }
    }
    
    console.log(`\r   ✓ Deleted ${deleted} items from ${tableName}`);
    return deleted;
  } catch (error) {
    console.error(`   ✗ Error clearing ${tableName}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log("\n🧹 UofT Connect - Clear All Data\n");
  console.log("==========================================");
  console.log("⚠️  WARNING: This will delete ALL data from:");
  console.log("   - Posts");
  console.log("   - Users");
  console.log("   - Messages/Conversations");
  console.log("==========================================\n");

  try {
    const totalPosts = await clearTable(POSTS_TABLE);
    const totalUsers = await clearTable(USERS_TABLE);
    const totalMessages = await clearTable(MESSAGES_TABLE);

    console.log("\n==========================================");
    console.log("✅ All data cleared successfully!\n");
    console.log("Summary:");
    console.log(`   - ${totalPosts} posts deleted`);
    console.log(`   - ${totalUsers} users deleted`);
    console.log(`   - ${totalMessages} conversations deleted`);
    console.log("\n");
  } catch (error) {
    console.error("\n❌ Clear operation failed:", error);
    process.exit(1);
  }
}

main();
