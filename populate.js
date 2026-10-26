require('dotenv').config();

const connectDB = require('./db/connect');
const User = require('./model/user');

// Demo accounts for local testing. Change these before using on a real database.
const seedUsers = [
  {
    name: 'Mark-luke',
    email: 'mark-luke@example.com',
    password: 'Password123',
    balance: 3000
  },
  {
    name: 'Leon-Serah',
    email: 'leon-serah@example.com',
    password: 'Password123',
    balance: 4000
  },
  {
    name: 'Adeloye-Samuel',
    email: 'adeloye-samuel@example.com',
    password: 'Password123',
    balance: 5000
  },
  {
    name: 'SEMS-Farida',
    email: 'sems-farida@example.com',
    password: 'Password123',
    balance: 6000
  }
];

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);

    for (const seedUser of seedUsers) {
      const existingUser = await User.findOne({ email: seedUser.email });

      if (existingUser) {
        console.log(`Skipped ${seedUser.email} (already exists)`);
        continue;
      }

      // Use create() (not insertMany) so the pre-save hook hashes the password
      // and generates the account number.
      await User.create(seedUser);
      console.log(`Created ${seedUser.email}`);
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
