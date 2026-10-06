// Beginner-friendly User model (Sequelize)
// Fields:
// - username: unique name for login
// - password: hashed password (we store hashed values)
// - role: string indicating user role (admin/voter/spectator)
//
// Usage examples for beginners:
//   const User = require('./models/User');
//   await User.create({ username: 'alice', password: 'hashedpw', role: 'voter' });
//   const u = await User.findOne({ where: { username: 'alice' } });

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    voterId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true
    },
    aadharNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    role: {
        type: DataTypes.ENUM('admin', 'voter'),
        allowNull: false,
        defaultValue: 'voter'
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false
    },
    mobileNo: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [6, 255] // Password must be between 6 and 255 characters
        }
    }
}, {
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            user.password = await bcrypt.hash(user.password, 10);
        }
    }
});

// For starters, sync the model when the app boots (creates table in SQLite):
// sequelize.sync() is called in app startup (see README). Remove in production.

module.exports = User;
