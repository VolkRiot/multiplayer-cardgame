module.exports = function(sequelize, DataTypes){
  return sequelize.define("Meme", {
    name: {
      type: DataTypes.STRING,
      validate: {
        len:[1]
      }
    },
    url: {
      type: DataTypes.STRING,
      validate: {
        len: [1]
      },
      allowNull: false
    },
    imgFlipID: {
      type: DataTypes.STRING,
      validate: {
        len: [2]
      },
      allowNull: false
  }
  },{
    timestamps: false
  });
};