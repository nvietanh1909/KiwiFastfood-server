  /**
   * Dependency Injection Container
   * Quản lý việc khởi tạo và inject các dependencies
   */
  class Container {
    constructor() {
      this.dependencies = {};
    }

    /**
     * Đăng ký một dependency
     * @param {string} name - Tên của dependency
     * @param {Function} factory - Factory function để tạo instance
     */
    register(name, factory) {
      this.dependencies[name] = {
        factory,
        instance: null
      };
    }

    /**
     * Lấy instance của một dependency
     * @param {string} name - Tên của dependency
     * @returns {Object} Instance của dependency
     */
    resolve(name) {
      const dependency = this.dependencies[name];
      
      if (!dependency) {z
        throw new Error(`Dependency ${name} không được đăng ký`);
      }

      if (!dependency.instance) {
        dependency.instance = dependency.factory(this);
      }

      return dependency.instance;
    }
  }

  // Khởi tạo container
  const container = new Container();

  // Đăng ký các repositories
  const UserRepository = require('../repositories/UserRepository');
  const ProductRepository = require('../repositories/ProductRepository');
  const OrderRepository = require('../repositories/OrderRepository');
  const CategoryRepository = require('../repositories/CategoryRepository');
  const CartRepository = require('../repositories/CartRepository');

  container.register('userRepository', () => new UserRepository());
  container.register('productRepository', () => new ProductRepository());
  container.register('orderRepository', () => new OrderRepository());
  container.register('categoryRepository', () => new CategoryRepository());
  container.register('cartRepository', () => new CartRepository());

  // Đăng ký các services với dependency injection
  const UserService = require('../services/UserService');
  const ProductService = require('../services/ProductService');
  const OrderService = require('../services/OrderService');
  const CategoryService = require('../services/CategoryService');
  const CartService = require('../services/CartService');
  const OrderFacade = require('../services/OrderFacade');

  container.register('userService', (c) => new UserService(c.resolve('userRepository')));
  container.register('productService', (c) => new ProductService(c.resolve('productRepository'), c.resolve('categoryRepository')));
  container.register('orderService', (c) => new OrderService(c.resolve('orderRepository'), c.resolve('productRepository'), c.resolve('userRepository')));
  container.register('categoryService', (c) => new CategoryService(c.resolve('categoryRepository')));
  container.register('cartService', (c) => new CartService(c.resolve('cartRepository'), c.resolve('productRepository')));

  // Đăng ký OrderFacade với OrderService
  container.register('orderFacade', (c) => new OrderFacade(c.resolve('orderService')));

  module.exports = container; 