const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  course: {
    type: DataTypes.STRING,
    allowNull: false
  },
  grade: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 20
    }
  },
  coefficient: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.0
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  exam_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: false
  },
  academic_year: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'grades',
  timestamps: true,
  indexes: [
    {
      fields: ['student_id']
    },
    {
      fields: ['course']
    }
  ]
});

module.exports = Grade;
