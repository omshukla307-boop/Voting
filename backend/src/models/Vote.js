// Beginner-friendly Vote model (Sequelize)
// Fields:
// - voterId: id of the voter (reference to User)
// - candidateId: id of the chosen candidate
// - hash: optional receipt / hash for verification
//
// This simple model stores a vote record for demonstration. Real systems
// require strong privacy and cryptographic guarantees.

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Vote = sequelize.define('Vote', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    voterId: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    candidateId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    electionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    voteHash: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    walletAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    timeStamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['voterId', 'electionId'],
        }
    ]
});

module.exports = Vote;
