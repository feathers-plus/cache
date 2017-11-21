# @feathers-plus/cache

[![Dependency Status](https://img.shields.io/david/feathers-plus/cache.svg?style=flat-square)](https://david-dm.org/eddyystop/dataloader-cache-lru)
[![Download Status](https://img.shields.io/npm/dm/feathers-plus/cache.svg?style=flat-square)](https://www.npmjs.com/package/dataloader-cache-lru)

> LRU (least recently used) cache for @feathers-plus/batch-loader and @feathers-plus/feathers-hooks-common cache hook.

## Installation

```
npm install @feathers-plus/cache --save
```

## Documentation

@feathers-plus/batch-loader, by default, uses the standard Map which simply grows until the BatchLoader is released.
The default is appropriate when requests to your application are short-lived.

Longer lived BatchLoaders, such as ones which persist between @feathers-plus/feathers-hooks-common fastJoin hook queries, will build up memory
pressure unless the size of the cache is controlled.
Furthermore, if records mutate, their cache entries must be removed.

This BatchLoader-compatible cache implements a LRU (least recently used) cache, it deletes the
least recently used items when the cache size is exceeded.
 
## Complete Example

```js
const BatchLoader = require('@feathers-plus/batch-loader');
const feathersCache = require('@feathers-plus/cache');

const cacheMap = feathersCache({ max: 3 }); // see options in isaacs/node-lru-cache
const batchLoader = new BatchLoader(batchLoadFn, { cacheMap });

Promise.all(
  ['a', 'b', 'c', 'd', 'e'].map(key => batchLoader.load(key))
)
  .then(data => {
    console.log(data); // [{ key: 'a', data: 'a' }, ..., { key: 'e', data: 'e' }]
    console.log(cacheMap.keys().sort()); // ['c', 'd', 'e']
  });

// record with key 'd' has been mutated
batchLoader.clear('d');
console.log(cacheMap.keys().sort()); // ['c', 'e']

function batchLoadFn (keys) {
  return Promise.all(
    keys.map(key => ({ key, data: key }))
  );
}
```

## License

Copyright (c) 2017

Licensed under the [MIT license](LICENSE).
