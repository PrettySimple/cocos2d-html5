/****************************************************************************
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * plugin manager
 * @class
 *
 */
(function(){

    if(cc === undefined){
        return;
    }

    //Native plugin usage
    var PluginManager = function(){};

    PluginManager.prototype = {
        constructor: PluginManager,

        /**
         * @returns {PluginManager}
         * @export
         */
        getInstance: function(){
            return this;
        },

        /**
         * @param {String} pluginName
         * @export
         */
        loadPlugin: function(pluginName){

        },

        /**
         *
         * @param pluginName
         * @export
         */
        unloadPlugin: function(pluginName){

        }
    };

    var PluginAssembly = function(){};

    PluginAssembly.prototype = {
        constructor: PluginAssembly,

        /**
         * @param {Boolean} debug
         * @export
         */
        setDebugMode: function(debug){},

        /**
         * @param {String} appKey
         * @export
         */
        startSession: function(appKey){},

        /**
         * @param {Boolean} Capture
         * @export
         */
        setCaptureUncaughtException: function(Capture){},

        /**
         * @param {String} funName
         * @param {All} Params
         * @export
         */
        callFuncWithParam: function(funName){
            if(typeof this[funName] === 'function'){
                return this[funName].apply(this, Array.prototype.splice.call(arguments, 1));
            }else{
                cc.log("function is not define");
            }
        },

        /**
         * @param {String} funName
         * @param {All} Params
         * @export
         */
        callStringFuncWithParam: function(funName){
            this.callFuncWithParam.apply(arguments);
        },

        /**
         * @returns {String}
         * @export
         */
        getPluginName: function(){
            return this._name;
        },

        /**
         * @returns {String}
         * @export
         */
        getPluginVersion: function(){
            return this._version;
        }
    };

    /** @export */
    PluginAssembly.extend = function(name, porp){
        var p, prototype = {};
        for(p in PluginAssembly.prototype){
            prototype[p] = PluginAssembly.prototype[p];
        }
        for(p in porp){
            prototype[p] = porp[p];
        }
        var tmp = eval("(function " + name + "Plugin(){})");
        prototype.constructor = tmp;
        tmp.prototype = prototype;
        return tmp;
    };

    //Param
    var Param = function(type, value){
        var paramType = plugin.PluginParam.ParamType,tmpValue;
        switch(type){
            case paramType.TypeInt:
                tmpValue = parseInt(value);
                break;
            case paramType.TypeFloat:
                tmpValue = parseFloat(value);
                break;
            case paramType.TypeBool:
                tmpValue = Boolean(value);
                break;
            case paramType.TypeString:
                tmpValue = String(value);
                break;
            case paramType.TypeStringMap:
                tmpValue = value//JSON.stringify(value);
                break;
            default:
                tmpValue = value;
        }
        return tmpValue
    };

    /** @export */
    Param.ParamType = {
        /** @export */
        TypeInt:1,
        /** @export */
        TypeFloat:2,
        /** @export */
        TypeBool:3,
        /** @export */
        TypeString:4,
        /** @export */
        TypeStringMap:5
    };

    /** @export */
    Param.AdsResultCode = {
        /** @export */
        AdsReceived:0,
        /** @export */
        FullScreenViewShown:1,
        /** @export */
        FullScreenViewDismissed:2,
        /** @export */
        PointsSpendSucceed:3,
        /** @export */
        PointsSpendFailed:4,
        /** @export */
        NetworkError:5,
        /** @export */
        UnknownError:6
    };

    /** @export */
    Param.PayResultCode = {
        /** @export */
        PaySuccess:0,
        /** @export */
        PayFail:1,
        /** @export */
        PayCancel:2,
        /** @export */
        PayTimeOut:3
    };

    /** @export */
    Param.ShareResultCode = {
        /** @export */
        ShareSuccess:0,
        /** @export */
        ShareFail:1,
        /** @export */
        ShareCancel:2,
        /** @export */
        ShareTimeOut:3
    };

    /** @export */
    var PluginList = {};

    /** @export */
    var Plugin = {

        /** @export */
        extend: function(name, extend){
            var config = (cc.game.config && cc.game.config.plugin) || {};
            PluginList[name] = new (PluginAssembly.extend(name, extend));
            typeof PluginList[name].ctor === "function" && PluginList[name].ctor(config[name]);
        },

        /** @export */
        PluginList: PluginList,

        /** @export */
        PluginParam: Param,

        /** @export */
        PluginManager: new PluginManager()

    };

    /** @export */
    window.plugin = Plugin;

})();