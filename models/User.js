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
        type: 'relationship',
        target: 'User',
        relationship: 'FOLLOW',
        direction: 'out',
        eager: true
    },
};