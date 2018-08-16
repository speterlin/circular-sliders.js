// https://github.com/ankane/chartkick.js/blob/master/src/helpers.js according to airbnb javascript guides
function isArray(variable) {
  return Object.prototype.toString.call(variable) === '[object Array]';
}

function isFunction(variable) {
  return variable instanceof Function;
}

function isPlainObject(variable) {
  return !isFunction(variable) && variable instanceof Object;
}

function extend(target, source) {
  const newTarget = target;
  Object.keys(source).forEach((key) => {
    if (isPlainObject(source[key]) || isArray(source[key])) {
      if (isPlainObject(source[key]) && !isPlainObject(newTarget[key])) {
        newTarget[key] = {};
      }
      if (isArray(source[key]) && !isArray(newTarget[key])) {
        newTarget[key] = [];
      }
      newTarget[key] = extend(newTarget[key], source[key]);
    } else if (source[key] !== undefined) {
      newTarget[key] = source[key];
    }
  });
  return newTarget;
}

export default function merge(obj1, obj2) {
  let target = {};
  target = extend(target, obj1);
  target = extend(target, obj2);
  return target;
}

// if add more helper functions
// export { merge };
