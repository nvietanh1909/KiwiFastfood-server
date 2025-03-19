/**
 * Base Repository class implementing the Template Method Pattern
 * Defines the skeleton of operations common to all repositories
 */
class BaseRepository {
  /**
   * Constructor
   * @param {mongoose.Model} model - Mongoose model
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Find an entity by ID
   * @param {string} id - Entity ID
   * @returns {Promise<Object>} Found entity
   */
  async findById(id) {
    return await this.model.findById(id);
  }

  /**
   * Create a new entity
   * @param {Object} data - Entity data
   * @returns {Promise<Object>} Created entity
   */
  async create(data) {
    return await this.model.create(data);
  }

  /**
   * Update an entity
   * @param {string} id - Entity ID
   * @param {Object} data - Data to update
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated entity
   */
  async update(id, data, options = { new: true, runValidators: true }) {
    return await this.model.findByIdAndUpdate(id, data, options);
  }

  /**
   * Delete an entity
   * @param {string} id - Entity ID
   * @returns {Promise<Object>} Deleted entity
   */
  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  /**
   * Get all entities
   * @param {Object} filter - Filter criteria
   * @param {number} limit - Number of entities to return
   * @param {number} skip - Number of entities to skip
   * @param {Object} sort - Sort criteria
   * @returns {Promise<Object[]>} Array of entities
   */
  async getAll(filter = {}, limit = 10, skip = 0, sort = { createdAt: -1 }) {
    return await this.model.find(filter)
      .limit(limit)
      .skip(skip)
      .sort(sort);
  }

  /**
   * Count total entities
   * @param {Object} filter - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }

  /**
   * Find an entity by specific field
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Object>} Found entity
   */
  async findOne(filter) {
    return await this.model.findOne(filter);
  }

  /**
   * Find multiple entities by filter
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Object[]>} Found entities
   */
  async find(filter) {
    return await this.model.find(filter);
  }

  /**
   * Hook to execute before create operation
   * To be overridden by child classes if needed
   * @param {Object} data - Entity data
   * @returns {Object} Processed entity data
   */
  beforeCreate(data) {
    return data;
  }

  /**
   * Hook to execute after create operation
   * To be overridden by child classes if needed
   * @param {Object} entity - Created entity
   * @returns {Object} Processed entity
   */
  afterCreate(entity) {
    return entity;
  }

  /**
   * Hook to execute before update operation
   * To be overridden by child classes if needed
   * @param {string} id - Entity ID
   * @param {Object} data - Data to update
   * @returns {Object} Processed update data
   */
  beforeUpdate(id, data) {
    return data;
  }

  /**
   * Hook to execute after update operation
   * To be overridden by child classes if needed
   * @param {Object} entity - Updated entity
   * @returns {Object} Processed entity
   */
  afterUpdate(entity) {
    return entity;
  }
}

module.exports = BaseRepository; 