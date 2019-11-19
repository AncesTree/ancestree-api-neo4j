module.exports = {
    "id": {
        type: "uuid",
        primary: true,
        unique: true
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
        required: false,
    },
    "phone": {
        type: "string",
        required: false,
    },
    "email": {
        type: 'string',
        unique: true,
        email: true,
        required: true
    },
    "start_year": {
        type: 'string'
    },
    "end_year": {
        type: 'string',
        required: 'true'
    },
    "inscription_date": {
        type: 'string'
    },
    "privacy": {
        type: 'string',
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
