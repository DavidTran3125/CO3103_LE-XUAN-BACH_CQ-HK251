// const app = require('./src/app');

// const PORT =  3000;

// app.listen(PORT, () => {
//     console.log('Dang nghe o port', PORT);
// });

const app = require('./src/app');
const { connectDB, closeDB } = require('./src/config/db');

const PORT = 3000;

async function startServer() {
    await connectDB();

    const server = app.listen(PORT, () => {
        console.log(` Server running on port ${PORT}`);
    });

    // ✅ Ctrl + C
    process.on('SIGINT', async () => {
        console.log('\n SIGINT received');
        await closeDB();
        server.close(() => process.exit(0));
    });

    // ✅ kill / docker stop / nodemon
    process.on('SIGTERM', async () => {
        console.log('\n SIGTERM received');
        await closeDB();
        server.close(() => process.exit(0));
    });
}

startServer();
