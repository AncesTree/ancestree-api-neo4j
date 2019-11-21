module.exports = {
    "id": {
        type: "uuid",
        primary: true,
        unique: true
    },
    "title": {
        type: "string",
        required: true,
    },
    "content": {
        type: "string",
        required: true,
    },
    "date": {
        type: "string",
        required: true,
    },
    "link": {
        type: "string",
        required: false
        },

    autor: {
        type: 'relationships',
        target: 'User',
        relationship: 'AUTHORED_BY',
        direction: 'out',
        eager: true,
        'cascade': 'detach'
    },
    
}
