const DatabaseManager = require('../DatabaseManager');
const { Sequelize, DataTypes } = require('sequelize');

class PostgresDBManager extends DatabaseManager {
  constructor() {
    super();
    this.sequelize = new Sequelize(
      process.env.PGDATABASE || 'playlister',
      process.env.PGUSER     || 'postgres',
      process.env.PGPASSWORD || '',
      {
        host: process.env.PGHOST || '127.0.0.1',
        port: process.env.PGPORT || 5432,
        dialect: 'postgres',
        logging: false,
      }
    );

    this.User = this.sequelize.define('User', {
      email:        { type: DataTypes.STRING, primaryKey: true },
      firstName:    { type: DataTypes.STRING, allowNull: false },
      lastName:     { type: DataTypes.STRING, allowNull: false },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
    }, { tableName:'users', timestamps:false });

    this.Playlist = this.sequelize.define('Playlist', {
      id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name:       { type: DataTypes.STRING, allowNull:false },
      ownerEmail: { type: DataTypes.STRING, allowNull:false },
      songs:      { type: DataTypes.JSONB, allowNull:false, defaultValue: [] },
    }, { tableName:'playlists', timestamps:false });

    this.User.hasMany(this.Playlist, { foreignKey:'ownerEmail', sourceKey:'email' });
    this.Playlist.belongsTo(this.User, { foreignKey:'ownerEmail', targetKey:'email' });
  }

  async connect()    { await this.sequelize.authenticate(); await this.sequelize.sync(); }
  async disconnect() { await this.sequelize.close(); }

  // users
  async getUserByEmail(email) { return this.User.findByPk(email, { raw:true }); }
  async createUser(userData)  { const u = await this.User.create(userData); return u.get({ plain:true }); }

  // playlists
  async createPlaylist(data)            { const p = await this.Playlist.create(data); return p.get({ plain:true }); }
  async getPlaylistById(id)             { return this.Playlist.findByPk(id, { raw:true }); }
  async getPlaylistPairs()              { return this.Playlist.findAll({ attributes:['id','name','ownerEmail'], raw:true }); }
  async updatePlaylistById(id, updates) { await this.Playlist.update(updates, { where:{ id } }); return this.getPlaylistById(id); }
  async deletePlaylistById(id)          { const p = await this.getPlaylistById(id); await this.Playlist.destroy({ where:{ id } }); return p; }
}

module.exports = new PostgresDBManager();
