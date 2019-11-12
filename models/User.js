module.exports = {
    "id": {
        type: "uuid",
        primary: true
    },
    "firstname": {
        type: "string",
        required: true,
    },
    "lastname": {
        type: "string",
        required: true,
    },
    "birthdate": {
        type: "string",
        required: true,
    },
    "phone": {
        type: "string",
        required: true,
    },
    "email": {
        type: 'string',
        unique: true,
        required: true,
        email: true,
        required: true
    },
    "profileImageUrl": {
        type: "string",
        uri: {
            scheme: ["http", "https"]
        }
    },

    follows: {
        type: 'relationships',
        target: 'User',
        relationship: 'FOLLOW',
        direction: 'out',
        eager: false
    },
    isSenior: {
        type: 'relationships',
        target: 'User',
        relationship: 'SENIOR',
        direction: 'out',
        eager: false
    },
    isJunior: {
        type: 'relationships',
        target: 'User',
        relationship: 'JUNIOR',
        direction: 'out',
        eager: false
    },
};