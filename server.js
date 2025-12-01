
const app = require('./src/app');
const chatserver= require('./src/chat')
const { connectDB, closeDB } = require('./src/config/db');

const PORT = 3000;
const chatPORT = 4000;

async function startServer() {
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(` Server running on port ${PORT}`);
    });
     chatserver.listen(chatPORT, '0.0.0.0' ,() =>{
        console.log(` chatServer running on port ${chatPORT}`);
    })

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
