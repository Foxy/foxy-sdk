import { createLogger } from '../../core/logger.js';

describe('Core', () => {
  describe('createLogger', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('writes errors through console.error by default', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      createLogger({ tag: 'test' }).error('boom');
      expect(spy).toHaveBeenCalledWith('[test]', 'boom');
    });

    it('suppresses every method at a negative level', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
      const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined);

      const logger = createLogger({ level: -1, tag: 'test' });
      logger.error('a');
      logger.warn('b');
      logger.info('c');
      logger.success('d');
      logger.trace('e');

      expect(error).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
      expect(info).not.toHaveBeenCalled();
      expect(debug).not.toHaveBeenCalled();
    });

    it('suppresses trace but not info at the default level', () => {
      const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
      const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined);

      const logger = createLogger({ tag: 'test' });
      logger.info('shown');
      logger.trace('hidden');

      expect(info).toHaveBeenCalledWith('[test]', 'shown');
      expect(debug).not.toHaveBeenCalled();
    });

    it('writes trace at level 5', () => {
      const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
      createLogger({ level: 5, tag: 'test' }).trace('deep');
      expect(debug).toHaveBeenCalledWith('[test]', 'deep');
    });

    it('routes success through console.info', () => {
      const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
      createLogger({ tag: 'test' }).success('yay');
      expect(info).toHaveBeenCalledWith('[test]', 'yay');
    });

    it('omits the prefix when no tag is given', () => {
      const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
      createLogger({}).info('bare');
      expect(info).toHaveBeenCalledWith('bare');
    });
  });
});
