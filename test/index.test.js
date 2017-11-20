
const { assert } = require('chai');
const DataLoader = require('dataloader');
const dataLoaderCacheLru = require('../lib');

function batchLoadFn (keys) {
  return Promise.all(
    keys.map(key => ({ key, data: key }))
  );
}

describe('index.test.js', () => {
  it('basic functionality', () => {
    const cacheMap = dataLoaderCacheLru();

    cacheMap.set('a', 'aa');
    assert.equal(cacheMap.get('a'), 'aa', 'bad get after set');

    cacheMap.delete('a');
    assert.equal(cacheMap.get('a'), undefined, 'bad get after delete');

    cacheMap.set('a', 'aa');
    cacheMap.clear();
    assert.equal(cacheMap.get('a'), undefined, 'bad get after clear');
  });

  it('works with DataLoader', done => {
    const cacheMap = dataLoaderCacheLru();
    const dataloader = new DataLoader(batchLoadFn, { cacheMap });

    dataloader.load('b')
      .then(data => {
        assert.deepEqual(data, { key: 'b', data: 'b' }, 'bad return dataloader value');
        assert.deepEqual(cacheMap.keys(), ['b'], 'bad cached keys');
        done();
      })
      .catch(catcher(done));
  });

  it('DataLoader caches multiple keys', done => {
    const cacheMap = dataLoaderCacheLru();
    const dataloader = new DataLoader(batchLoadFn, { cacheMap });
    const testKeys = ['a', 'b', 'c', 'd', 'e'];

    Promise.all(
      testKeys.map(key => dataloader.load(key))
    )
      .then(data => {
        assert.deepEqual(data, testKeys.map(key => ({ key, data: key })), 'bad return dataloader value');
        assert.deepEqual(cacheMap.keys().sort(), testKeys, 'bad cached keys');
        done();
      })
      .catch(catcher(done));
  });

  it('DataLoader clears keys', done => {
    const cacheMap = dataLoaderCacheLru();
    const dataloader = new DataLoader(batchLoadFn, { cacheMap });
    const testKeys = ['a', 'b', 'c', 'd', 'e'];

    Promise.all(
      testKeys.map(key => dataloader.load(key))
    )
      .then(data => {
        assert.deepEqual(data, testKeys.map(key => ({ key, data: key })), 'bad return dataloader value');
        assert.deepEqual(cacheMap.keys().sort(), testKeys, 'bad cached keys');

        dataloader.clear('a');
        dataloader.clear('c');
        assert.deepEqual(cacheMap.keys().sort(), ['b', 'd', 'e'], 'bad cached keys');
        done();
      })
      .catch(catcher(done));
  });

  it('Cache drops LRU items', done => {
    const max = 3;
    const cacheMap = dataLoaderCacheLru({ max });
    const dataloader = new DataLoader(batchLoadFn, { cacheMap });
    const testKeys = ['a', 'b', 'c', 'd', 'e'];

    Promise.all(
      testKeys.map(key => dataloader.load(key))
    )
      .then(data => {
        assert.deepEqual(data, testKeys.map(key => ({ key, data: key })), 'bad return dataloader value');
        assert.deepEqual(cacheMap.keys().sort(), testKeys.slice(-max), 'bad cached keys');
        done();
      })
      .catch(catcher(done));
  });
});

function catcher (done) {
  return err => {
    assert(false, err.message);
    done();
  };
}
