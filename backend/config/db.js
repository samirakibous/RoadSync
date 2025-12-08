import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('Connexion à MongoDB...', process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB connecté sur ${conn.connection.host}`);
  } catch (error) {
    console.error('Erreur MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
