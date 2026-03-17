import { EurocampClient } from './eurocamp-client';

async function main(): Promise<void> {
  const client = new EurocampClient({
    baseUrl: process.env.EUROCAMP_BASE_URL,
  });

  const users = await client.listUsers();
  console.log(`Users loaded: ${users.length}`);

  if (users[0]) {
    const user = await client.getUser(users[0].id);
    console.log('First user:', user);
  }

  const parcs = await client.listParcs();
  console.log(`Parcs loaded: ${parcs.length}`);

  const bookings = await client.listBookings();
  console.log(`Bookings loaded: ${bookings.length}`);
}

main().catch((error: unknown) => {
  console.error('Demo failed.');
  console.error(error);
  process.exitCode = 1;
});
