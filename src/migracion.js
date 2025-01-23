const mongoose = require('mongoose');
const User = require('./models/user'); 

async function migrarNuevoAtributo() {
    try {
        const users = await User.find();
        for (const use of users) {
            use.status = 'Al día';
            await use.save();
            console.log(users);
        }

    } catch (error) {
        console.error('Error durante la migración:', error);
    } finally {
        mongoose.disconnect();
    }
}

migrarNuevoAtributo();
