export default {
  randomString: (length, pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') => {
    return Array(length).join().split(',').map(() => pool.charAt(Math.floor(Math.random() * pool.length))).join('');
  }
}
