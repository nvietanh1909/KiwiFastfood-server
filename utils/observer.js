/**
 * Subject class trong Observer Pattern
 * Quản lý và thông báo cho các Observer
 */
class Subject {
  constructor() {
    this.observers = [];
  }

  /**
   * Đăng ký một observer
   * @param {Observer} observer - Observer cần đăng ký
   */
  attach(observer) {
    const isExist = this.observers.includes(observer);
    if (isExist) {
      return console.log('Observer đã được đăng ký');
    }
    this.observers.push(observer);
  }

  /**
   * Hủy đăng ký một observer
   * @param {Observer} observer - Observer cần hủy đăng ký
   */
  detach(observer) {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      return console.log('Observer không tồn tại');
    }
    this.observers.splice(observerIndex, 1);
  }

  /**
   * Thông báo cho tất cả các observer
   * @param {Object} data - Dữ liệu thông báo
   */
  notify(data) {
    for (const observer of this.observers) {
      observer.update(data);
    }
  }
}

/**
 * Lớp cơ sở cho các Observer
 */
class Observer {
  /**
   * Cập nhật khi nhận được thông báo từ Subject
   * @param {Object} data - Dữ liệu thông báo
   */
  update(data) {
    throw new Error('Phương thức update phải được triển khai bởi lớp con');
  }
}

/**
 * Observer cho xử lý thông báo đơn hàng
 */
class OrderNotificationObserver extends Observer {
  /**
   * @param {Function} callback - Callback function khi nhận thông báo
   */
  constructor(callback) {
    super();
    this.callback = callback;
  }

  /**
   * Xử lý thông báo
   * @param {Object} data - Dữ liệu thông báo
   */
  update(data) {
    this.callback(data);
  }
}

/**
 * Observer cho ghi log hệ thống
 */
class LoggingObserver extends Observer {
  update(data) {
    console.log(`[LOG] ${new Date().toISOString()} - Event: ${data.event}`, data);
  }
}

/**
 * Event Manager để tạo và quản lý các event
 * Triển khai cả Observer Pattern và Singleton Pattern
 */
class EventManager {
  constructor() {
    if (EventManager.instance) {
      return EventManager.instance;
    }

    this.subjects = {};
    EventManager.instance = this;
  }

  /**
   * Tạo một event mới
   * @param {string} eventName - Tên event
   */
  createEvent(eventName) {
    if (!this.subjects[eventName]) {
      this.subjects[eventName] = new Subject();
    }
    return this.subjects[eventName];
  }

  /**
   * Lấy một event theo tên
   * @param {string} eventName - Tên event
   * @returns {Subject} Subject của event
   */
  getEvent(eventName) {
    if (!this.subjects[eventName]) {
      this.createEvent(eventName);
    }
    return this.subjects[eventName];
  }

  /**
   * Đăng ký một observer cho một event
   * @param {string} eventName - Tên event
   * @param {Observer} observer - Observer cần đăng ký
   */
  subscribe(eventName, observer) {
    const event = this.getEvent(eventName);
    event.attach(observer);
  }

  /**
   * Hủy đăng ký một observer từ một event
   * @param {string} eventName - Tên event
   * @param {Observer} observer - Observer cần hủy đăng ký
   */
  unsubscribe(eventName, observer) {
    const event = this.getEvent(eventName);
    event.detach(observer);
  }

  /**
   * Thông báo cho tất cả các observer của một event
   * @param {string} eventName - Tên event
   * @param {Object} data - Dữ liệu thông báo
   */
  notify(eventName, data) {
    const event = this.getEvent(eventName);
    event.notify({
      ...data,
      event: eventName,
      timestamp: new Date().toISOString()
    });
  }
}

// Tạo và export EventManager singleton instance
const eventManager = new EventManager();

module.exports = {
  EventManager,
  Observer,
  OrderNotificationObserver,
  LoggingObserver,
  eventManager
}; 