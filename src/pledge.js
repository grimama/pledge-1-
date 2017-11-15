'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js ES6-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:


// var executor = function(resolve, reject){
//   resolve();
//   reject();
  // return new $Promise(executor);
//};
var $Promise = function(executor){
  if(!executor) {
    throw new TypeError("no executor function")
  }
  this._state = 'pending',
  this._value = undefined,
  this._handlerGroups = [],
  this._pendingHandlers = [],
  this._pendingHandlersAndErrors = [],
  this._pendingDownStreams = null
  var This = this
  var resolve = function (datastring){
    This._internalResolve(datastring)
  }
  var reject = function (string){
    This._internalReject(string)
  };
  // function executor(resolve, reject){
  //
  //     return this._internalResolve
  //}
  executor(resolve, reject)
}
$Promise.prototype.catch = function(errorCatcher){
  return this.then(null, errorCatcher)
}
$Promise.prototype._internalResolve = function(data){
  if(this._state === 'pending'){
    this._state = 'fulfilled';
    this._value = data;
    var anything = this;
    if(this._pendingDownStreams){
      this._pendingDownStreams._internalResolve(data)
    }
    if(this._handlerGroups){
      this._handlerGroups = [];
    }
    if(this._pendingHandlers){
      this._pendingHandlers.map(function(x){
        return anything._callHandlers(x)
      })
    }
  }
}
$Promise.prototype.then = function(successHandler, errorHandler){
  if(typeof successHandler === 'function' || typeof errorHandler === 'function'){
    var someTHIS = this;
    this._handlerGroups.push({successCb: successHandler, errorCb: errorHandler, downstreamPromise: new $Promise(function(){}
  )})
  if(this._state === 'fulfilled'){
    this._callHandlers(successHandler)
  } else if (this._state === 'pending'){
    this._pendingHandlers.push(successHandler)
    this._pendingHandlersAndErrors.push(errorHandler)
  }
  else if( this._state === 'rejected'){
    if(errorHandler){
      this._callHandlers(errorHandler)
    }
  }
  } else {
    this._handlerGroups.push({successCb: null, errorCb: null, downstreamPromise: new $Promise(function(){}
  )})
  }
  var output = this._handlerGroups[this._handlerGroups.length - 1].downstreamPromise
  this._pendingDownStreams = output
  return output;
}


$Promise.prototype._callHandlers = function(handler){
  // if(this._pendingDownStreams){
  //   console.log("LOOOK HERE:", this._pendingDownStreams._value)
  //   this._pendingDownStreams._callHandlers(handler)
  // }
  handler.call(this, this._value)
}
$Promise.prototype._internalReject = function(reason){
  if(this._state === 'pending'){
  this._value = reason;
  this._state = 'rejected'
  var anything = this;
  if(this._pendingDownStreams){
    this._pendingDownStreams._internalReject(reason)
  }
  if(this._pendingHandlersAndErrors){
    this._pendingHandlersAndErrors.map(function(x){
      return anything._callHandlers(x)
    })
  }
  }
}




/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = $Promise;

So in a Node-based project we could write things like this:

var Promise = require('pledge');
…
var promise = new Promise(function (resolve, reject) { … });
--------------------------------------------------------*/
