module.exports = function(sequelize, DataTypes){
  return sequelize.define('Message', {
    message: {
      type: DataTypes.STRING,
      validate: {
        len: [1]
      }
    }
  },{
    classMethods: {
      associate: function (models) {
        this.belongsTo(models.User, {
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });

};
